import * as vscode from 'vscode';
import fetch from 'node-fetch';


interface FeedbackData {
    diagnostic: {
        code?: string | number;
        message: string;
    };
    vote: number;
}

export class FeedbackService {
    private apiBaseUrl: string;
    private context: vscode.ExtensionContext; // Properly declare the property

    constructor(context: vscode.ExtensionContext) {
        this.context = context; // Store the context properly
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
            timestamp: new Date().toISOString()
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
}