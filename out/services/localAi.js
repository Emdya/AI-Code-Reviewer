"use strict";
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
class LocalAiService {
    constructor() {
        this.commonIssues = [
            {
                pattern: /eval\(.*\)/,
                message: "Potential security vulnerability: using eval()",
                category: "security",
                severity: "error" // or "warning" or "info"
            },
            {
                pattern: /for\s*\(.*;\s*;\s*\)/,
                message: "Infinite loop detected",
                category: "logic",
                severity: "error"
            }
        ];
    }
    analyze(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const issues = [];
            for (const { pattern, message, category, severity } of this.commonIssues) {
                const matches = code.matchAll(pattern);
                for (const match of matches) {
                    if (match.index === undefined)
                        continue;
                    issues.push({
                        message,
                        severity,
                        category,
                        range: [match.index, match.index + match[0].length]
                    });
                }
            }
            return issues;
        });
    }
    explain(issue) {
        return __awaiter(this, void 0, void 0, function* () {
            const explanations = {
                security: "This is a security concern because...",
                logic: "This might cause logical issues because..."
            };
            return explanations[issue.category] || "This is a common issue in AI-generated code.";
        });
    }
    fix(issue, code) {
        return __awaiter(this, void 0, void 0, function* () {
            const fixes = {
                security: "// Fixed: Using safer alternative\ndoSafeThing()",
                logic: "// Fixed: Proper loop condition\nfor (let i = 0; i < limit; i++)"
            };
            return fixes[issue.category] || code.slice(issue.range[0], issue.range[1]);
        });
    }
    optimize(code) {
        return __awaiter(this, void 0, void 0, function* () {
            return `// Optimized version\n${code.replace(/\s+/g, ' ').trim()}`;
        });
    }
}
exports.LocalAiService = LocalAiService;
//# sourceMappingURL=localAi.js.map