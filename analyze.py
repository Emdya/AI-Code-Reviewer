import sys
import subprocess
import tempfile
import json
import ast

def analyze_python(code):
    results = {"flake8": [], "ast": []}

    with tempfile.NamedTemporaryFile(suffix=".py", delete=False, mode='w') as f:
        f.write(code)
        path = f.name

    # Flake8
    flake8_result = subprocess.run(['flake8', path, '--format=%(row)d:%(col)d: %(code)s %(text)s'],
                                   stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    results['flake8'] = flake8_result.stdout.strip().split('\n') if flake8_result.stdout else []

    # AST
    try:
        tree = ast.parse(code)
        for node in ast.walk(tree):
            if isinstance(node, ast.Call) and getattr(node.func, 'id', '') == 'eval':
                results['ast'].append(f"Security issue: 'eval' used on line {node.lineno}")
    except SyntaxError as e:
        results['ast'].append(f"Syntax error: {e}")

    return results


def analyze_javascript(code):
    with tempfile.NamedTemporaryFile(suffix=".js", delete=False, mode='w') as f:
        f.write(code)
        path = f.name

    result = subprocess.run(['eslint', path, '-f', 'json'],
                            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    try:
        return json.loads(result.stdout)
    except:
        return {"eslint": [result.stderr.strip()]}


def analyze_cpp(code):
    with tempfile.NamedTemporaryFile(suffix=".cpp", delete=False, mode='w') as f:
        f.write(code)
        path = f.name

    result = subprocess.run(['clang-tidy', path, '--', '-std=c++17'],
                            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    return {"clang-tidy": result.stdout.strip().split('\n')}

def main():
    # Fallback to 'python' if no language provided
    language = sys.argv[1].lower() if len(sys.argv) > 1 else "python"
    code = sys.stdin.read()

    if language == "python":
        output = analyze_python(code)
    elif language in ["javascript", "js", "typescript", "ts"]:
        output = analyze_javascript(code)
    elif language in ["cpp", "c++", "c"]:
        output = analyze_cpp(code)
    else:
        output = {"error": f"Unsupported language: {language}"}

    print(json.dumps(output, indent=2))

if __name__ == "__main__":
    main()
