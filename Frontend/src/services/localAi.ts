import * as vscode from 'vscode';
import fetch from 'node-fetch';
import { AiService, EditHistoryEntry, AIDetectionResult, AiCodeIssue } from './aiService';

export class LocalAiService implements AiService {
    private apiBaseUrl: string;

    constructor() {
        this.apiBaseUrl = 'http://localhost:8000/api/v1'; // Update if hosted elsewhere
    }

    async analyze(code: string, editHistory?: EditHistoryEntry[]): Promise<{
        issues: AiCodeIssue[];
        ai_detection?: AIDetectionResult;
        score?: number;
        explanation?: string;
    }> {
        try {
            const response = await fetch(`${this.apiBaseUrl}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    language: vscode.window.activeTextEditor?.document.languageId || 'javascript',
                    edit_history: editHistory
                })
            });
            const result = await response.json() as any;
            
            return {
                issues: result.issues || [],
                ai_detection: result.ai_detection,
                score: result.score,
                explanation: result.explanation
            };
        } catch (error) {
            vscode.window.showErrorMessage('Failed to analyze code');
            console.error('Analysis error:', error);
            return { issues: [] }; // Fallback
        }
    }

    async detectAI(code: string, editHistory?: EditHistoryEntry[]): Promise<AIDetectionResult> {
        try {
            const response = await fetch(`${this.apiBaseUrl}/detect-ai`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    language: vscode.window.activeTextEditor?.document.languageId || 'javascript',
                    edit_history: editHistory
                })
            });
            return await response.json() as AIDetectionResult;
        } catch (error) {
            vscode.window.showErrorMessage('Failed to detect AI-generated code');
            console.error('AI detection error:', error);
            return {
                ai_detected: false,
                ai_confidence: 0,
                issues: [],
                suggestions: [],
                fixes: []
            };
        }
    }

    async explain(issue: AiCodeIssue): Promise<string> {
        // This could be enhanced to call the backend for detailed explanations
        return issue.suggestion || issue.message;
    }

    async fix(issue: AiCodeIssue, code: string): Promise<string> {
        // This could be enhanced to call the backend for automated fixes
        if (issue.fix) {
            return issue.fix;
        }
        return code; // Return original if no fix available
    }

    async optimize(code: string): Promise<string> {
        try {
            const response = await fetch(`${this.apiBaseUrl}/optimize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    language: vscode.window.activeTextEditor?.document.languageId || 'javascript'
                })
            });
            const data = await response.json() as { optimized_code?: string };
            return data.optimized_code || code;
        } catch (error) {
            vscode.window.showErrorMessage('Failed to optimize code');
            return code; // Return original if optimization fails
        }
    }
}