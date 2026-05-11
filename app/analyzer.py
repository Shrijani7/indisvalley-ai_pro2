import json
from app.utils import normalize

with open("data/jobs.json") as f:
    jobs_data = json.load(f)

def analyze_role(role, user_skills):
    role = role.lower()

    if role not in jobs_data:
        return {"error": "Role not found"}

    required = jobs_data[role]

    user_skills = [normalize(s).lower() for s in user_skills]

    missing = [skill for skill in required if skill not in user_skills]

    return {
        "role": role,
        "required_skills": required,
        "missing_skills": missing
    }