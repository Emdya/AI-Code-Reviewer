import * as vscode from 'vscode';
import fetch from 'node-fetch';


export class LocalAiService {
    private apiBaseUrl: string;

    constructor() {
        this.apiBaseUrl = 'http://localhost:8000/api/v1'; // Update if hosted elsewhere
    }

    async analyze(code: string): Promise<any> {
        try {
            const response = await fetch(`${this.apiBaseUrl}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    language: vscode.window.activeTextEditor?.document.languageId || 'javascript'
                })
            });
            return await response.json();
        } catch (error) {
            vscode.window.showErrorMessage('Failed to analyze code');
            console.error('Analysis error:', error);
            return { issues: [] }; // Fallback
        }
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