import * as vscode from 'vscode';
import { LocalAiService } from '../services/localAi';
import { FeedbackService } from '../services/feedbackService';
import { AiCodeIssue } from '../services/aiService';

export class AiDiagnosticsProvider implements vscode.Disposable {
    private collection: vscode.DiagnosticCollection;
    
    constructor(
        private aiService: LocalAiService,
        private feedbackService?: FeedbackService  // Make this optional
    ) {
        this.collection = vscode.languages.createDiagnosticCollection('ai-code-review');
    }

    
    getDiagnostics(uri: vscode.Uri): readonly vscode.Diagnostic[] {
        return this.collection.get(uri) || [];
    }

    async refresh(document: vscode.TextDocument) {
        try {
            const issues = await this.aiService.analyze(document.getText());
            const diagnostics = this.createDiagnostics(issues, document);
            this.collection.set(document.uri, diagnostics);
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