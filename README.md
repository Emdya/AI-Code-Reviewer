# Spurhacks

This tool currently supports **Python** code analysis.  
Future updates will include support for **C/C++**, **JavaScript**, and **TypeScript**.

## 🛠 How to Run

1. Download both `analyze.py` and `test.py`.

### 🔍 To Analyze a File

**Windows:**
```bash
type test.py | python analyze.py python
```

**macOS/Linux:**
```bash
cat test.py | python analyze.py python
```

### 🔎 To Analyze a Code Snippet

```bash
echo "{place code here}" | python analyze.py python
```
