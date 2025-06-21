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
exports.AiHoverProvider = void 0;
const vscode = __importStar(require("vscode"));
class AiHoverProvider {
    constructor(diagnosticsProvider) {
        this.diagnosticsProvider = diagnosticsProvider;
    }
    provideHover(document, position, token) {
        const diagnostics = this.diagnosticsProvider
            ? this.diagnosticsProvider.getDiagnostics(document.uri)
            : vscode.languages.getDiagnostics(document.uri);
        const diagnostic = diagnostics.find((d) => d.source === 'AI Code Review' && d.range.contains(position));
        if (!diagnostic) {
            return null;
        }
        const markdown = new vscode.MarkdownString();
        markdown.appendMarkdown(`### AI Code Review\n\n`);
        markdown.appendMarkdown(`**${diagnostic.code}**: ${diagnostic.message}\n\n`);
        // Action buttons
        markdown.appendMarkdown(`[🛠️ Fix](command:ai-code-review.fix?${encodeURIComponent(JSON.stringify(diagnostic))}) | ` +
            `[💡 Explain](command:ai-code-review.explain?${encodeURIComponent(JSON.stringify(diagnostic))}) | ` +
            `[⚡ Optimize](command:ai-code-review.optimize?${encodeURIComponent(JSON.stringify(diagnostic))})\n\n`);
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
        markdown.appendMarkdown(`[👍 Yes](command:ai-code-review.feedback?${encodeURIComponent(JSON.stringify(positiveFeedback))}) | ` +
            `[👎 No](command:ai-code-review.feedback?${encodeURIComponent(JSON.stringify(negativeFeedback))})`);
        markdown.isTrusted = true;
        return new vscode.Hover(markdown, diagnostic.range);
    }
}
exports.AiHoverProvider = AiHoverProvider;
//# sourceMappingURL=hover.js.map