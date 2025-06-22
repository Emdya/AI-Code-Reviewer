import json
import subprocess
import tempfile
import ast
import hashlib
import autopep8
import jsbeautifier
from typing import Dict, Any, List, Optional
import re
from .ai_detector import AIGeneratedCodeDetector

class CodeOptimizer:
    def __init__(self):
        self.optimizers = {
            'python': self._optimize_python,
            'javascript': self._optimize_javascript,
            'typescript': self._optimize_javascript,
            'cpp': self._optimize_cpp
        }

    def optimize(self, code: str, language: str) -> Dict[str, Any]:
        if language not in self.optimizers:
            return {
                "optimized_code": code,
                "message": f"Unsupported language: {language}"
            }

        try:
            optimized = self.optimizers[language](code)
            return {
                "optimized_code": optimized,
                "message": "Optimization complete",
                "changes": self._calculate_changes(code, optimized)
            }
        except Exception as e:
            return {
                "optimized_code": code,
                "message": f"Optimization failed: {str(e)}"
            }

    def _optimize_python(self, code: str) -> str:
        # Formatting
        optimized = autopep8.fix_code(code, options={'aggressive': 1})
        
        # AST-based optimizations
        tree = ast.parse(code)
        
        # Remove duplicate imports
        imports = set()
        new_body = []
        for node in tree.body:
            if isinstance(node, (ast.Import, ast.ImportFrom)):
                import_str = ast.unparse(node)
                if import_str not in imports:
                    imports.add(import_str)
                    new_body.append(node)
            else:
                new_body.append(node)
        
        if len(new_body) != len(tree.body):
            tree.body = new_body
            optimized = ast.unparse(tree)
        
        return optimized

    def _optimize_javascript(self, code: str) -> str:
        # Formatting
        optimized = jsbeautifier.beautify(code)
        
        # Simple optimizations
        optimized = re.sub(r'===', '==', optimized)  # Loose equality where safe
        optimized = re.sub(r';\s*;', ';', optimized)  # Remove duplicate semicolons
        
        return optimized

    def _optimize_cpp(self, code: str) -> str:
        with tempfile.NamedTemporaryFile(suffix=".cpp", mode='w') as f:
            f.write(code)
            f.flush()
            
            result = subprocess.run(
                ['clang-format', '-style=llvm', f.name],
                stdout=subprocess.PIPE,
                text=True
            )
            return result.stdout.replace("NULL", "nullptr")

    def _calculate_changes(self, original: str, optimized: str) -> Dict[str, int]:
        return {
            "line_changes": len(optimized.splitlines()) - len(original.splitlines()),
            "char_changes": len(optimized) - len(original),
            "whitespace_changes": (
                optimized.count(' ') + optimized.count('\t') - 
                original.count(' ') - original.count('\t')
            )
        }

class CodeAnalyzer:
    def __init__(self):
        self.optimizer = CodeOptimizer()
        self.ai_detector = AIGeneratedCodeDetector()
        self.supported_languages = {
            'python': self._analyze_python,
            'javascript': self._analyze_javascript,
            'typescript': self._analyze_javascript,
            'cpp': self._analyze_cpp
        }

    def analyze(self, code: str, language: str, edit_history: Optional[List[Dict]] = None) -> Dict[str, Any]:
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
            # Regular code analysis
            issues = self.supported_languages[language](code)
            
            # AI-generated code detection
            ai_analysis = self.ai_detector.detect_ai_generated_code(code, language, edit_history or [])
            
            # Combine regular issues with AI-specific issues
            all_issues = issues + ai_analysis.get("issues", [])
            
            return {
                "analysis_id": analysis_id,
                "issues": all_issues,
                "score": self._calculate_score(all_issues),
                "optimized_code": None,
                "explanation": self._generate_explanation(all_issues),
                "ai_detection": {
                    "ai_detected": ai_analysis.get("ai_detected", False),
                    "ai_confidence": ai_analysis.get("ai_confidence", 0.0),
                    "suggestions": ai_analysis.get("suggestions", []),
                    "fixes": ai_analysis.get("fixes", [])
                }
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

    def optimize(self, code: str, language: str) -> Dict[str, Any]:
        return self.optimizer.optimize(code, language)

    def detect_ai_generated(self, code: str, language: str, edit_history: Optional[List[Dict]] = None) -> Dict[str, Any]:
        """Specific method for AI-generated code detection"""
        return self.ai_detector.detect_ai_generated_code(code, language, edit_history or [])

    def _analyze_python(self, code: str) -> List[Dict]:
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
                        "type": parts[2].split()[0],
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

    def _analyze_javascript(self, code: str) -> List[Dict]:
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
                            "severity": self._map_severity(msg['severity'])
                        })
        except Exception as e:
            results.append({
                "type": "error",
                "message": f"ESLint analysis failed: {str(e)}",
                "severity": "high"
            })

        return results

    def _analyze_cpp(self, code: str) -> List[Dict]:
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

    def _map_severity(self, level: int) -> str:
        return {1: "low", 2: "high"}.get(level, "medium")

    def _calculate_score(self, issues: List[Dict]) -> float:
        weights = {"high": 0.5, "medium": 0.3, "low": 0.1}
        penalty = sum(weights.get(issue.get("severity", "medium"), 0) for issue in issues)
        return max(0, 1 - penalty / 5)

    def _generate_explanation(self, issues: List[Dict]) -> str:
        if not issues:
            return "No issues found"
        
        issue_counts = {}
        for issue in issues:
            issue_type = issue.get("type", "unknown")
            issue_counts[issue_type] = issue_counts.get(issue_type, 0) + 1
        
        summary = ", ".join([f"{count} {typ}" for typ, count in issue_counts.items()])
        return f"Found {len(issues)} issues ({summary})"