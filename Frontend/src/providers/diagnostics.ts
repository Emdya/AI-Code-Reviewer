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

            const diagnostics = this.createDiagnostics(result.issues, document);

            // ✅ Add fallback offline heuristic for "debugger" statements
            const lines = document.getText().split('\n');
            lines.forEach((line, i) => {
                const index = line.indexOf('debugger');
                if (index >= 0) {
                    const range = new vscode.Range(i, index, i, index + 8);
                    const diagnostic = new vscode.Diagnostic(
                        range,
                        "Avoid using 'debugger' in production code.",
                        vscode.DiagnosticSeverity.Warning
                    );
                    diagnostic.source = 'AI Code Review';
                    diagnostic.code = 'ai-debugger';

                    // Optional fix text embedded in diagnostic metadata
                    diagnostic.relatedInformation = [
                        new vscode.DiagnosticRelatedInformation(
                            new vscode.Location(document.uri, range),
                            "Suggested fix: remove 'debugger';"
                        )
                    ];

                    diagnostics.push(diagnostic);
                }
            });

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

            // Optional: attach fix or explanation hint
            if (issue.fix) {
                diagnostic.relatedInformation = [
                    new vscode.DiagnosticRelatedInformation(
                        new vscode.Location(document.uri, range),
                        `Suggested fix: ${issue.fix}`
                    )
                ];
            }

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

    dispose() {
        this.collection.dispose();
    }
}
