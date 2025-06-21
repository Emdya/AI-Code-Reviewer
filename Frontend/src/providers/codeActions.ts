import * as vscode from 'vscode';
import { AiCodeIssue } from '../services/aiService';

export class AiCodeActionProvider implements vscode.CodeActionProvider {
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range,
        context: vscode.CodeActionContext
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
        return context.diagnostics
            .filter(d => d.source === 'AI Code Review')
            .flatMap(diagnostic => this.createActions(diagnostic));
    }

    private createActions(diagnostic: vscode.Diagnostic): vscode.CodeAction[] {
        const actions: vscode.CodeAction[] = [];

        // Explain action
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

        // Fix action
        const fixAction = new vscode.CodeAction(
            `Fix: ${diagnostic.message}`,
            vscode.CodeActionKind.QuickFix
        );
        fixAction.command = {
            title: 'Fix Issue',
            command: 'ai-code-review.fix',
            arguments: [diagnostic]
        };
        actions.push(fixAction);

        // Optimize action
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
}