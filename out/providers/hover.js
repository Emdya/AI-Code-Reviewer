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
const vscode = __importStar(require("vscode")); /** Imports all APIs provided by the VS Code Extension API under
the vscode namespace.  */
class AiHoverProvider {
    constructor(diagnosticsProvider) {
        this.diagnosticsProvider = diagnosticsProvider;
    } /** Optional constructor parameter: Accepts an instance of AIDiagnosticsProvider.
    Stores it in a private member for later access. */
    provideHover(/** Implements the required method for the HoverProvider interface. Triggered when a user hovers over text in the editor.
        Takes:
        - document - The current file
        - position - The cursor position where hover occurred
        - token - For cancellation (not used here)
         */ document, position, token) {
        const diagnostics = this.diagnosticsProvider /** Retrieves diagnostics either from the injected AI provider or the built-in vs code editor. This allows the fallback support when no custom provider is available. */
            ? this.diagnosticsProvider.getDiagnostics(document.uri)
            : vscode.languages.getDiagnostics(document.uri);
        const diagnostic = diagnostics.find(d => /**
            Searches through the diagnostics to find one:
            - Whose source is 'AI Code Review'
            - Whose range contains the cursor position
            Returns the first match, if any.
             */ d.source === 'AI Code Review' && d.range.contains(position));
        if (!diagnostic) { /** If no matching diagnostic is found at the hover position, exit without showing a hover tooltip. */
            return null;
        }
        const markdown = new vscode.MarkdownString(); /** Creates a new Markdown string object to define the hover tooltip content.  */
        markdown.appendMarkdown(`**AI Code Review**\n\n`); /** Creates a new Markdown string object to define the hover tooltip content.  */
        markdown.appendMarkdown(`**${diagnostic.code}**: ${diagnostic.message}\n\n`); /** Adds a bold header indicating the source of the tooltip. Adds the diagnostic category (code) and the human-readable error/warning message. */
        markdown.appendMarkdown(/** Appends the markdown links that call commands when clicked
            - Explain, Fix, AND Optimize.
            - Each command receives the diagnostic as a JSON-encoded argument.
            - These commands must be registered in your extension elsewhere to function */ `[Explain](command:ai-code-review.explain?${encodeURIComponent(JSON.stringify(diagnostic))}) | ` +
            `[Fix](command:ai-code-review.fix?${encodeURIComponent(JSON.stringify(diagnostic))}) | ` +
            `[Optimize](command:ai-code-review.optimize?${encodeURIComponent(JSON.stringify(diagnostic))})`);
        markdown.isTrusted = true; /** Allows the markdown to include clickable command links. Necessary for interactice hover elements to function.  */
        return new vscode.Hover(markdown, diagnostic.range); /** Creates and returns a Hover object tied to the diagnostic's range. Displays the formatted tooltip when thw user hovers over the range.  */
    }
}
exports.AiHoverProvider = AiHoverProvider;
//# sourceMappingURL=hover.js.map