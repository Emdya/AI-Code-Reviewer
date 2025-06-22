import * as vscode from 'vscode';
import fetch from 'node-fetch';
import { AiDiagnosticsProvider } from './providers/diagnostics';
import { AiCodeActionProvider } from './providers/codeActions';
import { AiHoverProvider } from './providers/hover';
import { LocalAiService } from './services/localAi';
import { EditHistoryService } from './services/editHistoryService';
import { registerCommands } from './commands';
import { FeedbackService } from './services/feedbackService';
import { registerFeedbackCommand } from './commands/feedback';
import { FeedbackDashboard } from './webviews/dashboard';

interface ExplanationResponse {
    explanation: string;
}

interface OptimizeResponse {
    optimized_code: string;
}

export function activate(context: vscode.ExtensionContext) {
    const aiService = new LocalAiService();
    const editHistoryService = new EditHistoryService();
    const feedbackService = new FeedbackService(context);
    const diagnosticsProvider = new AiDiagnosticsProvider(aiService, feedbackService);
    const codeActionProvider = new AiCodeActionProvider();
    const hoverProvider = new AiHoverProvider(diagnosticsProvider);

    // Register commands
    registerCommands(context, aiService, diagnosticsProvider);
    context.subscriptions.push(
        registerFeedbackCommand(context, feedbackService),

        vscode.commands.registerCommand('ai-code-review.showDashboard', () => {
            FeedbackDashboard.show(context, feedbackService);
        }),

        vscode.commands.registerCommand('ai-code-review.detectAI', async () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const document = editor.document;
                const code = document.getText();
                const editHistory = editHistoryService.getEditHistory(document);

                try {
                    console.log('🚀 Analyzing for AI-generated content...');
                    const result = await aiService.detectAI(code, editHistory);
                    console.log('✅ Analysis result:', result);
                    showAIDetectionResults(result);
                } catch (error: any) {
                    console.error('❌ Failed to detect AI:', error.message || error);
                    vscode.window.showErrorMessage('Failed to detect AI-generated code');
                }
            } else {
                vscode.window.showErrorMessage('No active editor found');
            }
        }),

        vscode.commands.registerCommand('ai-code-review.explainLineWithLLM', async (selected: string, fullCode: string) => {
            try {
                const response = await fetch('http://localhost:8000/api/v1/explain', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ selected, context: fullCode })
                });

                const { explanation } = await response.json() as ExplanationResponse;

                if (explanation?.trim()) {
                    vscode.window.showInformationMessage(`💡 Explanation: ${explanation}`);
                } else {
                    vscode.window.showWarningMessage('No explanation returned from LLM.');
                }
            } catch (err: any) {
                vscode.window.showErrorMessage('❌ Failed to fetch explanation from LLM.');
                console.error(err);
            }
        }),

        // ✅ NEW: Optimize selected code using Hugging Face CodeT5
        vscode.commands.registerCommand('ai-code-review.optimizeWithLLM', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active editor.');
                return;
            }

            const selection = editor.selection;
            const code = editor.document.getText(selection.isEmpty ? undefined : selection);
            const language = editor.document.languageId;

            try {
                const response = await fetch('http://localhost:8000/api/v1/optimize-ml', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, language })
                });

                const { optimized_code } = await response.json() as OptimizeResponse;

                await editor.edit(editBuilder => {
                    if (!selection.isEmpty) {
                        editBuilder.replace(selection, optimized_code);
                    } else {
                        const end = new vscode.Position(editor.document.lineCount + 1, 0);
                        editBuilder.insert(end, `\n\n// Optimized by LLM:\n${optimized_code}`);
                    }
                });

                vscode.window.showInformationMessage('✅ Code optimized with LLM.');
            } catch (err) {
                vscode.window.showErrorMessage('❌ Optimization failed.');
                console.error(err);
            }
        })
    );

    // Register language features
    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            { scheme: 'file' },
            codeActionProvider,
            { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
        ),
        vscode.languages.registerHoverProvider(
            { scheme: 'file' },
            hoverProvider
        ),
        diagnosticsProvider,
        editHistoryService
    );

    setupAutoDetection(diagnosticsProvider, editHistoryService);
}

// === Helpers ===

function setupAutoDetection(diagnosticsProvider: AiDiagnosticsProvider, editHistoryService: EditHistoryService) {
    vscode.workspace.onDidOpenTextDocument(document => {
        if (isLikelyAIGenerated(document.getText())) {
            promptForAnalysis(document);
        }
    });

    vscode.workspace.onDidChangeTextDocument(event => {
        const document = event.document;
        const editHistory = editHistoryService.getRecentEdits(document, 3000);
        const largeBlocks = editHistoryService.detectLargeCodeBlocks(document);

        if (largeBlocks.length > 0) {
            setTimeout(() => promptForAIAnalysis(document, editHistory), 1000);
        }

        if (event.contentChanges.some(change => isLikelyAIGenerated(change.text))) {
            setTimeout(() => diagnosticsProvider.refresh(event.document), 300);
        }
    });
}

function isLikelyAIGenerated(text: string): boolean {
    const aiMarkers = [
        'Generated by AI',
        'AI-generated',
        'Model: GPT',
        'AI completion',
        'TODO:',
        'FIXME:',
        'Insert logic here',
        'Add implementation here'
    ];
    return aiMarkers.some(marker => text.includes(marker));
}

function promptForAnalysis(document: vscode.TextDocument) {
    vscode.window.showInformationMessage(
        'AI-generated code detected. Would you like to analyze it?',
        'Analyze', 'Ignore'
    ).then(choice => {
        if (choice === 'Analyze') {
            vscode.commands.executeCommand('ai-code-review.detectAI');
        }
    });
}

function promptForAIAnalysis(document: vscode.TextDocument, editHistory: any[]) {
    vscode.window.showInformationMessage(
        'Large code block detected. This might be AI-generated. Would you like to analyze it?',
        'Analyze', 'Ignore'
    ).then(choice => {
        if (choice === 'Analyze') {
            vscode.commands.executeCommand('ai-code-review.detectAI');
        }
    });
}

function showAIDetectionResults(result: any) {
    const confidence = Math.round(result.ai_confidence * 100);
    const message = result.ai_detected
        ? `⚠️ AI-generated code detected with ${confidence}% confidence`
        : `✅ No AI-generated code detected (${confidence}% confidence)`;

    vscode.window.showInformationMessage(message, 'View Details', 'Apply Fixes').then(choice => {
        if (choice === 'View Details') {
            showAIDetectionDetails(result);
        } else if (choice === 'Apply Fixes') {
            applyAIFixes(result);
        }
    });
}

function showAIDetectionDetails(result: any) {
    const confidence = Math.round(result.ai_confidence * 100);

    const panel = vscode.window.createWebviewPanel(
        'aiDetectionDetails',
        'AI Detection Results',
        vscode.ViewColumn.One,
        {}
    );

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; background: #fefefe; }
                h2 { margin-bottom: 0; }
                .issue { padding: 10px; border-left: 4px solid #d9534f; background: #f8f9fa; margin: 10px 0; }
                .suggestion { color: #6c757d; margin-top: 5px; }
                .fix { color: #28a745; font-family: monospace; margin-top: 5px; }
            </style>
        </head>
        <body>
            <h2>AI Detection Summary</h2>
            <p><strong>AI Detected:</strong> ${result.ai_detected ? 'Yes' : 'No'}</p>
            <p><strong>Confidence:</strong> ${confidence}%</p>

            <h3>Issues:</h3>
            ${result.issues?.map((issue: any) => `
                <div class="issue">
                    <strong>${issue.type}:</strong> ${issue.message}
                    ${issue.suggestion ? `<div class="suggestion">💡 ${issue.suggestion}</div>` : ''}
                    ${issue.fix ? `<div class="fix">🔧 Fix: ${issue.fix}</div>` : ''}
                </div>
            `).join('') || '<p>No issues found.</p>'}

            <h3>Suggestions:</h3>
            <ul>
                ${result.suggestions?.map((s: string) => `<li>${s}</li>`).join('') || '<li>No suggestions available.</li>'}
            </ul>
        </body>
        </html>
    `;

    panel.webview.html = html;
}

function applyAIFixes(result: any) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('No active editor to apply fixes.');
        return;
    }

    const fixes = result.issues
        ?.map((issue: any) => issue.fix)
        .filter((fix: any) => typeof fix === 'string' && fix.trim().length > 0);

    if (!fixes || fixes.length === 0) {
        vscode.window.showInformationMessage('No available fixes to apply.');
        return;
    }

    const combinedFixes = fixes.map((f: string) => f.trim()).join('\n') + '\n\n';

    editor.edit(editBuilder => {
        const topPosition = new vscode.Position(0, 0);
        editBuilder.insert(topPosition, combinedFixes);
    }).then(success => {
        if (success) {
            vscode.window.showInformationMessage('✅ Fixes applied at the top of the file.');
        } else {
            vscode.window.showErrorMessage('❌ Failed to apply fixes.');
        }
    });
}

export function deactivate() {}
