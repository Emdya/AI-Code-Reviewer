import * as vscode from 'vscode';
import { LocalAiService } from '../services/localAi';
import { FeedbackService } from '../services/feedbackService';
import { AiCodeIssue } from '../services/aiService';

export class AiDiagnosticsProvider implements vscode.Disposable {
    private collection: vscode.DiagnosticCollection;

    constructor(
        private aiService: LocalAiService,
        private feedbackService?: FeedbackService // Optional for offline/local testing
    ) {
        this.collection = vscode.languages.createDiagnosticCollection('ai-code-review');
    }

    /**
     * Returns diagnostics currently stored for a URI
     */
    getDiagnostics(uri: vscode.Uri): readonly vscode.Diagnostic[] {
        return this.collection.get(uri) || [];
    }

    /**
     * Triggers code analysis and sets diagnostics for the document
     */
    async refresh(document: vscode.TextDocument) {
        try {
            const result = await this.aiService.analyze(document.getText());

            // ✅ FIX: Extract the array of issues before passing
            const diagnostics = this.createDiagnostics(result.issues, document);

            this.collection.set(document.uri, diagnostics);
        } catch (error) {
            vscode.window.showErrorMessage(`AI analysis failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Converts AiCodeIssue[] into VS Code Diagnostic[]
     */
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

    /**
     * Maps custom severity string to VS Code severity enum
     */
    private getSeverity(severity: 'warning' | 'error' | 'info'): vscode.DiagnosticSeverity {
        switch (severity) {
            case 'error': return vscode.DiagnosticSeverity.Error;
            case 'warning': return vscode.DiagnosticSeverity.Warning;
            default: return vscode.DiagnosticSeverity.Information;
        }
    }

    /**
     * Dispose diagnostic collection when cleaning up
     */
    dispose() {
        this.collection.dispose();
    }
}
