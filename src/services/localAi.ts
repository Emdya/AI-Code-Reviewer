import { AiService, AiCodeIssue } from './aiService';

export class LocalAiService implements AiService {
    private commonIssues = [
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

    async analyze(code: string): Promise<AiCodeIssue[]> {
        const issues: AiCodeIssue[] = [];

        for (const { pattern, message, category, severity } of this.commonIssues) {
            const matches = code.matchAll(pattern);
            for (const match of matches) {
                if (match.index === undefined) continue;
                
                issues.push({
                    message,
                    severity,
                    category,
                    range: [match.index, match.index + match[0].length]
                });
            }
        }

        return issues;
    }

    async explain(issue: AiCodeIssue): Promise<string> {
        const explanations: Record<string, string> = {
            security: "This is a security concern because...",
            logic: "This might cause logical issues because..."
        };
        return explanations[issue.category] || "This is a common issue in AI-generated code.";
    }

    async fix(issue: AiCodeIssue, code: string): Promise<string> {
        const fixes: Record<string, string> = {
            security: "// Fixed: Using safer alternative\ndoSafeThing()",
            logic: "// Fixed: Proper loop condition\nfor (let i = 0; i < limit; i++)"
        };
        return fixes[issue.category] || code.slice(issue.range[0], issue.range[1]);
    }

    async optimize(code: string): Promise<string> {
        return `// Optimized version\n${code.replace(/\s+/g, ' ').trim()}`;
    }
}