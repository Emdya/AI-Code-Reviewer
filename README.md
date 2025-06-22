# AI Code Reviewer

An advanced AI-powered code review system that detects AI-generated code patterns and provides intelligent suggestions for improvement. The system incorporates multiple AI models including SBERT, spaCy, local LLM transformers, and Wikipedia API for comprehensive analysis.

## 🚀 Features

### Enhanced AI Detection
- **SBERT Semantic Analysis**: Uses sentence transformers to detect semantic similarity between comments and known AI-generated patterns
- **spaCy NLP Analysis**: Advanced natural language processing to identify generic language and lack of technical specificity
- **Local LLM Classification**: Uses Hugging Face transformers for text classification of code comments
- **Knowledge Base Verification**: Validates code against programming concepts and best practices
- **Wikipedia Concept Validation**: Verifies technical terms against Wikipedia's knowledge base
- **Edit History Analysis**: Tracks code changes to detect large blocks added at once (typical of AI generation)

### Traditional Pattern Detection
- Placeholder comments (TODO, FIXME, etc.)
- Generic variable names
- Lack of descriptive comments
- AI generation markers
- Overly generic comments

### Code Analysis
- Multi-language support (Python, JavaScript, TypeScript, C++)
- Real-time analysis and suggestions
- Automated fixes and optimizations
- Code quality scoring

### VS Code Integration
- Seamless VS Code extension
- Real-time diagnostics and hover information
- Code action suggestions
- Feedback collection and dashboard

## 🛠️ Installation

### Backend Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Spurhacks
   ```

2. **Install Python dependencies**:
   ```bash
   cd Backend
   pip install -r requirements.txt
   ```

3. **Install AI Model Dependencies** (Optional but recommended):
   ```bash
   python setup_ai_models.py
   ```
   
   This will install:
   - SBERT (Sentence Transformers)
   - spaCy with English language model
   - Hugging Face Transformers
   - Wikipedia API
   - scikit-learn

4. **Start the backend server**:
   ```bash
   python run_server.py
   ```
   
   The server will be available at `http://localhost:8000`

### Frontend Setup

1. **Install Node.js dependencies**:
   ```bash
   cd Frontend
   npm install
   ```

2. **Compile the VS Code extension**:
   ```bash
   npm run compile
   ```

3. **Install the extension in VS Code**:
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Click "Install from VSIX..."
   - Select the compiled extension

## 🔧 Configuration

### Backend Configuration

The backend can be configured through environment variables:

```bash
# API Configuration
API_KEY=your_api_key_here
ANALYSIS_TIMEOUT=30

# AI Model Configuration
ENABLE_SBERT=true
ENABLE_SPACY=true
ENABLE_TRANSFORMERS=true
ENABLE_WIKIPEDIA=true
```

### Frontend Configuration

Configure the VS Code extension in `settings.json`:

```json
{
  "aiCodeReviewer.apiUrl": "http://localhost:8000/api/v1",
  "aiCodeReviewer.enableRealTimeAnalysis": true,
  "aiCodeReviewer.autoDetectAI": true
}
```

## 📊 Enhanced AI Detection Features

### SBERT Semantic Analysis
- Compares code comments with known AI-generated patterns
- Uses cosine similarity to detect semantic matches
- Provides confidence scores for detected patterns

### spaCy NLP Analysis
- Identifies overly generic language in comments
- Detects lack of technical terms and specificity
- Analyzes comment quality and structure

### Local LLM Classification
- Uses DistilBERT for text classification
- Analyzes comment patterns for AI generation indicators
- Provides probability scores for AI-generated content

### Knowledge Base Verification
- Validates function and class names against programming best practices
- Checks for meaningful naming conventions
- Suggests improvements for generic names

### Wikipedia Concept Validation
- Verifies technical terms against Wikipedia's knowledge base
- Ensures proper use of programming terminology
- Identifies potentially incorrect or non-standard terms

## 🧪 Testing

### Test Enhanced AI Detection

Run the comprehensive test suite:

```bash
cd Backend
python test_enhanced_ai_detection.py
```

This will test:
- SBERT semantic similarity analysis
- spaCy NLP analysis
- Local LLM classification
- Knowledge base verification
- Wikipedia concept validation
- Edit history analysis

### Test Basic Functionality

```bash
cd Backend
python test_ai_detection.py
```

### Test API Endpoints

```bash
# Health check
curl http://localhost:8000/health

# Analyze code
curl -X POST http://localhost:8000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"code": "def hello(): return \"world\"", "language": "python"}'

# Detect AI-generated code
curl -X POST http://localhost:8000/api/v1/detect-ai \
  -H "Content-Type: application/json" \
  -d '{"code": "def x(): return y", "language": "python"}'
```

## 📈 Usage Examples

### Python Code Analysis

```python
# AI-generated code (will be detected)
def process_data(data):
    # TODO: Implement data processing
    # This function does something
    result = []
    for item in data:
        # Add logic here
        result.append(item * 2)
    return result

# Well-written code (low AI detection)
def calculate_discount_price(original_price: float, discount_percentage: float) -> float:
    """
    Calculate the final price after applying a discount.
    
    Args:
        original_price: The original price of the item
        discount_percentage: The discount percentage (0-100)
    
    Returns:
        The final price after discount
    
    Raises:
        ValueError: If discount_percentage is not between 0 and 100
    """
    if not 0 <= discount_percentage <= 100:
        raise ValueError("Discount percentage must be between 0 and 100")
    
    discount_amount = original_price * (discount_percentage / 100)
    final_price = original_price - discount_amount
    
    return round(final_price, 2)
```

### JavaScript Code Analysis

```javascript
// AI-generated code (will be detected)
function processUserData(userData) {
    // This function processes user data
    let x = [];
    let y = {};
    
    // TODO: Add validation
    for (let i = 0; i < userData.length; i++) {
        x.push(userData[i]);
    }
    
    return x;
}

// Well-written code (low AI detection)
function calculateTotalPrice(items, taxRate) {
    /**
     * Calculate the total price including tax for a list of items.
     * 
     * @param {Array} items - Array of items with price properties
     * @param {number} taxRate - Tax rate as a decimal (e.g., 0.08 for 8%)
     * @returns {number} Total price including tax
     */
    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const taxAmount = subtotal * taxRate;
    return subtotal + taxAmount;
}
```

## 🔍 API Reference

### Analyze Code
```http
POST /api/v1/analyze
Content-Type: application/json

{
  "code": "your code here",
  "language": "python|javascript|typescript|cpp",
  "edit_history": [
    {
      "type": "insert|delete|replace",
      "text": "code text",
      "line": 1,
      "timestamp": 1234567890
    }
  ]
}
```

### Detect AI-Generated Code
```http
POST /api/v1/detect-ai
Content-Type: application/json

{
  "code": "your code here",
  "language": "python|javascript|typescript|cpp",
  "edit_history": []
}
```

### Optimize Code
```http
POST /api/v1/optimize
Content-Type: application/json

{
  "code": "your code here",
  "language": "python|javascript|typescript|cpp"
}
```

## 🎯 AI Detection Scores

The enhanced AI detector provides detailed scores from multiple models:

- **Semantic Score**: SBERT similarity analysis (0-100%)
- **NLP Score**: spaCy language analysis (0-100%)
- **LLM Score**: Local transformer classification (0-100%)
- **Knowledge Score**: Programming concept validation (0-100%)
- **Wiki Score**: Wikipedia term verification (0-100%)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Sentence Transformers](https://www.sbert.net/) for semantic similarity analysis
- [spaCy](https://spacy.io/) for natural language processing
- [Hugging Face Transformers](https://huggingface.co/transformers/) for local LLM capabilities
- [Wikipedia API](https://pypi.org/project/Wikipedia-API/) for concept validation
- [FastAPI](https://fastapi.tiangolo.com/) for the backend API
- [VS Code Extension API](https://code.visualstudio.com/api) for the frontend integration 