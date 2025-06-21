import * as vscode from 'vscode';
import { FeedbackService } from '../services/feedbackService';

export class FeedbackDashboard {
    private static currentPanel: vscode.WebviewPanel | undefined;

    static show(context: vscode.ExtensionContext, feedbackService: FeedbackService) {
        if (this.currentPanel) {
            this.currentPanel.reveal();
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'aiCodeReviewDashboard',
            'AI Code Review Dashboard',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        this.updateWebview(panel, feedbackService);
        
        panel.onDidDispose(() => this.currentPanel = undefined);
        panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'refresh':
                        this.updateWebview(panel, feedbackService);
                        break;
                    case 'clear':
                        await feedbackService.clearAllFeedback();
                        this.updateWebview(panel, feedbackService);
                        break;
                }
            }
        );
    }

    private static async updateWebview(
        panel: vscode.WebviewPanel,
        feedbackService: FeedbackService
    ) {
        const stats = await feedbackService.getFeedbackStats();
        const recentFeedback = await feedbackService.getRecentFeedback();

        panel.webview.html = this.getWebviewContent(stats, recentFeedback);
    }

    private static getWebviewContent(
        stats: any,
        recentFeedback: any[]
    ): string {
        return `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Feedback Dashboard</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    padding: 20px;
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                }
                h1 {
                    color: var(--vscode-textLink-foreground);
                    border-bottom: 1px solid var(--vscode-editorWidget-border);
                    padding-bottom: 10px;
                }
                .metric-container {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .metric-card {
                    flex: 1;
                    background: var(--vscode-editorWidget-background);
                    border: 1px solid var(--vscode-editorWidget-border);
                    border-radius: 4px;
                    padding: 15px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .metric-value {
                    font-size: 24px;
                    font-weight: bold;
                    margin: 10px 0;
                }
                .positive { color: #4CAF50; }
                .negative { color: #F44336; }
                .feedback-item {
                    background: var(--vscode-editorWidget-background);
                    border-left: 4px solid #4CAF50;
                    margin-bottom: 10px;
                    padding: 10px;
                }
                .negative-item {
                    border-left-color: #F44336;
                }
                .feedback-message {
                    font-weight: bold;
                }
                .feedback-meta {
                    font-size: 12px;
                    color: var(--vscode-descriptionForeground);
                }
                button {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 8px 12px;
                    margin: 5px;
                    border-radius: 2px;
                    cursor: pointer;
                }
                button:hover {
                    background: var(--vscode-button-hoverBackground);
                }
            </style>
        </head>
        <body>
            <h1>AI Code Review Feedback</h1>
            
            <div class="metric-container">
                <div class="metric-card">
                    <h3>Total Feedback</h3>
                    <div class="metric-value">${stats.total}</div>
                </div>
                <div class="metric-card">
                    <h3>Positive</h3>
                    <div class="metric-value positive">${stats.positive}</div>
                    <div>${Math.round((stats.positive / stats.total) * 100)}%</div>
                </div>
                <div class="metric-card">
                    <h3>Negative</h3>
                    <div class="metric-value negative">${stats.negative}</div>
                    <div>${Math.round((stats.negative / stats.total) * 100)}%</div>
                </div>
            </div>

            <h2>Recent Feedback</h2>
            <div id="feedback-list">
                ${recentFeedback.map(item => `
                    <div class="feedback-item ${item.vote < 0 ? 'negative-item' : ''}">
                        <div class="feedback-message">${item.diagnostic.message}</div>
                        <div class="feedback-meta">
                            ${new Date(item.timestamp).toLocaleString()} • 
                            ${item.fileExtension} • 
                            ${item.userId}
                        </div>
                    </div>
                `).join('')}
            </div>

            <div style="margin-top: 20px;">
                <button onclick="refreshData()">Refresh</button>
                <button onclick="clearData()">Clear All Data</button>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                function refreshData() {
                    vscode.postMessage({ command: 'refresh' });
                }
                function clearData() {
                    if (confirm('Are you sure you want to delete all feedback data?')) {
                        vscode.postMessage({ command: 'clear' });
                    }
                }
            </script>
        </body>
        </html>`;
    }
}