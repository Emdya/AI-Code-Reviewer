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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackService = void 0;
const vscode = __importStar(require("vscode"));
const node_fetch_1 = __importDefault(require("node-fetch"));
class FeedbackService {
    constructor(context) {
        this.context = context;
        const config = vscode.workspace.getConfiguration('aiCodeReviewer');
        this.apiBaseUrl = config.get('apiUrl', 'http://localhost:8000/api/v1');
        this.verifyConnection();
    }
    verifyConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield (0, node_fetch_1.default)(`${this.apiBaseUrl}/health`);
                if (!response.ok) {
                    vscode.window.showWarningMessage('Backend connection failed - using local feedback storage');
                }
            }
            catch (error) {
                console.error('Backend connection check failed:', error);
            }
        });
    }
    logFeedback(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.sendToBackend(data);
            }
            catch (error) {
                console.error('Failed to send feedback to backend:', error);
                this.storeLocally(data);
            }
        });
    }
    sendToBackend(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, node_fetch_1.default)(`${this.apiBaseUrl}/feedback`, {
                method: 'POST',
                headers: Object.assign({ 'Content-Type': 'application/json' }, (process.env.API_KEY ? { 'X-API-Key': process.env.API_KEY } : {})),
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
        });
    }
    storeLocally(data) {
        var _a;
        const existingFeedback = this.context.globalState.get('localFeedback') || [];
        const feedbackWithMetadata = Object.assign(Object.assign({}, data), { timestamp: new Date().toISOString(), fileExtension: ((_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.languageId) || '', userId: vscode.env.machineId || 'anonymous' });
        this.context.globalState.update('localFeedback', [...existingFeedback, feedbackWithMetadata])
            .then(() => {
            console.log('Feedback stored locally');
        }, error => {
            console.error('Local feedback storage failed:', error);
        });
    }
    syncLocalFeedback() {
        return __awaiter(this, void 0, void 0, function* () {
            const localFeedback = this.context.globalState.get('localFeedback') || [];
            if (localFeedback.length > 0) {
                try {
                    yield Promise.all(localFeedback.map(feedback => this.sendToBackend(feedback)));
                    yield this.context.globalState.update('localFeedback', []);
                    console.log(`Successfully synced ${localFeedback.length} feedback items`);
                }
                catch (error) {
                    console.error('Failed to sync local feedback:', error);
                }
            }
        });
    }
    // ✅ NEW METHODS for dashboard.ts
    getFeedbackStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const feedback = this.context.globalState.get('localFeedback') || [];
            const total = feedback.length;
            const positive = feedback.filter(f => f.vote > 0).length;
            const negative = feedback.filter(f => f.vote < 0).length;
            return { total, positive, negative };
        });
    }
    getRecentFeedback() {
        return __awaiter(this, void 0, void 0, function* () {
            const feedback = this.context.globalState.get('localFeedback') || [];
            return feedback.slice(-10).reverse(); // Most recent 10 items
        });
    }
    clearAllFeedback() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.context.globalState.update('localFeedback', []);
            console.log('All local feedback cleared');
        });
    }
}
exports.FeedbackService = FeedbackService;
//# sourceMappingURL=feedbackService.js.map