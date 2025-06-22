#!/usr/bin/env python3
"""
Enhanced test script to demonstrate AI-generated code detection features
with SBERT, spaCy, local LLM transformers, and Wikipedia API
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.ai_detector import AIGeneratedCodeDetector

def test_enhanced_ai_detection():
    """Test the enhanced AI detection with various sample code snippets"""
    
    print("🚀 Enhanced AI Code Detection Test")
    print("=" * 50)
    print("Testing SBERT, spaCy, local LLM transformers, and Wikipedia API integration")
    print()
    
    detector = AIGeneratedCodeDetector()
    
    # Test 1: Code with semantic similarity issues (SBERT analysis)
    semantic_code = '''
def process_data(data):
    # This function does something with the data
    # This method performs an operation
    result = []
    for item in data:
        # This variable stores a value
        result.append(item * 2)
    return result
'''
    
    print("=== Test 1: Semantic Similarity Analysis (SBERT) ===")
    result = detector.detect_ai_generated_code(semantic_code, 'python')
    print(f"AI Detected: {result['ai_detected']}")
    print(f"Confidence: {result['ai_confidence']:.2%}")
    print("AI Analysis Scores:")
    if 'ai_analysis' in result:
        ai_analysis = result['ai_analysis']
        print(f"  - Semantic Score: {ai_analysis.get('semantic_score', 0):.2%}")
        print(f"  - NLP Score: {ai_analysis.get('nlp_score', 0):.2%}")
        print(f"  - LLM Score: {ai_analysis.get('llm_score', 0):.2%}")
        print(f"  - Knowledge Score: {ai_analysis.get('knowledge_score', 0):.2%}")
        print(f"  - Wiki Score: {ai_analysis.get('wiki_score', 0):.2%}")
    
    print("Issues found:")
    for issue in result['issues']:
        print(f"  - {issue['type']}: {issue['message']}")
    print()
    
    # Test 2: Code with NLP analysis issues (spaCy)
    nlp_code = '''
def calculate(x, y):
    # This thing does something with that stuff
    # Something happens here
    z = x + y
    a = z * 2
    b = a / 3
    return b
'''
    
    print("=== Test 2: NLP Analysis (spaCy) ===")
    result = detector.detect_ai_generated_code(nlp_code, 'python')
    print(f"AI Detected: {result['ai_detected']}")
    print(f"Confidence: {result['ai_confidence']:.2%}")
    print("Issues found:")
    for issue in result['issues']:
        print(f"  - {issue['type']}: {issue['message']}")
    print()
    
    # Test 3: Code with knowledge base verification
    knowledge_code = '''
def x(data):
    # This function processes data
    y = []
    for z in data:
        y.append(z)
    return y
'''
    
    print("=== Test 3: Knowledge Base Verification ===")
    result = detector.detect_ai_generated_code(knowledge_code, 'python')
    print(f"AI Detected: {result['ai_detected']}")
    print(f"Confidence: {result['ai_confidence']:.2%}")
    print("Issues found:")
    for issue in result['issues']:
        print(f"  - {issue['type']}: {issue['message']}")
    print()
    
    # Test 4: Code with Wikipedia concept validation
    wiki_code = '''
def process_algorithm(data_structure):
    """
    This function uses advanced algorithms and data structures
    to perform complex operations with polymorphism and encapsulation.
    """
    result = []
    for item in data_structure:
        # Apply sorting algorithm
        processed_item = item * 2
        result.append(processed_item)
    return result
'''
    
    print("=== Test 4: Wikipedia Concept Validation ===")
    result = detector.detect_ai_generated_code(wiki_code, 'python')
    print(f"AI Detected: {result['ai_detected']}")
    print(f"Confidence: {result['ai_confidence']:.2%}")
    print("Issues found:")
    for issue in result['issues']:
        print(f"  - {issue['type']}: {issue['message']}")
    print()
    
    # Test 5: Well-written code (should have low AI detection)
    good_code = '''
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
'''
    
    print("=== Test 5: Well-Written Code (Low AI Detection) ===")
    result = detector.detect_ai_generated_code(good_code, 'python')
    print(f"AI Detected: {result['ai_detected']}")
    print(f"Confidence: {result['ai_confidence']:.2%}")
    print("AI Analysis Scores:")
    if 'ai_analysis' in result:
        ai_analysis = result['ai_analysis']
        print(f"  - Semantic Score: {ai_analysis.get('semantic_score', 0):.2%}")
        print(f"  - NLP Score: {ai_analysis.get('nlp_score', 0):.2%}")
        print(f"  - LLM Score: {ai_analysis.get('llm_score', 0):.2%}")
        print(f"  - Knowledge Score: {ai_analysis.get('knowledge_score', 0):.2%}")
        print(f"  - Wiki Score: {ai_analysis.get('wiki_score', 0):.2%}")
    
    print("Issues found:")
    for issue in result['issues']:
        print(f"  - {issue['type']}: {issue['message']}")
    print()
    
    # Test 6: JavaScript code with AI patterns
    js_code = '''
// This function processes user data
function processUserData(userData) {
    let x = [];
    let y = {};
    
    // TODO: Add validation
    for (let i = 0; i < userData.length; i++) {
        x.push(userData[i]);
    }
    
    return x;
}
'''
    
    print("=== Test 6: JavaScript Code ===")
    result = detector.detect_ai_generated_code(js_code, 'javascript')
    print(f"AI Detected: {result['ai_detected']}")
    print(f"Confidence: {result['ai_confidence']:.2%}")
    print("Issues found:")
    for issue in result['issues']:
        print(f"  - {issue['type']}: {issue['message']}")
    print()
    
    # Test 7: Code with edit history (timing analysis)
    edit_history = [
        {
            'type': 'insert',
            'text': '''
def complex_function():
    # This is a complex function with many lines
    result = []
    for i in range(100):
        if i % 2 == 0:
            result.append(i * 2)
        else:
            result.append(i * 3)
    return result
''',
            'line': 1,
            'timestamp': 1234567890
        }
    ]
    
    timing_code = '''
def simple_function():
    return "Hello World"
'''
    
    print("=== Test 7: Edit History Analysis ===")
    result = detector.detect_ai_generated_code(timing_code, 'python', edit_history)
    print(f"AI Detected: {result['ai_detected']}")
    print(f"Confidence: {result['ai_confidence']:.2%}")
    print("Issues found:")
    for issue in result['issues']:
        print(f"  - {issue['type']}: {issue['message']}")
    print()
    
    # Summary
    print("=== Summary ===")
    print("Enhanced AI Detection Features:")
    print("✓ SBERT semantic similarity analysis")
    print("✓ spaCy NLP analysis")
    print("✓ Local LLM text classification")
    print("✓ Knowledge base verification")
    print("✓ Wikipedia concept validation")
    print("✓ Edit history timing analysis")
    print("✓ Traditional pattern matching")
    print()
    print("The enhanced AI detector provides:")
    print("- More accurate AI-generated code detection")
    print("- Detailed analysis scores from multiple AI models")
    print("- Semantic understanding of code comments")
    print("- Technical term validation")
    print("- Comprehensive suggestions and fixes")

def test_model_availability():
    """Test which AI models are available"""
    print("🔍 Testing AI Model Availability")
    print("=" * 40)
    
    detector = AIGeneratedCodeDetector()
    
    print("Model Status:")
    print(f"  - SBERT: {'✓ Available' if detector.sbert_model else '✗ Not available'}")
    print(f"  - spaCy: {'✓ Available' if detector.nlp else '✗ Not available'}")
    print(f"  - Transformers: {'✓ Available' if detector.text_classifier else '✗ Not available'}")
    print(f"  - Wikipedia API: {'✓ Available' if detector.wiki else '✗ Not available'}")
    print()
    
    if not any([detector.sbert_model, detector.nlp, detector.text_classifier, detector.wiki]):
        print("⚠️  No AI models available. Please install the required dependencies:")
        print("   pip install sentence-transformers spacy transformers wikipedia-api torch scikit-learn")
        print("   python -m spacy download en_core_web_sm")

if __name__ == "__main__":
    test_model_availability()
    print()
    test_enhanced_ai_detection() 