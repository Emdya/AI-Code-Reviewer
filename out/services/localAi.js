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
exports.LocalAiService = void 0;
const vscode = __importStar(require("vscode"));
const fetch = require('node-fetch');
class LocalAiService {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8000/api/v1'; // Update if hosted elsewhere
    }
    analyze(code) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.apiBaseUrl}/analyze`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code,
                        language: ((_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.languageId) || 'javascript'
                    })
                });
                return yield response.json();
            }
            catch (error) {
                vscode.window.showErrorMessage('Failed to analyze code');
                console.error('Analysis error:', error);
                return { issues: [] }; // Fallback
            }
        });
    }
    optimize(code) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.apiBaseUrl}/optimize`, {
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
                return code;
            }
        });
    }
    explain(issue) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.apiBaseUrl}/explain`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ issue })
                });
                const data = yield response.json();
                return data.explanation || "No explanation provided.";
            }
            catch (error) {
                vscode.window.showErrorMessage('Failed to explain issue');
                return "Unable to retrieve explanation.";
            }
        });
    }
    fix(issue, code) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.apiBaseUrl}/fix`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ issue, code })
                });
                const data = yield response.json();
                return data.fixed_code || code;
            }
            catch (error) {
                vscode.window.showErrorMessage('Failed to fix issue');
                return code;
            }
        });
    }
}
exports.LocalAiService = LocalAiService;
//# sourceMappingURL=localAi.js.map