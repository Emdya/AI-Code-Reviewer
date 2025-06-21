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
const vscode = __importStar(require("vscode")); /** Imports the full VS code Extension API under the vscode namespace */
class AiCodeActionProvider {
    provideCodeActions(/** Main method required by CodeActionProvider.AiCodeActionProvider
        Triggered by VSCode when the user requests code actions (e.g. clicking a lightbulb)
        Parameters:
        - document - the current open text file
        - range - The selected range in the editor
        - context - Includes diagnostics and triggering information*/ document, range, context) {
        return context.diagnostics /** Filters only the diagnostics that originate from your extension (AI Code Review)
        - For each relevant diagnostic, calls createActions() to generate actionable items. */
            .filter(d => d.source === 'AI Code Review')
            .flatMap(diagnostic => this.createActions(diagnostic)); /** Use .flatmap() to flatten the resulting arrays into one list of actions  */
    }
    createActions(diagnostic) {
        const actions = [];
        // Explain action
        const explainAction = new vscode.CodeAction(/** Creates a CodeAction labeled with the diagnostic message. Type: QuickFix - category used for quick suggestion actions.
            Binds the action to a custom command ai-code-review.explain, passing the diagnostic as an argument. This command should be registered elsewhere in our extension.  */ `Explain: ${diagnostic.message}`, vscode.CodeActionKind.QuickFix);
        explainAction.command = {
            title: 'Explain Issue',
            command: 'ai-code-review.explain',
            arguments: [diagnostic]
        };
        actions.push(explainAction); /** Adds this action to the list of available actions.  */
        // Fix action
        const fixAction = new vscode.CodeAction(/** Same as above, but this time for fixing the issue via ai-code-review,fix */ `Fix: ${diagnostic.message}`, vscode.CodeActionKind.QuickFix);
        fixAction.command = {
            title: 'Fix Issue',
            command: 'ai-code-review.fix',
            arguments: [diagnostic]
        };
        actions.push(fixAction);
        // Optimize action /** Creates an action for code optimization. Category: Refactor, used for transformations or improvements to code structure.  */
        const optimizeAction = new vscode.CodeAction('Optimize this code', vscode.CodeActionKind.Refactor);
        optimizeAction.command = {
            title: 'Optimize Code',
            command: 'ai-code-review.optimize',
            arguments: [diagnostic]
        };
        actions.push(optimizeAction);
        /** Binds it to the ai-code-review.optimize command */
        return actions; /** Returns all the created actions for the given diagnostic.  */
    }
}
exports.AiCodeActionProvider = AiCodeActionProvider;
//# sourceMappingURL=codeActions.js.map