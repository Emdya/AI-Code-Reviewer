"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackDashboard = void 0;
const vscode = __importStar(require("vscode"));
class FeedbackDashboard {
    static show(context, feedbackService) {
        if (this.currentPanel) {
            this.currentPanel.reveal();
            return;
        }
        const panel = vscode.window.createWebviewPanel('aiCodeReviewDashboard', 'AI Code Review Dashboard', vscode.ViewColumn.Two, {
            enableScripts: true,
            retainContextWhenHidden: true
        });
        this.updateWebview(panel, feedbackService);
        panel.onDidDispose(() => this.currentPanel = undefined);
        panel.webview.onDidReceiveMessage((message) => __awaiter(this, void 0, void 0, function* () {
            switch (message.command) {
                case 'refresh':
                    this.updateWebview(panel, feedbackService);
                    break;
                case 'clear':
                    yield feedbackService.clearAllFeedback();
                    this.updateWebview(panel, feedbackService);
                    break;
            }
        }));
        this.currentPanel = panel;
    }
    static updateWebview(panel, feedbackService) {
        return __awaiter(this, void 0, void 0, function* () {
            const stats = yield feedbackService.getFeedbackStats();
            const recentFeedback = yield feedbackService.getRecentFeedback();
            panel.webview.html = this.getWebviewContent(stats, recentFeedback);
        });
    }
    static getWebviewContent(stats, recentFeedback) {
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
            <div>${stats.total > 0 ? Math.round((stats.positive / stats.total) * 100) : 0}%</div>
        </div>
        <div class="metric-card">
            <h3>Negative</h3>
            <div class="metric-value negative">${stats.negative}</div>
            <div>${stats.total > 0 ? Math.round((stats.negative / stats.total) * 100) : 0}%</div>
        </div>
    </div>

    <h2>Recent Feedback</h2>
    <div id="feedback-list">
        ${recentFeedback.map(item => {
            var _a;
            return `
            <div class="feedback-item ${item.vote < 0 ? 'negative-item' : ''}">
                <div class="feedback-message">${((_a = item.diagnostic) === null || _a === void 0 ? void 0 : _a.message) || 'No message provided'}</div>
                <div class="feedback-meta">
                    ${item.timestamp ? new Date(item.timestamp).toLocaleString() : ''} • 
                    ${item.fileExtension || 'unknown'} • 
                    ${item.userId || 'anonymous'}
                </div>
            </div>
        `;
        }).join('')}
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
exports.FeedbackDashboard = FeedbackDashboard;
//# sourceMappingURL=dashboard.js.map