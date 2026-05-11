def generate_roadmap(skills):
    roadmap = {}

    for skill in skills:
        s = skill.lower()

        if s == "aws":
            roadmap["aws"] = [
                "Learn Cloud Basics",
                "Study EC2, S3",
                "Deploy project on AWS"
            ]

        elif s == "docker":
            roadmap["docker"] = [
                "Understand containers",
                "Write Dockerfile",
                "Deploy using Docker"
            ]

        elif s == "kubernetes":
            roadmap["kubernetes"] = [
                "Learn orchestration",
                "Understand pods/services",
                "Deploy cluster"
            ]

        elif s == "python":
            roadmap["python"] = [
                "Master basics",
                "Learn OOP",
                "Build projects"
            ]

        else:
            roadmap[s] = [
                "Learn basics",
                "Practice projects",
                "Apply in real-world"
            ]

    return roadmap