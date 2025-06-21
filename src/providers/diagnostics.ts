import * as vscode from 'vscode';
import { AiService, AiCodeIssue } from '../services/aiService';

export class AiDiagnosticsProvider implements vscode.Disposable {
    private collection: vscode.DiagnosticCollection;

    constructor(private aiService: AiService) {
        this.collection = vscode.languages.createDiagnosticCollection('ai-code-review');
    }

    async refresh(document: vscode.TextDocument) {
        try {
            const issues = await this.aiService.analyze(document.getText());
            this.collection.set(document.uri, this.createDiagnostics(issues, document));
        } catch (error) {
            vscode.window.showErrorMessage(`Analysis failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private createDiagnostics(issues: AiCodeIssue[], document: vscode.TextDocument): vscode.Diagnostic[] {
        return issues.map(issue => {
            const range = new vscode.Range(
                document.positionAt(issue.range[0]),
                document.positionAt(issue.range[1])
            );

            const diagnostic = new vscode.Diagnostic(
                range,
                issue.message,
                this.getSeverity(issue.severity)
            );

            diagnostic.source = 'AI Code Review';
            diagnostic.code = issue.category;
            return diagnostic;
        });
    }

    private getSeverity(severity: 'warning' | 'error' | 'info'): vscode.DiagnosticSeverity {
        switch (severity) {
            case 'error': return vscode.DiagnosticSeverity.Error;
            case 'warning': return vscode.DiagnosticSeverity.Warning;
            default: return vscode.DiagnosticSeverity.Information;
        }
    }

    dispose() {
        this.collection.dispose();
    }
}