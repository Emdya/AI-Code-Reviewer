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
exports.registerCommands = void 0;
const vscode = __importStar(require("vscode"));
function registerCommands(context, aiService, diagnosticsProvider) {
    context.subscriptions.push(vscode.commands.registerCommand('ai-code-review.analyze', () => handleAnalyzeCommand(diagnosticsProvider)), vscode.commands.registerCommand('ai-code-review.explain', (diagnostic) => handleExplainCommand(aiService, diagnostic)), vscode.commands.registerCommand('ai-code-review.fix', (diagnostic) => handleFixCommand(aiService, diagnostic)), vscode.commands.registerCommand('ai-code-review.optimize', (diagnostic) => handleOptimizeCommand(aiService, diagnostic)));
}
exports.registerCommands = registerCommands;
function handleAnalyzeCommand(diagnosticsProvider) {
    return __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }
        yield diagnosticsProvider.refresh(editor.document);
    });
}
function handleExplainCommand(aiService, diagnostic) {
    return __awaiter(this, void 0, void 0, function* () {
        const issue = convertDiagnosticToIssue(diagnostic);
        const explanation = yield aiService.explain(issue);
        const panel = vscode.window.createWebviewPanel('aiCodeExplain', 'AI Code Explanation', vscode.ViewColumn.Beside, { enableScripts: true });
        panel.webview.html = getWebviewContent(explanation, diagnostic.message);
    });
}
function handleFixCommand(aiService, diagnostic) {
    return __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        const issue = convertDiagnosticToIssue(diagnostic);
        const code = editor.document.getText();
        const fixedCode = yield aiService.fix(issue, code);
        yield editor.edit(editBuilder => {
            editBuilder.replace(diagnostic.range, fixedCode);
        });
    });
}
function handleOptimizeCommand(aiService, diagnostic) {
    return __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        const code = editor.document.getText(diagnostic.range);
        const optimizedCode = yield aiService.optimize(code);
        yield editor.edit(editBuilder => {
            editBuilder.replace(diagnostic.range, optimizedCode);
        });
    });
}
function convertDiagnosticToIssue(diagnostic) {
    return {
        message: diagnostic.message,
        severity: diagnostic.severity === vscode.DiagnosticSeverity.Error ? 'error' :
            diagnostic.severity === vscode.DiagnosticSeverity.Warning ? 'warning' : 'info',
        range: [diagnostic.range.start.character, diagnostic.range.end.character],
        category: typeof diagnostic.code === 'string' ? diagnostic.code : 'general'
    };
}
function getWebviewContent(explanation, title) {
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
//# sourceMappingURL=index.js.map