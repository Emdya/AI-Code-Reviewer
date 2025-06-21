import * as vscode from 'vscode';
import { AiService } from '../services/aiService';
import { AiDiagnosticsProvider } from '../providers/diagnostics';

export function registerCommands(
    context: vscode.ExtensionContext,
    aiService: AiService,
    diagnosticsProvider: AiDiagnosticsProvider
) {
    context.subscriptions.push(
        vscode.commands.registerCommand('ai-code-review.analyze', () => 
            handleAnalyzeCommand(diagnosticsProvider)
        ),
        vscode.commands.registerCommand('ai-code-review.explain', (diagnostic: vscode.Diagnostic) => 
            handleExplainCommand(aiService, diagnostic)
        ),
        vscode.commands.registerCommand('ai-code-review.fix', (diagnostic: vscode.Diagnostic) => 
            handleFixCommand(aiService, diagnostic)
        ),
        vscode.commands.registerCommand('ai-code-review.optimize', (diagnostic: vscode.Diagnostic) => 
            handleOptimizeCommand(aiService, diagnostic)
        )
    );
}

async function handleAnalyzeCommand(diagnosticsProvider: AiDiagnosticsProvider) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('No active editor found');
        return;
    }
    await diagnosticsProvider.refresh(editor.document);
}

async function handleExplainCommand(aiService: AiService, diagnostic: vscode.Diagnostic) {
    const issue = convertDiagnosticToIssue(diagnostic);
    const explanation = await aiService.explain(issue);
    
    const panel = vscode.window.createWebviewPanel(
        'aiCodeExplain',
        'AI Code Explanation',
        vscode.ViewColumn.Beside,
        { enableScripts: true }
    );
    
    panel.webview.html = getWebviewContent(explanation, diagnostic.message);
}

async function handleFixCommand(aiService: AiService, diagnostic: vscode.Diagnostic) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const issue = convertDiagnosticToIssue(diagnostic);
    const code = editor.document.getText();
    const fixedCode = await aiService.fix(issue, code);

    await editor.edit(editBuilder => {
        editBuilder.replace(diagnostic.range, fixedCode);
    });
}

async function handleOptimizeCommand(aiService: AiService, diagnostic: vscode.Diagnostic) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const code = editor.document.getText(diagnostic.range);
    const optimizedCode = await aiService.optimize(code);

    await editor.edit(editBuilder => {
        editBuilder.replace(diagnostic.range, optimizedCode);
    });
}

function convertDiagnosticToIssue(diagnostic: vscode.Diagnostic): AiCodeIssue {
    return {
        message: diagnostic.message,
        severity: diagnostic.severity === vscode.DiagnosticSeverity.Error ? 'error' : 
                 diagnostic.severity === vscode.DiagnosticSeverity.Warning ? 'warning' : 'info',
        range: [diagnostic.range.start.character, diagnostic.range.end.character],
        category: typeof diagnostic.code === 'string' ? diagnostic.code : 'general'
    };
}

function getWebviewContent(explanation: string, title: string): string {
    return `<!DOCTYPE html>
    <html>
    <head>
        <style>
            body { padding: 10px; font-family: Arial, sans-serif; }
            h1 { color: var(--vscode-textPreformat-foreground); }
            pre { background: var(--vscode-textCodeBlock-background); padding: 10px; }
        </style>
    </head>
    <body>
        <h1>${title}</h1>
        <p>${explanation}</p>
    </body>
    </html>`;
}