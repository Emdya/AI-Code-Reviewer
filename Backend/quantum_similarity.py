import pennylane as qml
from pennylane import numpy as np

dev = qml.device("default.qubit", wires=4)

def normalize(v):
    norm = np.linalg.norm(v)
    return v / norm if norm != 0 else v

@qml.qnode(dev)
def similarity_circuit(vec1, vec2):
    for i in range(4):
        qml.RY(vec1[i], wires=i)
    qml.Barrier(wires=range(4))
    for i in range(4):
        qml.RY(-vec2[i], wires=i)
    return [qml.expval(qml.PauliZ(i)) for i in range(4)]

def quantum_similarity(vec1, vec2):
    vec1 = normalize(np.array(vec1[:4]))
    vec2 = normalize(np.array(vec2[:4]))
    result = similarity_circuit(vec1, vec2)
    diff = np.abs(result).sum()
    return round(1 - diff / 4, 4)
