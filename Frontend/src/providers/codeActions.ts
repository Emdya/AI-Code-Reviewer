import * as vscode from 'vscode';
import { AiCodeIssue } from '../services/aiService';

export class AiCodeActionProvider implements vscode.CodeActionProvider {
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range,
        context: vscode.CodeActionContext
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
        const actions: vscode.CodeAction[] = [];

        const aiDiagnostics = context.diagnostics.filter(d => d.source === 'AI Code Review');
        aiDiagnostics.forEach(diagnostic => {
            actions.push(...this.createActions(diagnostic, document));
        });

        const lineText = document.getText(range);
        if (this.isLineComplex(lineText)) {
            const explainAction = new vscode.CodeAction(
                '💡 Explain this line with AI',
                vscode.CodeActionKind.QuickFix
            );
            explainAction.command = {
                title: 'Explain Code (LLM)',
                command: 'ai-code-review.explainLineWithLLM',
                arguments: [lineText, document.getText()]
            };
            actions.push(explainAction);
        }

        return actions;
    }

    private createActions(diagnostic: vscode.Diagnostic, document: vscode.TextDocument): vscode.CodeAction[] {
        const actions: vscode.CodeAction[] = [];

        // 💡 Explain button
        const explainAction = new vscode.CodeAction(
            `Explain: ${diagnostic.message}`,
            vscode.CodeActionKind.QuickFix
        );
        explainAction.command = {
            title: 'Explain Issue',
            command: 'ai-code-review.explain',
            arguments: [diagnostic]
        };
        actions.push(explainAction);

        // 🛠 Fix if fix suggestion available in relatedInformation
        const fixText = diagnostic.relatedInformation?.[0]?.message;
        if (fixText && fixText.startsWith("Suggested fix:")) {
            const codeFix = new vscode.CodeAction(
                `🔧 Apply fix: ${fixText.replace("Suggested fix:", "").trim()}`,
                vscode.CodeActionKind.QuickFix
            );
            codeFix.edit = new vscode.WorkspaceEdit();
            const replacement = fixText.replace("Suggested fix:", "").trim();

            if (replacement === 'remove \'debugger\';') {
                // Special handling for "debugger" statements
                codeFix.edit.delete(document.uri, diagnostic.range);
            } else {
                // Generic fix: Replace current range with replacement text
                codeFix.edit.replace(document.uri, diagnostic.range, replacement);
            }

            codeFix.diagnostics = [diagnostic];
            actions.push(codeFix);
        }

        // 🧠 Optimize logic command
        const optimizeAction = new vscode.CodeAction(
            'Optimize this code',
            vscode.CodeActionKind.Refactor
        );
        optimizeAction.command = {
            title: 'Optimize Code',
            command: 'ai-code-review.optimize',
            arguments: [diagnostic]
        };
        actions.push(optimizeAction);

        return actions;
    }

    /**
     * Determines if a line is "complex" based on simple heuristics.
     */
    private isLineComplex(line: string): boolean {
        const complexityMarkers = [
            'while', 'try', 'catch', 'setTimeout', 'reduce',
            'Promise', 'async', 'await', 'callback', 'regex', '{', '=>'
        ];
        return complexityMarkers.some(keyword => line.includes(keyword)) || line.length > 80;
    }
}
