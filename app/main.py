from fastapi import FastAPI
from pydantic import BaseModel
from app.analyzer import analyze_role
from app.job_parser import extract_skills
from app.agent import market_agent, generate_weights
from app.roadmap import generate_roadmap

app = FastAPI()

class UserInput(BaseModel):
    role: str
    skills: list[str]

class JDInput(BaseModel):
    jobs: list[str]
    skills: list[str]
    user_skills: list[str]


from fastapi.responses import FileResponse

@app.get("/")
def serve_ui():
    return FileResponse("static/index.html")


@app.post("/analyze")
def analyze(data: UserInput):
    return analyze_role(data.role, data.skills)


@app.get("/test-parser")
def test_parser():
    text = "Looking for AI Engineer with Python, AWS, Docker experience"
    skills = ["Python", "AWS", "Docker", "Kubernetes"]

    return {"extracted": extract_skills(text, skills)}


@app.post("/analyze-market")
def analyze_market(data: JDInput):
    result = market_agent(data.jobs, data.skills, data.user_skills)
    weights = generate_weights(result["market_demand"])
    roadmap = generate_roadmap(result["recommended_to_learn"])

    return {
        "market_demand": result["market_demand"],
        "weights": weights,
        "recommended": result["recommended_to_learn"],
        "roadmap": roadmap
    }