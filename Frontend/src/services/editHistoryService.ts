import * as vscode from 'vscode';
import { EditHistoryEntry } from './aiService';

export class EditHistoryService {
    private editHistory: Map<string, EditHistoryEntry[]> = new Map();
    private documentChangeListener: vscode.Disposable | undefined;

    constructor() {
        this.setupDocumentChangeListener();
    }

    private setupDocumentChangeListener() {
        this.documentChangeListener = vscode.workspace.onDidChangeTextDocument((event) => {
            const document = event.document;
            const uri = document.uri.toString();
            
            if (!this.editHistory.has(uri)) {
                this.editHistory.set(uri, []);
            }
            
            const history = this.editHistory.get(uri)!;
            
            event.contentChanges.forEach(change => {
                const entry: EditHistoryEntry = {
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

    getEditHistory(document: vscode.TextDocument): EditHistoryEntry[] {
        const uri = document.uri.toString();
        return this.editHistory.get(uri) || [];
    }

    clearEditHistory(document: vscode.TextDocument) {
        const uri = document.uri.toString();
        this.editHistory.delete(uri);
    }

    getRecentEdits(document: vscode.TextDocument, timeWindowMs: number = 5000): EditHistoryEntry[] {
        const history = this.getEditHistory(document);
        const now = Date.now();
        return history.filter(entry => now - entry.timestamp < timeWindowMs);
    }

    detectLargeCodeBlocks(document: vscode.TextDocument, threshold: number = 10): EditHistoryEntry[] {
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