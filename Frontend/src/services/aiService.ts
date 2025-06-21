export interface AiCodeIssue {
    message: string;
    severity: 'warning' | 'error' | 'info';
    range: [number, number];
    category: string;
    type?: string;
    line?: number;
    suggestion?: string;
    fix?: string;
}

export interface EditHistoryEntry {
    type: 'insert' | 'delete' | 'replace';
    text: string;
    line: number;
    timestamp: number;
}

export interface AIDetectionResult {
    ai_detected: boolean;
    ai_confidence: number;
    issues: AiCodeIssue[];
    suggestions: string[];
    fixes: Array<{
        type: string;
        line: number;
        original: string;
        fixed: string;
        description: string;
    }>;
}

export interface AiService {
    analyze(code: string, editHistory?: EditHistoryEntry[]): Promise<{
        issues: AiCodeIssue[];
        ai_detection?: AIDetectionResult;
        score?: number;
        explanation?: string;
    }>;
    detectAI(code: string, editHistory?: EditHistoryEntry[]): Promise<AIDetectionResult>;
    explain(issue: AiCodeIssue): Promise<string>;
    fix(issue: AiCodeIssue, code: string): Promise<string>;
    optimize(code: string): Promise<string>;
}