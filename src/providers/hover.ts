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


        const diagnostic = diagnostics.find(d => 
            d.source === 'AI Code Review' && d.range.contains(position)
        );

        if (!diagnostic) {
            return null;
        }

        const markdown = new vscode.MarkdownString();
        markdown.appendMarkdown(`**AI Code Review**\n\n`);
        markdown.appendMarkdown(`**${diagnostic.code}**: ${diagnostic.message}\n\n`);

        markdown.appendMarkdown(
            `[Explain](command:ai-code-review.explain?${encodeURIComponent(JSON.stringify(diagnostic))}) | ` +
            `[Fix](command:ai-code-review.fix?${encodeURIComponent(JSON.stringify(diagnostic))}) | ` +
            `[Optimize](command:ai-code-review.optimize?${encodeURIComponent(JSON.stringify(diagnostic))})`
        );

        markdown.isTrusted = true;
        return new vscode.Hover(markdown, diagnostic.range);
    }
}