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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiDiagnosticsProvider = void 0;
const vscode = __importStar(require("vscode"));
class AiDiagnosticsProvider {
    constructor(aiService, feedbackService // Make this optional
    ) {
        this.aiService = aiService;
        this.feedbackService = feedbackService;
        this.collection = vscode.languages.createDiagnosticCollection('ai-code-review');
    }
    getDiagnostics(uri) {
        return this.collection.get(uri) || [];
    }
    refresh(document) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const issues = yield this.aiService.analyze(document.getText());
                const diagnostics = this.createDiagnostics(issues, document);
                this.collection.set(document.uri, diagnostics);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Analysis failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
    }
    createDiagnostics(issues, document) {
        return issues.map(issue => {
            const range = new vscode.Range(document.positionAt(issue.range[0]), document.positionAt(issue.range[1]));
            const diagnostic = new vscode.Diagnostic(range, issue.message, this.getSeverity(issue.severity));
            diagnostic.source = 'AI Code Review';
            diagnostic.code = issue.category;
            return diagnostic;
        });
    }
    getSeverity(severity) {
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
exports.AiDiagnosticsProvider = AiDiagnosticsProvider;
//# sourceMappingURL=diagnostics.js.map