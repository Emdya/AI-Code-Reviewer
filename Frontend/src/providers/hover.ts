import * as vscode from 'vscode';
import { AiDiagnosticsProvider } from './diagnostics';

export class AiHoverProvider implements vscode.HoverProvider {
    constructor(private diagnosticsProvider?: AiDiagnosticsProvider) {}

    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
        const diagnostics = this.diagnosticsProvider 
            ? this.diagnosticsProvider.getDiagnostics(document.uri)
            : vscode.languages.getDiagnostics(document.uri);

        const diagnostic = diagnostics.find((d: vscode.Diagnostic) => 
            d.source === 'AI Code Review' && d.range.contains(position)
        );

        if (!diagnostic) {
            return null;
        }

        const markdown = new vscode.MarkdownString();
        markdown.appendMarkdown(`### AI Code Review\n\n`);
        markdown.appendMarkdown(`**${diagnostic.code}**: ${diagnostic.message}\n\n`);

        // Action buttons
        markdown.appendMarkdown(
            `[🛠️ Fix](command:ai-code-review.fix?${encodeURIComponent(JSON.stringify(diagnostic))}) | ` +
            `[💡 Explain](command:ai-code-review.explain?${encodeURIComponent(JSON.stringify(diagnostic))}) | ` +
            `[⚡ Optimize](command:ai-code-review.optimize?${encodeURIComponent(JSON.stringify(diagnostic))})\n\n`
        );

        // Feedback section
        markdown.appendMarkdown(`---\n`);
        markdown.appendMarkdown(`**Was this suggestion helpful?**\n\n`);
        
        // Feedback buttons with proper encoding
        const positiveFeedback = {
            diagnostic: {
                code: diagnostic.code,
                message: diagnostic.message,
                range: {
                    start: diagnostic.range.start,
                    end: diagnostic.range.end
                }
            },
            vote: 1
        };

        const negativeFeedback = {
            diagnostic: {
                code: diagnostic.code,
                message: diagnostic.message,
                range: {
                    start: diagnostic.range.start,
                    end: diagnostic.range.end
                }
            },
            vote: -1
        };

        markdown.appendMarkdown(
            `[👍 Yes](command:ai-code-review.feedback?${encodeURIComponent(JSON.stringify(positiveFeedback))}) | ` +
            `[👎 No](command:ai-code-review.feedback?${encodeURIComponent(JSON.stringify(negativeFeedback))})`
        );

        markdown.isTrusted = true;
        return new vscode.Hover(markdown, diagnostic.range);
    }
}