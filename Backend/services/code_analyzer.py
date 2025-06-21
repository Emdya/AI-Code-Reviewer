import subprocess
import tempfile
import json
import ast
from typing import Dict, Any
import hashlib

class CodeAnalyzer:
    def __init__(self):
        # Initialize any required analyzers
        self.supported_languages = {
            'python': self.analyze_python,
            'javascript': self.analyze_javascript,
            'typescript': self.analyze_javascript,
            'cpp': self.analyze_cpp
        }

    def analyze(self, code: str, language: str, context: str = None) -> Dict[str, Any]:
        """Main analysis entry point"""
        analysis_id = hashlib.md5(code.encode()).hexdigest()
        
        if language not in self.supported_languages:
            return {
                "analysis_id": analysis_id,
                "issues": [{
                    "type": "error",
                    "message": f"Unsupported language: {language}",
                    "severity": "high"
                }],
                "score": 0
            }

        try:
            issues = self.supported_languages[language](code)
            return {
                "analysis_id": analysis_id,
                "issues": issues,
                "score": self._calculate_score(issues),
                "optimized_code": None,
                "explanation": self._generate_explanation(issues)
            }
        except Exception as e:
            return {
                "analysis_id": analysis_id,
                "issues": [{
                    "type": "error",
                    "message": f"Analysis failed: {str(e)}",
                    "severity": "high"
                }],
                "score": 0
            }

    def analyze_python(self, code: str) -> list:
        results = []
        
        with tempfile.NamedTemporaryFile(suffix=".py", delete=False, mode='w') as f:
            f.write(code)
            path = f.name

        # Flake8 analysis
        flake8_result = subprocess.run(
            ['flake8', path, '--format=%(row)d:%(col)d: %(code)s %(text)s'],
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE, 
            text=True
        )
        
        if flake8_result.stdout:
            for line in flake8_result.stdout.strip().split('\n'):
                if ':' in line:
                    parts = line.split(':', 2)
                    results.append({
                        "type": "style",
                        "message": parts[2].strip(),
                        "line": int(parts[0]),
                        "column": int(parts[1]),
                        "severity": "medium"
                    })

        # AST analysis
        try:
            tree = ast.parse(code)
            for node in ast.walk(tree):
                if isinstance(node, ast.Call) and getattr(node.func, 'id', '') == 'eval':
                    results.append({
                        "type": "security",
                        "message": "Use of eval() detected",
                        "line": getattr(node, 'lineno', 0),
                        "severity": "high"
                    })
        except SyntaxError as e:
            results.append({
                "type": "syntax",
                "message": f"Syntax error: {str(e)}",
                "line": getattr(e, 'lineno', 0),
                "severity": "high"
            })

        return results

    def analyze_javascript(self, code: str) -> list:
        results = []
        
        with tempfile.NamedTemporaryFile(suffix=".js", delete=False, mode='w') as f:
            f.write(code)
            path = f.name

        try:
            eslint_result = subprocess.run(
                ['eslint', path, '-f', 'json'],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            if eslint_result.stdout:
                eslint_data = json.loads(eslint_result.stdout)
                for file in eslint_data:
                    for msg in file['messages']:
                        results.append({
                            "type": msg.get('ruleId', 'unknown'),
                            "message": msg['message'],
                            "line": msg['line'],
                            "column": msg['column'],
                            "severity": self._map_eslint_severity(msg['severity'])
                        })
        except Exception as e:
            results.append({
                "type": "error",
                "message": f"ESLint analysis failed: {str(e)}",
                "severity": "high"
            })

        return results

    def analyze_cpp(self, code: str) -> list:
        results = []
        
        with tempfile.NamedTemporaryFile(suffix=".cpp", delete=False, mode='w') as f:
            f.write(code)
            path = f.name

        try:
            clang_result = subprocess.run(
                ['clang-tidy', path, '--', '-std=c++17'],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            if clang_result.stdout:
                for line in clang_result.stdout.strip().split('\n'):
                    if 'warning:' in line or 'error:' in line:
                        results.append({
                            "type": "clang-tidy",
                            "message": line.strip(),
                            "severity": "warning" if 'warning:' in line else "error"
                        })
        except Exception as e:
            results.append({
                "type": "error",
                "message": f"Clang-tidy analysis failed: {str(e)}",
                "severity": "high"
            })

        return results

    def _map_eslint_severity(self, level: int) -> str:
        return {1: "low", 2: "high"}.get(level, "medium")

    def _calculate_score(self, issues: list) -> float:
        weights = {"high": 0.5, "medium": 0.3, "low": 0.1}
        penalty = sum(weights.get(issue.get("severity", "medium"), 0) for issue in issues)
        return max(0, 1 - penalty / 5)  # Cap penalty at 5 issues

    def _generate_explanation(self, issues: list) -> str:
        if not issues:
            return "No issues found"
        
        issue_counts = {}
        for issue in issues:
            issue_type = issue.get("type", "unknown")
            issue_counts[issue_type] = issue_counts.get(issue_type, 0) + 1
        
        summary = ", ".join([f"{count} {typ}" for typ, count in issue_counts.items()])
        return f"Found {len(issues)} issues ({summary})"