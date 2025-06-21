import pennylane as qml # Imports PennyLane, 
#which allows you to define quantum circuits and run them on simulators or real hardware.
from pennylane import numpy as np
# Imports PennyLane’s NumPy, 
# a drop-in replacement for regular NumPy 
# that supports differentiable operations and works well with quantum backends.

dev = qml.device("default.qubit", wires=4)
# Initializes a quantum simulator with 4 qubits (wires).
# default.qubit is a state-vector simulator for generic quantum logic

def normalize(v):
    norm = np.linalg.norm(v)
    return v / norm if norm != 0 else v
# A helper function to normalize the input vector so it fits within quantum rotation range.
# Ensures consistent magnitudes across inputs.

@qml.qnode(dev)
def similarity_circuit(vec1, vec2):
    for i in range(4):
        qml.RY(vec1[i], wires=i)
# Decorates the function similarity_circuit as a quantum node (qnode),
#  meaning it represents a quantum circuit that runs on the dev device.
# Applies a rotation around the Y-axis (RY) to each qubit using values from vec1.
# This encodes vec1 as a quantum state.
    qml.Barrier(wires=range(4))
# Acts as a visual/logical separator in the circuit (has no functional effect).
# Helps in circuit debugging or visualizations.

    for i in range(4):
        qml.RY(-vec2[i], wires=i)
# Applies inverse RY rotations using -vec2[i].
# This tries to "undo" the quantum state based on the second vector.
# If vec1 ≈ vec2, the state will return closer to the ground state (|0⟩).

    return [qml.expval(qml.PauliZ(i)) for i in range(4)]
# Measures the expected value of the Z-axis (Pauli-Z) for each qubit.
# This gives a number between -1 and 1 per qubit.
# If the system is fully reset, you get values closer to +1.

def quantum_similarity(vec1, vec2): # Defines a function 
# that computes the similarity score between two vectors using the quantum circuit.
    vec1 = normalize(np.array(vec1[:4]))
    vec2 = normalize(np.array(vec2[:4]))
# Truncates to the first 4 dimensions (you only have 4 qubits).
# Normalizes both vectors to prepare for quantum encoding.
    result = similarity_circuit(vec1, vec2)
    # Runs the quantum circuit and gets back 4 Pauli-Z expectation values.
    diff = np.abs(np.array(result)).sum()
    # Takes the sum of absolute differences from the ideal state (the closer to 0, the more similar).
    score = 1 - diff / 4  # Normalize score between 0 and 1
# Converts the difference into a similarity score between 0 and 1.
# 1 means highly similar 
# 0 means totally different
    return round(score, 4)
# Returns the similarity score, rounded to 4 decimal places.

# Technical Explanation of this Code
# Initializes a quantum simulator (default.qubit) with 4 qubits for state-vector computation.
#Normalizes input vectors to ensure consistent magnitude and compatibility with quantum gate rotations.
#Encodes one vector (vec1) into quantum states using RY (rotation-Y) gates on each qubit — this "loads" the data.
#Applies the inverse rotation of the second vector (vec2) using -RY, attempting to undo the quantum state.
#Measures each qubit’s Z-axis expectation value (PauliZ), returning values from -1 to 1.
#Computes the total deviation from the ground state |0⟩ across all qubits.
# Returns a normalized similarity score (0–1) — where:
# 1.0 means the vectors (embeddings) are nearly identical
# 0.0 means they’re highly dissimilar

# Relation to Our Project
#Adds a Quantum NLP Layer
# → Enables semantic comparison of AI-generated code vs. human-written code using a quantum circuit rather than classical metrics.
# Unlocks Deep Similarity Understanding
# → Quantum circuits naturally capture nonlinear and entangled relationships in high-dimensional data, which may help flag subtle mismatches in code quality or logic that classical methods miss.
# Enhances AI Code Trust Evaluation
# → Gives a "quantum similarity score" to quantify how close AI-generated code is to typical human-written code, adding an extra confidence signal in your diagnostics.
# Offers Unique Innovation & Research Potential
# → Demonstrates hybrid quantum-classical systems inside real developer tools — ideal for hackathons, publications, or advanced use cases.
# Differentiates the Extension in the Market
# → While most tools stop at LLMs, this bridges into emerging tech (quantum computing), making your extension stand out with a future-forward capability.
# Flexible & Modular
# → Can be extended to compare code fixes, evaluate refactor candidates, or rank completions based on human-likeness — all backed by quantum logic.


