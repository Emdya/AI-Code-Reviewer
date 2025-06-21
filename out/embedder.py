from flask import Flask, request, jsonify
from quantum_similarity import quantum_similarity
# Flask: Web framework used to build APIs
# Request: Accesses incoming HTTP request data
# Jsonify: Returns a dictionary as a JSON response
from transformers import AutoTokenizer, AutoModel
# AutoTokenizer: Tokenizes input code into tokens that the model understand 
# AutoModel: Loads a pretrained model (like CodeBERT) to generate embeddings
import torch
# Pytorch: Used for tensor operations and running the model under the hood.

app = Flask(__name__) # Initializes a Flask web application 
tokenizer = AutoTokenizer.from_pretrained("microsoft/codebert-base") # Loads the CodeBERT tokenizer. Converts raw code strings into model-ready 
# tokens (IDs, attention masks, etc.)
model = AutoModel.from_pretrained("microsoft/codebert-base") # Loads the codeBERT base model (without any task-specific head)
# Loads the CodeBERT base model (without any task-specific head). It outputs the hidden layers (embeddings) of the input tokens

@app.route("/embed", methods=["POST"]) # Creates a POST endpoint at /embed. We will send code snippets to this endpoint to get embeddings. 
def embed_code(): # Parsing incoming JSON data. 
    data = request.json 
    code = data.get("code", "") # Retrieves the "code" field from the JSON.

 # Defaults to an empty string if not present.

    inputs = tokenizer(code, return_tensors="pt", padding=True, truncation=True) 
    # Tokenizes the code string.
    # Returns PyTorch tensors (return_tensors="pt").
    #Applies padding and truncation to fit input length limits.
    with torch.no_grad():
    # Disables gradient tracking (this is inference, not training — saves memory).
        outputs = model(**inputs)
    #Runs the tokenized input through the CodeBERT model.
    # Returns outputs.last_hidden_state, a matrix of token embeddings.
        embeddings = outputs.last_hidden_state.mean(dim=1).squeeze().tolist()
    # Averages all token embeddings to create a single sentence-level vector (embedding).
    #squeeze() removes any unnecessary dimensions.
    #tolist() converts the PyTorch tensor to a standard Python list.
    return jsonify({ "embedding": embeddings }) # Returns the final vector as a JSON object with key "embedding".

@app.route("/semantic-compare", methods=["POST"])
# Defines a new POST endpoint at /semantic-compare.
# It's meant to be called with JSON data containing two code snippets.
def semantic_compare():
# Reads the incoming JSON payload from the HTTP request.
    data = request.json
    code1 = data.get("code1", "")
    code2 = data.get("code2", "")
# Extracts the two code snippets labeled "code1" and "code2".
# If not present, defaults to an empty string.

    if not code1 or not code2:
        return jsonify({"error": "Missing code inputs"}), 400
    #Returns an error if either snippet is missing.

    # Embed both code snippets
    inputs1 = tokenizer(code1, return_tensors="pt", padding=True, truncation=True)
    inputs2 = tokenizer(code2, return_tensors="pt", padding=True, truncation=True)
    # Tokenizes both code snippets using the pretrained CodeBERT tokenizer.
    # Converts them into PyTorch tensors (pt) for model input.
    # Applies padding and truncation to fit model size limits.

    with torch.no_grad(): # Disables gradient tracking to save memory during inference.
        emb1 = model(**inputs1).last_hidden_state.mean(dim=1).squeeze().tolist()
        emb2 = model(**inputs2).last_hidden_state.mean(dim=1).squeeze().tolist()
    # Passes both tokenized inputs through the CodeBERT model.
    # Extracts the mean of the last hidden layer for each input — 
    # this gives a fixed-size embedding vector that captures the code's semantic meaning.
    # Converts tensors to plain Python lists (tolist()).

    # Compare with quantum circuit
    score = quantum_similarity(emb1, emb2)
    # Calls your custom quantum_similarity() function (from quantum_similarity.py).
    # This function uses a quantum circuit to measure how close the two embeddings are, 
    # returning a similarity score between 0 and 1

    return jsonify({ "similarity": score }) # Responds to the client with a JSON object containing the similarity score.

if __name__ == "__main__": 
    app.run(port=5050)
#Starts the Flask app if the script is run directly.
#Runs the server on localhost:5050.

# What this code does technically 
# Sets up a Flask API server to handle HTTP POST requests.
# Loads CodeBERT tokenizer and model from Hugging Face to process code as natural language
# Exposes two key endpoints:
# /embed
# Accepts a single code snippet. Tokenizes the code using AutoTokenizer. Passes the tokenized input to CodeBERT to generate a semantic embedding vector.
# Returns the embedding as a JSON response. /semantic-compare Accepts two code snippets.
# Tokenizes and embeds both using CodeBERT. Passes both embeddings into the quantum_similarity() function.
#Computes a quantum-based similarity score between the two code snippets. Returns the score as a JSON object.
# Uses torch.no_grad() to optimize memory and speed during inference. Runs the server on http://localhost:5050.
# How This Benefits Your AI Code Reviewer Project Embeds code into semantic space
# Converts raw code into context-aware vectors that capture structure, intent, and style — a foundation for comparing code meaningfully. Enables quantum-powered comparisons
# Uses quantum_similarity() to evaluate how similar AI-generated code is to human-written code in a probabilistic, non-classical way.
# Provides a clean, modular API
# Your VS Code extension can call /semantic-compare to run quantum NLP evaluations in real-time with minimal setup.
# Decouples frontend/backend logic
# Keeps your extension lightweight while offloading heavy computation (embedding + quantum) to Python services.
# Supports advanced AI Code Analysis
# Instead of just flagging patterns (like eval()), it helps semantically judge whether a code snippet "feels" AI-generated, incomplete, or risky — quantifying trust.
# Enables Human-vs-AI code comparison workflows | Great for features like:
# “How human-like is this AI-generated code?”
#“Suggest a more human-like alternative”
#“Audit my file for low-similarity blocks”


