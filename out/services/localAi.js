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
                severity: "error"
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
            for (const { pattern, message, category, severity } of this.commonIssues) { /*  Loops through each defined issue pattern. **/
                // Preserve all original flags, add 'g' if not present
                const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'; /*  Ensures the regular expression has the 'g' (global) flag, so it can find multiple matches. **/
                const globalPattern = new RegExp(pattern.source, flags); /* Re-creates the regular expression with the correct flags. **/
                const matches = code.matchAll(globalPattern); /*  Uses matchAll() to get an iterable of all pattern matches in the code.**/
                for (const match of matches) { /*  Iterates through each match.
                Skips any matches where the index is undefined (sanity check). **/
                    if (match.index === undefined)
                        continue;
                    issues.push({
                        message,
                        severity,
                        category,
                        range: [match.index, match.index + match[0].length]
                    });
                    /*  For each match:
    
                    Creates an AiCodeIssue object using the pattern metadata.
    
                    range: start and end character indices of the match.
    
                    Pushes it into the issues array.**/
                }
            }
            return issues; /*  After all patterns are checked, returns the full list of detected issues. **/
        });
    }
    explain(issue) {
        return __awaiter(this, void 0, void 0, function* () {
            const explanations = {
                security: "This is a security concern because it can execute arbitrary code at runtime, leading to vulnerabilities.",
                logic: "This might cause logical issues such as infinite loops, crashing the application or browser."
            };
            return explanations[issue.category] || "This is a common issue in AI-generated code."; /*      return explanations[issue.category] || "This is a common issue in AI-generated code.";
    }
     **/
        });
    }
    fix(issue, code) {
        return __awaiter(this, void 0, void 0, function* () {
            const fixes = {
                security: "// Fixed: Using safer alternative\ndoSafeThing();",
                logic: "// Fixed: Proper loop condition\nfor (let i = 0; i < limit; i++)"
                /* Maps issue categories to fixed code snippets.  **/
            };
            return fixes[issue.category] || code.slice(issue.range[0], issue.range[1]); /*  Returns a hardcoded fix or just the matched snippet from the original code as fallback. **/
        });
    }
    optimize(code) {
        return __awaiter(this, void 0, void 0, function* () {
            return `// Optimized version\n${code.replace(/\s+/g, ' ').trim()}`;
        });
    }
}
exports.LocalAiService = LocalAiService;
/*
This mock AI service:

Analyzes code using basic regex patterns.

Explains detected issues.

Suggests fixes with hardcoded alternatives.

Performs basic optimization (e.g., whitespace cleanup).

It's simple, fast, and ideal for local testing before integrating with a real AI backend like OpenAI or Hugging Face.
**/
//# sourceMappingURL=localAi.js.map