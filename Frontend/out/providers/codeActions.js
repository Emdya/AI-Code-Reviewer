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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiCodeActionProvider = void 0;
const vscode = __importStar(require("vscode"));
class AiCodeActionProvider {
    provideCodeActions(document, range, context) {
        return context.diagnostics
            .filter(d => d.source === 'AI Code Review')
            .flatMap(diagnostic => this.createActions(diagnostic));
    }
    createActions(diagnostic) {
        const actions = [];
        // Explain action
        const explainAction = new vscode.CodeAction(`Explain: ${diagnostic.message}`, vscode.CodeActionKind.QuickFix);
        explainAction.command = {
            title: 'Explain Issue',
            command: 'ai-code-review.explain',
            arguments: [diagnostic]
        };
        actions.push(explainAction);
        // Fix action
        const fixAction = new vscode.CodeAction(`Fix: ${diagnostic.message}`, vscode.CodeActionKind.QuickFix);
        fixAction.command = {
            title: 'Fix Issue',
            command: 'ai-code-review.fix',
            arguments: [diagnostic]
        };
        actions.push(fixAction);
        // Optimize action
        const optimizeAction = new vscode.CodeAction('Optimize this code', vscode.CodeActionKind.Refactor);
        optimizeAction.command = {
            title: 'Optimize Code',
            command: 'ai-code-review.optimize',
            arguments: [diagnostic]
        };
        actions.push(optimizeAction);
        return actions;
    }
}
exports.AiCodeActionProvider = AiCodeActionProvider;
//# sourceMappingURL=codeActions.js.map