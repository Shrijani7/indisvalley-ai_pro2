from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import fitz
from openai import OpenAI
from dotenv import load_dotenv
from pathlib import Path
from collections import Counter
import os, json, re

# ── Env ──────────────────────────────────────────────────────────────────────
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise ValueError("GROQ_API_KEY not found in .env file")

print(f"✓ GROQ API key loaded ({api_key[:8]}...)")
client = OpenAI(
    api_key=api_key,
    base_url="https://api.groq.com/openai/v1",
)

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="IndisValley AI Career Engine", version="4.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Master Prompt ─────────────────────────────────────────────────────────────
RESUME_PROMPT = """
You are a senior FAANG technical recruiter AND ATS systems expert with 15+ years of experience.
Analyze the resume below with brutal, unfiltered honesty. Cover every dimension.

Return ONLY valid JSON. No markdown. No extra text. No code fences. Just raw JSON.

{{
  "overallScore": <integer 0-100>,
  "verdict": "<2-5 word verdict>",
  "summary": "<2-3 sentence summary>",
  "scoreBreakdownExplanation": "<2-3 sentences on what drives the overall score>",

  "hiringProbability": <integer 0-100>,
  "hiringVerdict": "<Strong Hire | Lean Hire | On The Fence | Lean No Hire | Hard No>",
  "hiringDetail": "<1-2 sentences explaining the hiring verdict>",

  "seniorityLevel": "<Fresher | Junior | Mid-Level | Senior | Lead/Staff>",
  "seniorityConfidence": <integer 0-100>,
  "seniorityNotes": "<1-2 sentences on why this seniority level was detected>",
  "careerMaturityScore": <integer 0-100>,

  "subScores": [
    {{"label": "Keywords",           "value": <0-100>, "note": "<one-line insight>"}},
    {{"label": "Impact & Metrics",   "value": <0-100>, "note": "<one-line insight>"}},
    {{"label": "Formatting",         "value": <0-100>, "note": "<one-line insight>"}},
    {{"label": "Clarity",            "value": <0-100>, "note": "<one-line insight>"}},
    {{"label": "Project Quality",    "value": <0-100>, "note": "<one-line insight>"}},
    {{"label": "Skills Match",       "value": <0-100>, "note": "<one-line insight>"}},
    {{"label": "Experience Depth",   "value": <0-100>, "note": "<one-line insight>"}},
    {{"label": "Quantification",     "value": <0-100>, "note": "<one-line insight>"}},
    {{"label": "ATS Compatibility",  "value": <0-100>, "note": "<one-line insight>"}},
    {{"label": "Leadership Signals", "value": <0-100>, "note": "<one-line insight>"}},
    {{"label": "Technical Depth",    "value": <0-100>, "note": "<one-line insight>"}},
    {{"label": "Bullet Strength",    "value": <0-100>, "note": "<one-line insight>"}}
  ],

  "strengths": [
    {{"title": "<title>", "detail": "<2-3 sentence detail>"}},
    {{"title": "<title>", "detail": "<2-3 sentence detail>"}},
    {{"title": "<title>", "detail": "<2-3 sentence detail>"}}
  ],
  "gaps": [
    {{"title": "<title>", "detail": "<2-3 sentence detail>", "severity": "<Critical|High|Medium>"}},
    {{"title": "<title>", "detail": "<2-3 sentence detail>", "severity": "<Critical|High|Medium>"}},
    {{"title": "<title>", "detail": "<2-3 sentence detail>", "severity": "<Critical|High|Medium>"}},
    {{"title": "<title>", "detail": "<2-3 sentence detail>", "severity": "<Critical|High|Medium>"}}
  ],

  "keywordsPresent":   ["<kw>","<kw>","<kw>","<kw>","<kw>","<kw>","<kw>","<kw>"],
  "keywordsCritical":  ["<kw>","<kw>","<kw>","<kw>"],
  "keywordsMissing":   ["<kw>","<kw>","<kw>","<kw>","<kw>","<kw>"],

  "atsIssues": [
    {{"issue": "<issue>", "fix": "<fix>", "severity": "<High|Medium|Low>"}},
    {{"issue": "<issue>", "fix": "<fix>", "severity": "<High|Medium|Low>"}},
    {{"issue": "<issue>", "fix": "<fix>", "severity": "<High|Medium|Low>"}}
  ],

  "bulletAnalysis": {{
    "totalBullets": <integer>,
    "strongBullets": <integer>,
    "weakBullets": <integer>,
    "weakExamples": ["<weak bullet text>","<weak bullet text>"],
    "rewrites": [
      {{"original": "<original weak bullet>", "improved": "<STAR-format rewrite with metric>"}},
      {{"original": "<original weak bullet>", "improved": "<STAR-format rewrite with metric>"}}
    ]
  }},

  "impactAnalysis": {{
    "measurableAchievements": <integer>,
    "totalAchievements": <integer>,
    "leadershipSignals": ["<signal>","<signal>"],
    "ownershipSignals": ["<signal>","<signal>"],
    "missingMetrics": ["<area missing metrics>","<area missing metrics>"]
  }},

  "projectQuality": {{
    "totalProjects": <integer>,
    "tutorialProjectCount": <integer>,
    "deployedProjectCount": <integer>,
    "complexityScore": <0-100>,
    "realWorldRelevance": <0-100>,
    "architectureMaturity": <0-100>,
    "projectFlags": ["<flag or observation>","<flag>"]
  }},

  "riskFlags": [
    {{"flag": "<employment gap | date inconsistency | buzzword inflation | weak projects | unverifiable claim>", "detail": "<detail>", "severity": "<High|Medium|Low>"}},
    {{"flag": "<flag>", "detail": "<detail>", "severity": "<High|Medium|Low>"}}
  ],

  "aiContentDetection": {{
    "aiWritingScore": <0-100>,
    "buzzwordDensity": "<Low|Medium|High>",
    "genericPhrases": ["<phrase>","<phrase>"],
    "humanizationSuggestions": ["<suggestion>","<suggestion>"]
  }},

  "recruiterPersonas": {{
    "faang": {{"verdict": "<verdict>", "note": "<1-2 sentences>", "passRate": <0-100>}},
    "startup": {{"verdict": "<verdict>", "note": "<1-2 sentences>", "passRate": <0-100>}},
    "hr_screen": {{"verdict": "<verdict>", "note": "<1-2 sentences>", "passRate": <0-100>}},
    "tech_lead": {{"verdict": "<verdict>", "note": "<1-2 sentences>", "passRate": <0-100>}}
  }},

  "salaryIntelligence": {{
    "estimatedRange": "<e.g. ₹8-14 LPA or $90k-$130k based on skills and experience>",
    "marketPosition": "<Below Market | At Market | Above Market>",
    "topSkillValue": "<most salary-valuable skill on resume>",
    "salaryGrowthTip": "<one actionable tip to increase market value>"
  }},

  "skillGapIntelligence": [
    {{"skill": "<missing skill>", "marketImportance": <0-100>, "salaryImpact": "<e.g. +15% avg>", "whyItMatters": "<1 sentence>"}},
    {{"skill": "<missing skill>", "marketImportance": <0-100>, "salaryImpact": "<e.g. +10% avg>", "whyItMatters": "<1 sentence>"}},
    {{"skill": "<missing skill>", "marketImportance": <0-100>, "salaryImpact": "<e.g. +8% avg>",  "whyItMatters": "<1 sentence>"}}
  ],

  "projects": [
    {{"name": "<name>", "impact": "High",   "description": "<desc>", "stack": ["<t>","<t>","<t>"], "whyThisProject": "<why this fills a gap>"}},
    {{"name": "<name>", "impact": "High",   "description": "<desc>", "stack": ["<t>","<t>","<t>"], "whyThisProject": "<why this fills a gap>"}},
    {{"name": "<name>", "impact": "Medium", "description": "<desc>", "stack": ["<t>","<t>","<t>"], "whyThisProject": "<why this fills a gap>"}}
  ],

  "roadmap30": [
    {{"week": "Week 1", "task": "<task>", "detail": "<detail>", "priority": "Critical"}},
    {{"week": "Week 2", "task": "<task>", "detail": "<detail>", "priority": "High"}},
    {{"week": "Week 3", "task": "<task>", "detail": "<detail>", "priority": "High"}},
    {{"week": "Week 4", "task": "<task>", "detail": "<detail>", "priority": "Medium"}}
  ],
  "roadmap90": [
    {{"week": "Month 2",   "task": "<task>", "detail": "<detail>", "priority": "High"}},
    {{"week": "Month 2-3", "task": "<task>", "detail": "<detail>", "priority": "High"}},
    {{"week": "Month 3",   "task": "<task>", "detail": "<detail>", "priority": "Medium"}}
  ],

  "certificationRoadmap": [
    {{"cert": "<certification name>", "provider": "<provider>", "urgency": "<Immediate|3-months|6-months>", "impact": "<why this cert matters for this profile>"}},
    {{"cert": "<certification name>", "provider": "<provider>", "urgency": "<Immediate|3-months|6-months>", "impact": "<why>"}}
  ],

  "interviewQuestions": {{
    "technical": ["<question based on resume>","<question>","<question>"],
    "hr": ["<question>","<question>","<question>"],
    "resumeBased": ["<specific question about something on their resume>","<question>","<question>"],
    "systemDesign": ["<system design question relevant to their level>","<question>"]
  }},

  "targetRoles":     ["<role>","<role>","<role>","<role>"],
  "targetCompanies": ["<company type or specific company>","<type>","<type>","<type>"],

  "recruiterNote":   "<brutally honest 6-second recruiter thought — be direct and specific>",
  "sixSecondScan": {{
    "firstImpression": "<what stands out in 6 seconds>",
    "missedOpportunities": ["<what the recruiter missed because it was buried>","<item>"],
    "scannabilityScore": <0-100>,
    "hierarchyScore": <0-100>
  }},

  "industryBenchmark": {{
    "percentileRank": <0-100>,
    "comparedToFresher": "<Better | Worse | On Par>",
    "comparedToFAANG": "<Better | Worse | On Par>",
    "competitivenessNote": "<1-2 sentences>"
  }},

  "linkedinTips": ["<tip>","<tip>","<tip>"],
  "githubTips":   ["<tip>","<tip>","<tip>"],

  "applicationSuccess": {{
    "interviewCallbackProbability": <0-100>,
    "oaClearingLikelihood": <0-100>,
    "hiringReadinessScore": <0-100>,
    "readinessNote": "<1-2 sentences>"
  }}
}}

Resume:
{resume_text}
"""

MARKET_PROMPT = """
You are a labor-market intelligence engine with access to live hiring data.
Given job descriptions and skill sets, return ONLY valid JSON — no markdown, no extra text.

{{
  "market_demand": {{
    "<skill>": <demand_score_0_to_100>,
    ...
  }},
  "weights": {{
    "<skill>": <importance_weight_float_0_to_1>,
    ...
  }},
  "recommended": ["<skill_to_learn_1>", "<skill_to_learn_2>", "<skill_to_learn_3>"],
  "summary": "<2-3 sentence market insight>",
  "hotRoles":  ["<role>","<role>","<role>"],
  "salaryBand": "<e.g. $120k-$180k for this skill stack>",
  "trend": "<Rising | Stable | Declining>"
}}

Job Descriptions:
{jobs}

All Skills in Market:
{skills}

Candidate's Current Skills:
{user_skills}
"""

# ── Helpers ───────────────────────────────────────────────────────────────────
def extract_pdf_text(pdf_bytes: bytes) -> str:
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text_parts = [page.get_text("text") for page in doc]
        doc.close()
        return "\n".join(text_parts).strip()
    except Exception as e:
        raise ValueError(f"Could not parse PDF: {e}")


def clean_json(raw: str) -> str:
    cleaned = re.sub(r"```(?:json)?\s*", "", raw)
    return cleaned.replace("```", "").strip()


def call_grok(prompt: str, max_tokens: int = 4096) -> dict:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an expert resume analyzer and career intelligence engine. "
                    "Always respond with valid raw JSON only. "
                    "No markdown, no code fences, no extra text. "
                    "Every field in the schema must be present. "
                    "Never truncate the JSON output."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        temperature=0.3,
        max_tokens=max_tokens,
    )
    raw = response.choices[0].message.content.strip()
    cleaned = clean_json(raw)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        match = re.search(r"\{[\s\S]+\}", cleaned)
        if match:
            try:
                return json.loads(match.group())
            except Exception:
                pass
        raise ValueError(f"Invalid JSON from model: {e}\n\nRaw snippet: {raw[:600]}")


# ── Pydantic models ───────────────────────────────────────────────────────────
class MarketRequest(BaseModel):
    jobs:        list[str]
    skills:      list[str]
    user_skills: list[str]


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "status": "running",
        "service": "IndisValley AI Career Engine",
        "version": "4.0.0",
        "endpoints": ["/upload-resume", "/analyze-market"],
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """
    Accepts a PDF resume, extracts its text, runs deep AI analysis across
    20+ dimensions, and returns a full structured intelligence report.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    try:
        pdf_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read file: {e}")

    if len(pdf_bytes) == 0:
        raise HTTPException(status_code=400, detail="File is empty.")
    if len(pdf_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large. Max 10 MB.")

    try:
        resume_text = extract_pdf_text(pdf_bytes)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    if not resume_text or len(resume_text) < 50:
        raise HTTPException(
            status_code=422,
            detail="Could not extract text. PDF may be scanned or image-based.",
        )

    resume_trimmed = resume_text[:8000]
    print(f"✓ Extracted {len(resume_text)} chars from {file.filename}")

    try:
        analysis = call_grok(
            RESUME_PROMPT.format(resume_text=resume_trimmed),
            max_tokens=4096,
        )
    except ValueError as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")

    print(f"✓ Done — score: {analysis.get('overallScore', '?')} | seniority: {analysis.get('seniorityLevel', '?')}")
    return {"success": True, "filename": file.filename, "analysis": analysis}


@app.post("/analyze-market")
async def analyze_market(req: MarketRequest):
    """
    Accepts job descriptions + skill lists.
    Returns market demand scores, skill weights, and learning recommendations.
    Falls back to keyword frequency counting if the model is unavailable.
    """
    jobs_blob        = "\n---\n".join(req.jobs)
    skills_blob      = ", ".join(req.skills)
    user_skills_blob = ", ".join(req.user_skills)

    try:
        result = call_grok(
            MARKET_PROMPT.format(
                jobs=jobs_blob,
                skills=skills_blob,
                user_skills=user_skills_blob,
            )
        )
    except Exception as e:
        all_text = jobs_blob.lower()
        freq     = Counter()
        for skill in req.skills:
            freq[skill.strip()] = all_text.count(skill.strip().lower())

        total    = max(sum(freq.values()), 1)
        user_set = {s.strip().lower() for s in req.user_skills}
        missing  = [s for s in req.skills if s.strip().lower() not in user_set]
        top3     = sorted(missing, key=lambda s: freq.get(s, 0), reverse=True)[:3]

        result = {
            "market_demand": {
                k: min(int(v / total * 100 * len(freq)), 100)
                for k, v in freq.items()
            },
            "weights":    {k: round(v / total, 3) for k, v in freq.items()},
            "recommended": top3,
            "summary":    f"Model unavailable — keyword-frequency fallback used. ({e})",
            "hotRoles":   [],
            "salaryBand": "N/A",
            "trend":      "Unknown",
        }

    return {
        "success":       True,
        "market_demand": result.get("market_demand", {}),
        "weights":       result.get("weights",       {}),
        "recommended":   result.get("recommended",   []),
        "summary":       result.get("summary",       ""),
        "hotRoles":      result.get("hotRoles",      []),
        "salaryBand":    result.get("salaryBand",    ""),
        "trend":         result.get("trend",         ""),
    }