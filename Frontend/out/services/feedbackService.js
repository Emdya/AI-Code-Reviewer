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
exports.FeedbackService = void 0;
const vscode = __importStar(require("vscode"));
class FeedbackService {
    constructor(context) {
        this.context = context;
    }
    logFeedback(data) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = yield this.getUserId();
                const record = {
                    timestamp: new Date().toISOString(),
                    diagnostic: {
                        code: data.diagnostic.code,
                        message: data.diagnostic.message,
                        range: data.diagnostic.range
                    },
                    vote: data.vote,
                    fileExtension: ((_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.languageId) || 'unknown',
                    userId,
                    sessionId: FeedbackService.SESSION_ID
                };
                const currentFeedbacks = this.context.globalState.get(FeedbackService.STORAGE_KEY, []);
                yield this.context.globalState.update(FeedbackService.STORAGE_KEY, [...currentFeedbacks, record]);
            }
            catch (error) {
                console.error('Failed to log feedback:', error);
            }
        });
    }
    getFeedbackStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const feedbacks = this.context.globalState.get(FeedbackService.STORAGE_KEY, []);
            const now = Date.now();
            const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
            return {
                total: feedbacks.length,
                positive: feedbacks.filter(f => f.vote > 0).length,
                negative: feedbacks.filter(f => f.vote < 0).length,
                last30Days: {
                    total: feedbacks.filter(f => new Date(f.timestamp).getTime() > thirtyDaysAgo).length,
                    positive: feedbacks.filter(f => f.vote > 0 && new Date(f.timestamp).getTime() > thirtyDaysAgo).length,
                    negative: feedbacks.filter(f => f.vote < 0 && new Date(f.timestamp).getTime() > thirtyDaysAgo).length
                }
            };
        });
    }
    getRecentFeedback(limit = 10) {
        return __awaiter(this, void 0, void 0, function* () {
            const feedbacks = this.context.globalState.get(FeedbackService.STORAGE_KEY, []);
            return feedbacks
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, limit);
        });
    }
    clearAllFeedback() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.context.globalState.update(FeedbackService.STORAGE_KEY, []);
        });
    }
    getUserId() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const session = yield vscode.authentication.getSession('github', ['user:email'], { createIfNone: false });
                return (session === null || session === void 0 ? void 0 : session.account.label) || 'anonymous';
            }
            catch (_a) {
                return 'anonymous';
            }
        });
    }
}
exports.FeedbackService = FeedbackService;
FeedbackService.SESSION_ID = Date.now().toString();
FeedbackService.STORAGE_KEY = 'ai-code-review-feedbacks';
//# sourceMappingURL=feedbackService.js.map