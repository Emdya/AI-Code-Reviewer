import * as vscode from 'vscode';
import fetch from 'node-fetch';
import {
    AiService,
    EditHistoryEntry,
    AIDetectionResult,
    AiCodeIssue
} from './aiService';

interface AnalyzeResponse {
    issues: AiCodeIssue[];
    ai_detection?: AIDetectionResult;
    score?: number;
    explanation?: string;
}

export class LocalAiService implements AiService {
    private apiBaseUrl: string;

    constructor() {
        this.apiBaseUrl = 'http://localhost:8000/api/v1'; // Update if deploying elsewhere
    }

    async analyze(
        code: string,
        editHistory?: EditHistoryEntry[]
    ): Promise<AnalyzeResponse & { failed?: boolean }> {
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

            if (!response.ok) throw new Error(`Server responded with ${response.status}`);

            const result = await response.json() as AnalyzeResponse;

            return {
                issues: result.issues || [],
                ai_detection: result.ai_detection,
                score: result.score,
                explanation: result.explanation
            };
        } catch (error) {
            vscode.window.showErrorMessage('❌ Failed to analyze code.');
            console.error('Analysis error:', error);
            return {
                issues: [],
                failed: true
            };
        }
    }

    async detectAI(
        code: string,
        editHistory?: EditHistoryEntry[]
    ): Promise<AIDetectionResult & { failed?: boolean }> {
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

            if (!response.ok) throw new Error(`Server responded with ${response.status}`);
            return await response.json() as AIDetectionResult;
        } catch (error) {
            vscode.window.showErrorMessage('❌ Failed to detect AI-generated code.');
            console.error('AI detection error:', error);
            return {
                ai_detected: false,
                ai_confidence: 0,
                issues: [],
                suggestions: [],
                fixes: [],
                failed: true
            };
        }
    }

    async explain(issue: AiCodeIssue): Promise<string> {
        // You can enhance this to call `/explain` backend endpoint
        return issue.suggestion || issue.message || 'No explanation available.';
    }

    async fix(issue: AiCodeIssue, code: string): Promise<string> {
        // You can later implement a call to `/fix` backend endpoint
        return issue.fix ?? code;
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

            if (!response.ok) throw new Error(`Server responded with ${response.status}`);

            const data = await response.json() as { optimized_code?: string };
            return data.optimized_code ?? code;
        } catch (error) {
            vscode.window.showErrorMessage('❌ Failed to optimize code.');
            console.error('Optimization error:', error);
            return code;
        }
    }
}
