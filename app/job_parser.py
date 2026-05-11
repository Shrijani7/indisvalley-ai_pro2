def extract_skills(text, skills_list):
    text = text.lower()
    found = []

    for skill in skills_list:
        if skill.lower() in text:
            found.append(skill.lower())

    return found