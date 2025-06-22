import os
import sys
import subprocess
import tempfile
import json
import ast

# Analyze Python code for style, syntax, and basic security issues
def analyze_python(code):
    results = {"flake8": [], "ast": []}

    # Write the input Python code to a temporary .py file
    with tempfile.NamedTemporaryFile(suffix=".py", delete=False, mode='w') as f:
        f.write(code)
        path = f.name

    # Run flake8 linter on the file to detect styling issues, unreachable code, etc.
    flake8_result = subprocess.run(
        ['flake8', path, '--format=%(row)d:%(col)d: %(code)s %(text)s'],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
    )
    # Parse flake8 output into a list of messages
    results['flake8'] = flake8_result.stdout.strip().split('\n') if flake8_result.stdout else []

    # Parse the code with Python's Abstract Syntax Tree (AST) module
    try:
        tree = ast.parse(code)
        for node in ast.walk(tree):
            # Detect insecure use of `eval()` and record its location
            if isinstance(node, ast.Call) and getattr(node.func, 'id', '') == 'eval':
                results['ast'].append(f"Security issue: 'eval' used on line {node.lineno}")
    except SyntaxError as e:
        # If code can't be parsed, note the syntax error
        results['ast'].append(f"Syntax error: {e}")

    return results

# Analyze JavaScript or TypeScript code using ESLint
def analyze_javascript(code):
    # Write the code to a temp .js file in the current directory (VS Code-safe)
    temp_dir = os.path.dirname(__file__)
    with tempfile.NamedTemporaryFile(suffix=".js", delete=False, mode='w', dir=temp_dir) as f:
        f.write(code)
        path = f.name

    # Run ESLint with JSON output format
    result = subprocess.run(
        ['C:\\Users\\olayi\\AppData\\Roaming\\npm\\eslint.cmd', path, '-f', 'json'],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
    )

    try:
        # Return parsed JSON result from ESLint
        return json.loads(result.stdout)
    except:
        # If ESLint fails (e.g., no config), return stderr as a message
        return {"eslint": [result.stderr.strip()]}

# Analyze C/C++ code using clang-tidy
def analyze_cpp(code):
    # Write the code to a temporary .cpp file
    with tempfile.NamedTemporaryFile(suffix=".cpp", delete=False, mode='w') as f:
        f.write(code)
        path = f.name

    # Run clang-tidy with all checks enabled and C++17 standard
    result = subprocess.run(
        ['clang-tidy', path, '-checks=*', '--', '-std=c++17'],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
    )

    # Return each line of clang-tidy's output as a list
    return {"clang-tidy": result.stdout.strip().split('\n')}

# Main execution function: determines language, routes to proper analyzer, and prints result
def main():
    # Get language argument from command line, default to Python
    language = sys.argv[1].lower() if len(sys.argv) > 1 else "python"

    # Read the AI-generated or pasted code from standard input
    code = sys.stdin.read()

    # Route the input code to the appropriate static analysis function
    if language == "python":
        output = analyze_python(code)
    elif language in ["javascript", "js", "typescript", "ts"]:
        output = analyze_javascript(code)
    elif language in ["cpp", "c++", "c"]:
        output = analyze_cpp(code)
    else:
        output = {"error": f"Unsupported language: {language}"}

    # Print the final analysis result as formatted JSON
    print(json.dumps(output, indent=2))

# Script entry point when run directly
if __name__ == "__main__":
    main()
