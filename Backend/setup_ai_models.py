#!/usr/bin/env python3
"""
Setup script for AI model dependencies
Installs SBERT, spaCy, transformers, and Wikipedia API
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} is compatible")
    return True

def install_dependencies():
    """Install all required dependencies"""
    print("🚀 Installing AI Model Dependencies")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        return False
    
    # Install base requirements
    print("\n📦 Installing base requirements...")
    if not run_command("pip install -r requirements.txt", "Installing base requirements"):
        return False
    
    # Install SBERT
    print("\n🤖 Installing SBERT (Sentence Transformers)...")
    if not run_command("pip install sentence-transformers", "Installing SBERT"):
        print("⚠️  SBERT installation failed, but continuing...")
    
    # Install spaCy
    print("\n📚 Installing spaCy...")
    if not run_command("pip install spacy", "Installing spaCy"):
        print("⚠️  spaCy installation failed, but continuing...")
    
    # Download spaCy model
    print("\n📥 Downloading spaCy English model...")
    if not run_command("python -m spacy download en_core_web_sm", "Downloading spaCy model"):
        print("⚠️  spaCy model download failed, but continuing...")
    
    # Install transformers
    print("\n🧠 Installing Transformers (Hugging Face)...")
    if not run_command("pip install transformers torch", "Installing Transformers"):
        print("⚠️  Transformers installation failed, but continuing...")
    
    # Install scikit-learn
    print("\n📊 Installing scikit-learn...")
    if not run_command("pip install scikit-learn", "Installing scikit-learn"):
        print("⚠️  scikit-learn installation failed, but continuing...")
    
    # Install Wikipedia API
    print("\n🌐 Installing Wikipedia API...")
    if not run_command("pip install wikipedia-api", "Installing Wikipedia API"):
        print("⚠️  Wikipedia API installation failed, but continuing...")
    
    return True

def test_installations():
    """Test if all installations work correctly"""
    print("\n🧪 Testing AI Model Installations")
    print("=" * 40)
    
    test_results = {}
    
    # Test SBERT
    try:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer('all-MiniLM-L6-v2')
        test_results['SBERT'] = True
        print("✅ SBERT: Working")
    except Exception as e:
        test_results['SBERT'] = False
        print(f"❌ SBERT: Failed - {e}")
    
    # Test spaCy
    try:
        import spacy
        nlp = spacy.load("en_core_web_sm")
        test_results['spaCy'] = True
        print("✅ spaCy: Working")
    except Exception as e:
        test_results['spaCy'] = False
        print(f"❌ spaCy: Failed - {e}")
    
    # Test Transformers
    try:
        from transformers import pipeline
        classifier = pipeline("text-classification", model="distilbert-base-uncased", return_all_scores=True)
        test_results['Transformers'] = True
        print("✅ Transformers: Working")
    except Exception as e:
        test_results['Transformers'] = False
        print(f"❌ Transformers: Failed - {e}")
    
    # Test Wikipedia API
    try:
        import wikipediaapi
        wiki = wikipediaapi.Wikipedia('en')
        test_results['Wikipedia API'] = True
        print("✅ Wikipedia API: Working")
    except Exception as e:
        test_results['Wikipedia API'] = False
        print(f"❌ Wikipedia API: Failed - {e}")
    
    # Test scikit-learn
    try:
        from sklearn.metrics.pairwise import cosine_similarity
        test_results['scikit-learn'] = True
        print("✅ scikit-learn: Working")
    except Exception as e:
        test_results['scikit-learn'] = False
        print(f"❌ scikit-learn: Failed - {e}")
    
    return test_results

def main():
    """Main setup function"""
    print("🤖 AI Code Reviewer - Enhanced AI Model Setup")
    print("=" * 60)
    print("This script will install all required AI model dependencies")
    print("for enhanced AI-generated code detection.")
    print()
    
    # Ask for confirmation
    response = input("Do you want to continue with the installation? (y/N): ")
    if response.lower() not in ['y', 'yes']:
        print("Installation cancelled.")
        return
    
    # Install dependencies
    if not install_dependencies():
        print("\n❌ Installation failed. Please check the error messages above.")
        return
    
    # Test installations
    test_results = test_installations()
    
    # Summary
    print("\n📋 Installation Summary")
    print("=" * 30)
    working_models = sum(test_results.values())
    total_models = len(test_results)
    
    print(f"Working models: {working_models}/{total_models}")
    
    if working_models == total_models:
        print("🎉 All AI models installed successfully!")
        print("You can now run the enhanced AI detection tests.")
    elif working_models > 0:
        print("⚠️  Some AI models failed to install, but the system will work with reduced functionality.")
        print("The basic AI detection features will still work.")
    else:
        print("❌ No AI models could be installed.")
        print("The system will fall back to basic pattern matching.")
    
    print("\nTo test the installation, run:")
    print("python test_enhanced_ai_detection.py")

if __name__ == "__main__":
    main() 