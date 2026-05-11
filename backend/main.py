from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF
import google.generativeai as genai
from dotenv import load_dotenv
from pathlib import Path
import os
import json
import re

# ══════════════════════════════════════════════
# ENV SETUP
# ══════════════════════════════════════════════

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env file")

print(f"✓ API key loaded ({api_key[:8]}...)")

# ══════════════════════════════════════════════
# GEMINI SETUP
# ══════════════════════════════════════════════

genai.configure(api_key=api_key)

model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    generation_config={
        "temperature": 0.2,
        "top_p": 0.95,
        "max_output_tokens": 8192,
    }
)

# ══════════════════════════════════════════════
# APP
# ══════════════════════════════════════════════

app = FastAPI(title="IndisValley AI Resume Analyzer", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ══════════════════════════════════════════════
# PROMPT TEMPLATE
# ══════════════════════════════════════════════

ANALYSIS_PROMPT = """
You are a senior FAANG technical recruiter AND ATS systems expert with 15+ years of experience.
Analyze the resume below with brutal honesty — no sugarcoating.

Return ONLY valid JSON. No markdown fences. No extra text before or after. Just raw JSON.

Use this exact structure:

{{
  "overallScore": <integer 0-100>,
  "verdict": "<2-5 word punchy verdict>",
  "summary": "<2-3 sentence brutally honest executive summary of this resume>",

  "hiringProbability": <integer 0-100>,
  "hiringVerdict": "<one of: Strong Hire | Lean Hire | On The Fence | Lean No Hire | Hard No>",
  "hiringDetail": "<1-2 sentences explaining the hiring probability based on real criteria>",

  "subScores": [
    {{"label": "Keywords", "value": <0-100>}},
    {{"label": "Impact", "value": <0-100>}},
    {{"label": "Formatting", "value": <0-100>}},
    {{"label": "Clarity", "value": <0-100>}},
    {{"label": "Projects", "value": <0-100>}},
    {{"label": "Skills Match", "value": <0-100>}},
    {{"label": "Experience Depth", "value": <0-100>}},
    {{"label": "Quantification", "value": <0-100>}}
  ],

  "strengths": [
    {{"title": "<strength>", "detail": "<specific 1-2 sentence explanation citing actual resume content>"}},
    {{"title": "<strength>", "detail": "<specific 1-2 sentence explanation citing actual resume content>"}},
    {{"title": "<strength>", "detail": "<specific 1-2 sentence explanation citing actual resume content>"}}
  ],

  "gaps": [
    {{"title": "<gap>", "detail": "<specific 1-2 sentence fix recommendation>"}},
    {{"title": "<gap>", "detail": "<specific 1-2 sentence fix recommendation>"}},
    {{"title": "<gap>", "detail": "<specific 1-2 sentence fix recommendation>"}},
    {{"title": "<gap>", "detail": "<specific 1-2 sentence fix recommendation>"}}
  ],

  "keywordsPresent": ["<keyword>", "<keyword>", "<keyword>", "<keyword>", "<keyword>", "<keyword>"],
  "keywordsCritical": ["<missing high-priority keyword>", "<missing high-priority keyword>", "<missing high-priority keyword>"],
  "keywordsMissing": ["<recommended keyword>", "<recommended keyword>", "<recommended keyword>", "<recommended keyword>", "<recommended keyword>"],

  "atsIssues": [
    {{"issue": "<formatting/parsing issue>", "fix": "<how to fix it>"}},
    {{"issue": "<formatting/parsing issue>", "fix": "<how to fix it>"}}
  ],

  "projects": [
    {{"name": "<project name>", "impact": "High", "description": "<why this specific project will close a gap in this resume>", "stack": ["<tech>", "<tech>", "<tech>", "<tech>"]}},
    {{"name": "<project name>", "impact": "High", "description": "<why this specific project will close a gap in this resume>", "stack": ["<tech>", "<tech>", "<tech>", "<tech>"]}},
    {{"name": "<project name>", "impact": "Medium", "description": "<why this specific project will close a gap in this resume>", "stack": ["<tech>", "<tech>", "<tech>"]}}
  ],

  "roadmap30": [
    {{"week": "Week 1", "task": "<specific task>", "detail": "<why this matters for this person's resume>"}},
    {{"week": "Week 2", "task": "<specific task>", "detail": "<why this matters for this person's resume>"}},
    {{"week": "Week 3", "task": "<specific task>", "detail": "<why this matters for this person's resume>"}},
    {{"week": "Week 4", "task": "<specific task>", "detail": "<why this matters for this person's resume>"}}
  ],

  "roadmap90": [
    {{"week": "Month 2", "task": "<specific task>", "detail": "<measurable outcome to aim for>"}},
    {{"week": "Month 2-3", "task": "<specific task>", "detail": "<measurable outcome to aim for>"}},
    {{"week": "Month 3", "task": "<specific task>", "detail": "<measurable outcome to aim for>"}}
  ],

  "targetRoles": ["<role>", "<role>", "<role>"],
  "targetCompanies": ["<company type>", "<company type>", "<company type>"],

  "recruiterNote": "<A brutally honest quote written AS a recruiter seeing this for 6 seconds — what they immediately think>",

  "scoreBreakdownExplanation": "<2-3 sentences explaining what's driving the overall score up or down>"
}}

Resume text to analyze:
{resume_text}
"""

# ══════════════════════════════════════════════
# HELPERS
# ══════════════════════════════════════════════

def extract_pdf_text(pdf_bytes: bytes) -> str:
    """Extract text from PDF bytes using PyMuPDF."""
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text_parts = []
        for page in doc:
            text_parts.append(page.get_text("text"))
        doc.close()
        return "\n".join(text_parts).strip()
    except Exception as e:
        raise ValueError(f"Could not parse PDF: {str(e)}")


def clean_json_response(raw: str) -> str:
    """Strip markdown fences and whitespace from model response."""
    # Remove ```json ... ``` or ``` ... ```
    cleaned = re.sub(r"```(?:json)?\s*", "", raw)
    cleaned = cleaned.replace("```", "").strip()
    return cleaned


def call_gemini(prompt: str) -> dict:
    """Call Gemini and parse JSON response."""
    response = model.generate_content(prompt)
    raw_text = response.text.strip()

    cleaned = clean_json_response(raw_text)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        # Try to extract JSON block with regex as fallback
        match = re.search(r"\{[\s\S]+\}", cleaned)
        if match:
            try:
                return json.loads(match.group())
            except Exception:
                pass
        raise ValueError(f"Gemini returned invalid JSON: {str(e)}\n\nRaw: {raw_text[:500]}")


# ══════════════════════════════════════════════
# ROUTES
# ══════════════════════════════════════════════

@app.get("/")
def root():
    return {
        "status": "running",
        "service": "IndisValley AI Resume Analyzer",
        "version": "2.0.0"
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """
    Accept a PDF resume, analyze it with Gemini, return structured JSON.
    """

    # ── Validate file type ──────────────────────────────────
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are accepted."
        )

    # ── Read bytes ──────────────────────────────────────────
    try:
        pdf_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read uploaded file: {str(e)}")

    if len(pdf_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(pdf_bytes) > 10 * 1024 * 1024:  # 10 MB limit
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 10MB.")

    # ── Extract text ────────────────────────────────────────
    try:
        resume_text = extract_pdf_text(pdf_bytes)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    if not resume_text or len(resume_text) < 50:
        raise HTTPException(
            status_code=422,
            detail="Could not extract readable text from this PDF. It may be scanned or image-based."
        )

    # Trim to safe token length (~6000 chars ≈ ~1500 tokens)
    resume_text_trimmed = resume_text[:7000]

    print(f"✓ Extracted {len(resume_text)} chars from {file.filename}")

    # ── Call Gemini ─────────────────────────────────────────
    prompt = ANALYSIS_PROMPT.format(resume_text=resume_text_trimmed)

    try:
        analysis = call_gemini(prompt)
    except ValueError as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI analysis failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error during AI analysis: {str(e)}"
        )

    print(f"✓ Analysis complete for {file.filename} — score: {analysis.get('overallScore', '?')}")

    return {
        "success": True,
        "filename": file.filename,
        "analysis": analysis
    }