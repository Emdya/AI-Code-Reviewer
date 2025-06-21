import * as vscode from 'vscode';

interface DiagnosticInfo {
    code?: string | number;
    message: string;
    range?: {
        start: vscode.Position;
        end: vscode.Position;
    };
}

export interface FeedbackRecord {
    timestamp: string;
    diagnostic: DiagnosticInfo;
    vote: number;
    fileExtension: string;
    userId: string;
    sessionId: string;
}

export class FeedbackService {
    private static SESSION_ID = Date.now().toString();
    private static STORAGE_KEY = 'ai-code-review-feedbacks';

    constructor(private context: vscode.ExtensionContext) {}

    public async logFeedback(data: {
        diagnostic: DiagnosticInfo;
        vote: number;
    }): Promise<void> {
        try {
            const userId = await this.getUserId();
            const record: FeedbackRecord = {
                timestamp: new Date().toISOString(),
                diagnostic: {
                    code: data.diagnostic.code,
                    message: data.diagnostic.message,
                    range: data.diagnostic.range
                },
                vote: data.vote,
                fileExtension: vscode.window.activeTextEditor?.document.languageId || 'unknown',
                userId,
                sessionId: FeedbackService.SESSION_ID
            };

            const currentFeedbacks = this.context.globalState.get<FeedbackRecord[]>(
                FeedbackService.STORAGE_KEY,
                []
            );

            await this.context.globalState.update(
                FeedbackService.STORAGE_KEY,
                [...currentFeedbacks, record]
            );
        } catch (error) {
            console.error('Failed to log feedback:', error);
        }
    }

    public async getFeedbackStats(): Promise<{
        total: number;
        positive: number;
        negative: number;
        last30Days: {
            total: number;
            positive: number;
            negative: number;
        };
    }> {
        const feedbacks = this.context.globalState.get<FeedbackRecord[]>(
            FeedbackService.STORAGE_KEY,
            []
        );

        const now = Date.now();
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

        return {
            total: feedbacks.length,
            positive: feedbacks.filter(f => f.vote > 0).length,
            negative: feedbacks.filter(f => f.vote < 0).length,
            last30Days: {
                total: feedbacks.filter(f => 
                    new Date(f.timestamp).getTime() > thirtyDaysAgo
                ).length,
                positive: feedbacks.filter(f => 
                    f.vote > 0 && new Date(f.timestamp).getTime() > thirtyDaysAgo
                ).length,
                negative: feedbacks.filter(f => 
                    f.vote < 0 && new Date(f.timestamp).getTime() > thirtyDaysAgo
                ).length
            }
        };
    }

    public async getRecentFeedback(limit = 10): Promise<FeedbackRecord[]> {
        const feedbacks = this.context.globalState.get<FeedbackRecord[]>(
            FeedbackService.STORAGE_KEY,
            []
        );

        return feedbacks
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);
    }

    public async clearAllFeedback(): Promise<void> {
        await this.context.globalState.update(FeedbackService.STORAGE_KEY, []);
    }

    private async getUserId(): Promise<string> {
        try {
            const session = await vscode.authentication.getSession(
                'github',
                ['user:email'],
                { createIfNone: false }
            );
            return session?.account.label || 'anonymous';
        } catch {
            return 'anonymous';
        }
    }
}