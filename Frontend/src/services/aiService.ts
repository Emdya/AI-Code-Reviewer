export interface AiCodeIssue {
    message: string;
    severity: 'warning' | 'error' | 'info';
    range: [number, number];
    category: string;
}

export interface AiService {
    analyze(code: string): Promise<AiCodeIssue[]>;
    explain(issue: AiCodeIssue): Promise<string>;
    fix(issue: AiCodeIssue, code: string): Promise<string>;
    optimize(code: string): Promise<string>;
}