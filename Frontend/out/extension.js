"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const diagnostics_1 = require("./providers/diagnostics");
const codeActions_1 = require("./providers/codeActions");
const hover_1 = require("./providers/hover");
const localAi_1 = require("./services/localAi");
const editHistoryService_1 = require("./services/editHistoryService");
const commands_1 = require("./commands");
const feedbackService_1 = require("./services/feedbackService");
const feedback_1 = require("./commands/feedback");
const dashboard_1 = require("./webviews/dashboard");
function activate(context) {
    const aiService = new localAi_1.LocalAiService();
    const editHistoryService = new editHistoryService_1.EditHistoryService();
    const feedbackService = new feedbackService_1.FeedbackService(context);
    const diagnosticsProvider = new diagnostics_1.AiDiagnosticsProvider(aiService, feedbackService);
    const codeActionProvider = new codeActions_1.AiCodeActionProvider();
    const hoverProvider = new hover_1.AiHoverProvider(diagnosticsProvider);
    // Register commands - FIXED: Don't use spread operator with void
    (0, commands_1.registerCommands)(context, aiService, diagnosticsProvider); // This now stands alone
    context.subscriptions.push((0, feedback_1.registerFeedbackCommand)(context, feedbackService), vscode.commands.registerCommand('ai-code-review.showDashboard', () => {
        dashboard_1.FeedbackDashboard.show(context, feedbackService);
    }), vscode.commands.registerCommand('ai-code-review.detectAI', () => __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const code = document.getText();
            const editHistory = editHistoryService.getEditHistory(document);
            try {
                const result = yield aiService.detectAI(code, editHistory);
                showAIDetectionResults(result);
            }
            catch (error) {
                vscode.window.showErrorMessage('Failed to detect AI-generated code');
            }
        }
    })));
    // Register providers
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider({ scheme: 'file' }, codeActionProvider, { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }), vscode.languages.registerHoverProvider({ scheme: 'file' }, hoverProvider), diagnosticsProvider, editHistoryService);
    // Setup auto-detection
    setupAutoDetection(diagnosticsProvider, editHistoryService);
}
exports.activate = activate;
function setupAutoDetection(diagnosticsProvider, editHistoryService) {
    vscode.workspace.onDidOpenTextDocument(document => {
        if (isLikelyAIGenerated(document.getText())) {
            promptForAnalysis(document);
        }
    });
    vscode.workspace.onDidChangeTextDocument(event => {
        const document = event.document;
        const editHistory = editHistoryService.getRecentEdits(document, 3000); // Last 3 seconds
        // Check for large code blocks that might be AI-generated
        const largeBlocks = editHistoryService.detectLargeCodeBlocks(document);
        if (largeBlocks.length > 0) {
            setTimeout(() => {
                promptForAIAnalysis(document, editHistory);
            }, 1000);
        }
        if (event.contentChanges.some(change => isLikelyAIGenerated(change.text))) {
            setTimeout(() => diagnosticsProvider.refresh(event.document), 300);
        }
    });
}
function isLikelyAIGenerated(text) {
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
function promptForAnalysis(document) {
    vscode.window.showInformationMessage('AI-generated code detected. Would you like to analyze it?', 'Analyze', 'Ignore').then(choice => {
        if (choice === 'Analyze') {
            vscode.commands.executeCommand('ai-code-review.analyze');
        }
    });
}
function promptForAIAnalysis(document, editHistory) {
    vscode.window.showInformationMessage('Large code block detected. This might be AI-generated. Would you like to analyze it?', 'Analyze', 'Ignore').then(choice => {
        if (choice === 'Analyze') {
            vscode.commands.executeCommand('ai-code-review.detectAI');
        }
    });
}
function showAIDetectionResults(result) {
    const confidence = Math.round(result.ai_confidence * 100);
    const message = result.ai_detected
        ? `AI-generated code detected with ${confidence}% confidence`
        : `No AI-generated code detected (${confidence}% confidence)`;
    const severity = result.ai_detected ? 'warning' : 'info';
    vscode.window.showInformationMessage(message, 'View Details', 'Apply Fixes').then(choice => {
        if (choice === 'View Details') {
            showAIDetectionDetails(result);
        }
        else if (choice === 'Apply Fixes') {
            applyAIFixes(result);
        }
    });
}
function showAIDetectionDetails(result) {
    const panel = vscode.window.createWebviewPanel('aiDetectionDetails', 'AI Detection Results', vscode.ViewColumn.One, {});
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AI Detection Results</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .issue { margin: 10px 0; padding: 10px; border-left: 4px solid #ff6b6b; background: #f8f9fa; }
                .suggestion { margin: 5px 0; color: #495057; }
                .fix { margin: 5px 0; color: #28a745; font-family: monospace; }
            </style>
        </head>
        <body>
            <h2>AI Detection Results</h2>
            <p><strong>AI Detected:</strong> ${result.ai_detected ? 'Yes' : 'No'}</p>
            <p><strong>Confidence:</strong> ${Math.round(result.ai_confidence * 100)}%</p>
            
            <h3>Issues Found:</h3>
            ${result.issues.map((issue) => `
                <div class="issue">
                    <strong>${issue.type}:</strong> ${issue.message}
                    ${issue.suggestion ? `<div class="suggestion">Suggestion: ${issue.suggestion}</div>` : ''}
                    ${issue.fix ? `<div class="fix">Fix: ${issue.fix}</div>` : ''}
                </div>
            `).join('')}
            
            <h3>Suggestions:</h3>
            <ul>
                ${result.suggestions.map((suggestion) => `<li>${suggestion}</li>`).join('')}
            </ul>
        </body>
        </html>
    `;
    panel.webview.html = html;
}
function applyAIFixes(result) {
    // This would apply the suggested fixes to the current document
    vscode.window.showInformationMessage('Fix application feature coming soon!');
}
function deactivate() { }
exports.deactivate = deactivate;
/* Summary:
- Bootstraps your extension by wiring together services and providers.
- Registers UI integrations (hover, diagnostics, code actions).
- Adds background listeners to proactively detect AI-generated content.
- Provides interactive prompts to let the user trigger analysis.
 **/ 
//# sourceMappingURL=extension.js.map