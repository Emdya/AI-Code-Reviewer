import * as vscode from 'vscode';
import fetch from 'node-fetch';

interface FeedbackData {
    diagnostic: {
        code?: string | number;
        message: string;
    };
    vote: number;
    timestamp?: string;
    fileExtension?: string;
    userId?: string;
}

export class FeedbackService {
    private apiBaseUrl: string;
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        const config = vscode.workspace.getConfiguration('aiCodeReviewer');
        this.apiBaseUrl = config.get<string>('apiUrl', 'http://localhost:8000/api/v1');
        this.verifyConnection();
    }

    private async verifyConnection(): Promise<void> {
        try {
            const response = await fetch(`${this.apiBaseUrl}/health`);
            if (!response.ok) {
                vscode.window.showWarningMessage('Backend connection failed - using local feedback storage');
            }
        } catch (error) {
            console.error('Backend connection check failed:', error);
        }
    }

    public async logFeedback(data: FeedbackData): Promise<void> {
        try {
            await this.sendToBackend(data);
        } catch (error) {
            console.error('Failed to send feedback to backend:', error);
            this.storeLocally(data);
        }
    }

    private async sendToBackend(data: FeedbackData): Promise<void> {
        const response = await fetch(`${this.apiBaseUrl}/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(process.env.API_KEY ? { 'X-API-Key': process.env.API_KEY } : {})
            },
            body: JSON.stringify({
                analysis_id: data.diagnostic.code,
                vote: data.vote,
                comment: data.diagnostic.message,
                source: 'vscode-extension'
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    }

    private storeLocally(data: FeedbackData): void {
        const existingFeedback = this.context.globalState.get<FeedbackData[]>('localFeedback') || [];
        const feedbackWithMetadata = {
            ...data,
            timestamp: new Date().toISOString(),
            fileExtension: vscode.window.activeTextEditor?.document.languageId || '',
            userId: vscode.env.machineId || 'anonymous'
        };

        this.context.globalState.update('localFeedback', [...existingFeedback, feedbackWithMetadata])
            .then(() => {
                console.log('Feedback stored locally');
            }, error => {
                console.error('Local feedback storage failed:', error);
            });
    }

    public async syncLocalFeedback(): Promise<void> {
        const localFeedback = this.context.globalState.get<FeedbackData[]>('localFeedback') || [];

        if (localFeedback.length > 0) {
            try {
                await Promise.all(localFeedback.map(feedback => this.sendToBackend(feedback)));
                await this.context.globalState.update('localFeedback', []);
                console.log(`Successfully synced ${localFeedback.length} feedback items`);
            } catch (error) {
                console.error('Failed to sync local feedback:', error);
            }
        }
    }

    // ✅ NEW METHODS for dashboard.ts

    public async getFeedbackStats(): Promise<{ total: number; positive: number; negative: number }> {
        const feedback = this.context.globalState.get<FeedbackData[]>('localFeedback') || [];
        const total = feedback.length;
        const positive = feedback.filter(f => f.vote > 0).length;
        const negative = feedback.filter(f => f.vote < 0).length;

        return { total, positive, negative };
    }

    public async getRecentFeedback(): Promise<FeedbackData[]> {
        const feedback = this.context.globalState.get<FeedbackData[]>('localFeedback') || [];
        return feedback.slice(-10).reverse(); // Most recent 10 items
    }

    public async clearAllFeedback(): Promise<void> {
        await this.context.globalState.update('localFeedback', []);
        console.log('All local feedback cleared');
    }
}
