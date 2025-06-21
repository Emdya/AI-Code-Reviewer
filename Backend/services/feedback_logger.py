from datetime import datetime
import json
import os

FEEDBACK_FILE = "feedback_logs.json"

def log_feedback(analysis_id: str, vote: int, comment: str = None):
    """Log user feedback to a JSON file"""
    feedback = {
        "timestamp": datetime.utcnow().isoformat(),
        "analysis_id": analysis_id,
        "vote": vote,
        "comment": comment
    }
    
    # Create file if it doesn't exist
    if not os.path.exists(FEEDBACK_FILE):
        with open(FEEDBACK_FILE, 'w') as f:
            json.dump([], f)
    
    # Append new feedback
    with open(FEEDBACK_FILE, 'r+') as f:
        feedbacks = json.load(f)
        feedbacks.append(feedback)
        f.seek(0)
        json.dump(feedbacks, f, indent=2)