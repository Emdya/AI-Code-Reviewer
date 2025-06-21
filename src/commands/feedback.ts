// Updated feedback command handler
import * as vscode from 'vscode';
import { FeedbackService } from '../services/feedbackService';

export function registerFeedbackCommand(
    context: vscode.ExtensionContext,
    feedbackService: FeedbackService
) {
    return vscode.commands.registerCommand('ai-code-review.feedback', async (data) => {
        await feedbackService.logFeedback({
            diagnostic: {
                code: data.diagnostic.code,
                message: data.diagnostic.message
            },
            vote: data.vote
        });
        
        vscode.window.showInformationMessage(
            `Feedback submitted ${data.vote === 1 ? '👍' : '👎'}`
        );
    });
}