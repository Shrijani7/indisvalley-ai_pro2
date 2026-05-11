from collections import Counter
from app.job_parser import extract_skills
from app.utils import normalize

def market_agent(job_descriptions, skill_list, user_skills):
    all_skills = []

    for job in job_descriptions:
        extracted = extract_skills(job, skill_list)
        if extracted:
            all_skills.extend(extracted)

    skill_freq = Counter(all_skills)

    normalized_user = []
    for s in user_skills:
        try:
            norm = normalize(s)
            if norm:
                normalized_user.append(norm.lower())
        except:
            continue

    recommendations = sorted(
        [skill for skill in skill_freq if skill not in normalized_user],
        key=lambda x: skill_freq[x],
        reverse=True
    )

    return {
        "market_demand": dict(skill_freq),
        "recommended_to_learn": recommendations[:3]
    }


def generate_weights(skill_freq):
    total = sum(skill_freq.values())
    if total == 0:
        return {}

    weights = {}
    for skill, freq in skill_freq.items():
        weights[skill] = round((freq / total) * 5, 2)

    return weights