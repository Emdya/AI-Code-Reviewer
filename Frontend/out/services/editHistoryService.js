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
exports.EditHistoryService = void 0;
const vscode = __importStar(require("vscode"));
class EditHistoryService {
    constructor() {
        this.editHistory = new Map();
        this.setupDocumentChangeListener();
    }
    setupDocumentChangeListener() {
        this.documentChangeListener = vscode.workspace.onDidChangeTextDocument((event) => {
            const document = event.document;
            const uri = document.uri.toString();
            if (!this.editHistory.has(uri)) {
                this.editHistory.set(uri, []);
            }
            const history = this.editHistory.get(uri);
            event.contentChanges.forEach(change => {
                const entry = {
                    type: change.rangeLength > 0 ? 'replace' : 'insert',
                    text: change.text,
                    line: change.range.start.line + 1,
                    timestamp: Date.now()
                };
                history.push(entry);
                // Keep only last 100 entries per document
                if (history.length > 100) {
                    history.splice(0, history.length - 100);
                }
            });
        });
    }
    getEditHistory(document) {
        const uri = document.uri.toString();
        return this.editHistory.get(uri) || [];
    }
    clearEditHistory(document) {
        const uri = document.uri.toString();
        this.editHistory.delete(uri);
    }
    getRecentEdits(document, timeWindowMs = 5000) {
        const history = this.getEditHistory(document);
        const now = Date.now();
        return history.filter(entry => now - entry.timestamp < timeWindowMs);
    }
    detectLargeCodeBlocks(document, threshold = 10) {
        const history = this.getEditHistory(document);
        return history.filter(entry => {
            if (entry.type === 'insert') {
                const lines = entry.text.split('\n');
                return lines.length > threshold;
            }
            return false;
        });
    }
    dispose() {
        if (this.documentChangeListener) {
            this.documentChangeListener.dispose();
        }
        this.editHistory.clear();
    }
}
exports.EditHistoryService = EditHistoryService;
//# sourceMappingURL=editHistoryService.js.map