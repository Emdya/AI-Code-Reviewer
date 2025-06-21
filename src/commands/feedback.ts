// Updated feedback command handler
import * as vscode from 'vscode';
import { FeedbackService } from '../services/feedbackService';

export function registerFeedbackCommand(
    context: vscode.ExtensionContext,
    feedbackService: FeedbackService
) {
    return vscode.commands.registerCommand('ai-code-review.feedback', async (data) => {
        try {
            await feedbackService.logFeedback({
                diagnostic: {
                    code: data.diagnostic.code,
                    message: data.diagnostic.message,
                    range: data.diagnostic.range
                },
                vote: data.vote
            });

            vscode.window.showInformationMessage(
                `Thank you for your feedback! ${data.vote === 1 ? '👍' : '👎'}`
            );
        } catch (error) {
            console.error('Feedback error:', error);
            vscode.window.showErrorMessage(
                'Failed to save feedback. Please try again.'
            );
        }
    });
}