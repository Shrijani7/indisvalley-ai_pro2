import json

with open("data/skills_map.json") as f:
    skill_map = json.load(f)

def normalize(skill):
    return skill_map.get(skill.lower(), skill)