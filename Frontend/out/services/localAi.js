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
exports.LocalAiService = void 0;
const vscode = __importStar(require("vscode"));
const node_fetch_1 = __importDefault(require("node-fetch"));
class LocalAiService {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8000/api/v1'; // Update if hosted elsewhere
    }
    analyze(code, editHistory) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield (0, node_fetch_1.default)(`${this.apiBaseUrl}/analyze`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code,
                        language: ((_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.languageId) || 'javascript',
                        edit_history: editHistory
                    })
                });
                const result = yield response.json();
                return {
                    issues: result.issues || [],
                    ai_detection: result.ai_detection,
                    score: result.score,
                    explanation: result.explanation
                };
            }
            catch (error) {
                vscode.window.showErrorMessage('Failed to analyze code');
                console.error('Analysis error:', error);
                return { issues: [] }; // Fallback
            }
        });
    }
    detectAI(code, editHistory) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield (0, node_fetch_1.default)(`${this.apiBaseUrl}/detect-ai`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code,
                        language: ((_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.languageId) || 'javascript',
                        edit_history: editHistory
                    })
                });
                return yield response.json();
            }
            catch (error) {
                vscode.window.showErrorMessage('Failed to detect AI-generated code');
                console.error('AI detection error:', error);
                return {
                    ai_detected: false,
                    ai_confidence: 0,
                    issues: [],
                    suggestions: [],
                    fixes: []
                };
            }
        });
    }
    explain(issue) {
        return __awaiter(this, void 0, void 0, function* () {
            // This could be enhanced to call the backend for detailed explanations
            return issue.suggestion || issue.message;
        });
    }
    fix(issue, code) {
        return __awaiter(this, void 0, void 0, function* () {
            // This could be enhanced to call the backend for automated fixes
            if (issue.fix) {
                return issue.fix;
            }
            return code; // Return original if no fix available
        });
    }
    optimize(code) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield (0, node_fetch_1.default)(`${this.apiBaseUrl}/optimize`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code,
                        language: ((_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.languageId) || 'javascript'
                    })
                });
                const data = yield response.json();
                return data.optimized_code || code;
            }
            catch (error) {
                vscode.window.showErrorMessage('Failed to optimize code');
                return code; // Return original if optimization fails
            }
        });
    }
}
exports.LocalAiService = LocalAiService;
//# sourceMappingURL=localAi.js.map