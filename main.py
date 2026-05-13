"""
INDUS VALLEY Resume Intelligence Platform
Backend: Flask + Anthropic Claude API + PDF Parsing
"""

import os
import json
import re
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pdfplumber
import anthropic
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import tempfile

load_dotenv()

app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app)

ALLOWED_EXTENSIONS = {"pdf"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
MODEL = "claude-opus-4-5"


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def extract_text_from_pdf(file_path):
    """Extract all text from a PDF file using pdfplumber."""
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()


def call_claude(system_prompt, user_message, max_tokens=2000):
    """Make a call to Claude API and return the text response."""
    message = client.messages.create(
        model=MODEL,
        max_tokens=max_tokens,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )
    return message.content[0].text


@app.route("/")
def index():
    return send_from_directory(".", "index.html")


@app.route("/api/parse", methods=["POST"])
def parse_resume():
    """Full resume analysis endpoint."""
    if "resume" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["resume"]
    job_description = request.form.get("job_description", "")

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Only PDF files are allowed"}), 400

    # Save to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        file.save(tmp.name)
        tmp_path = tmp.name

    try:
        resume_text = extract_text_from_pdf(tmp_path)
        if not resume_text:
            return jsonify({"error": "Could not extract text from PDF"}), 400

        # Build comprehensive prompt
        system = """You are INDUS — an elite AI resume intelligence engine built for the Indus Valley platform. 
You analyze resumes with razor-sharp precision. You are direct, insightful, and deeply technical.
Always respond in valid JSON only. No markdown, no preamble. Pure JSON."""

        jd_section = (
            f"\n\nJOB DESCRIPTION:\n{job_description}"
            if job_description.strip()
            else "\n\nNo specific job description provided. Do a general analysis."
        )

        user_msg = f"""Analyze this resume and return a comprehensive JSON report.

RESUME TEXT:
{resume_text}
{jd_section}

Return EXACTLY this JSON structure (no extra keys, no markdown):
{{
  "candidate_name": "string",
  "current_role": "string or null",
  "years_experience": "string",
  "ats_score": number between 0-100,
  "ats_breakdown": {{
    "formatting": number,
    "keywords": number,
    "quantification": number,
    "sections": number,
    "readability": number
  }},
  "overall_rating": "string (e.g. Strong / Average / Weak)",
  "executive_summary": "2-3 sentence sharp summary",
  "strengths": ["strength1", "strength2", "strength3", "strength4"],
  "critical_improvements": [
    {{"issue": "string", "impact": "High/Medium/Low", "fix": "string"}},
    {{"issue": "string", "impact": "High/Medium/Low", "fix": "string"}},
    {{"issue": "string", "impact": "High/Medium/Low", "fix": "string"}}
  ],
  "skills_detected": {{
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"],
    "tools": ["tool1", "tool2"],
    "certifications": ["cert1"]
  }},
  "skill_gaps": [
    {{"skill": "string", "priority": "Critical/High/Medium", "reason": "string"}},
    {{"skill": "string", "priority": "Critical/High/Medium", "reason": "string"}},
    {{"skill": "string", "priority": "Critical/High/Medium", "reason": "string"}}
  ],
  "keywords": {{
    "present": ["kw1", "kw2", "kw3", "kw4", "kw5"],
    "missing": ["kw1", "kw2", "kw3", "kw4", "kw5"],
    "power_words": ["word1", "word2", "word3"]
  }},
  "roadmap": [
    {{"phase": "0-30 days", "actions": ["action1", "action2"], "goal": "string"}},
    {{"phase": "30-90 days", "actions": ["action1", "action2"], "goal": "string"}},
    {{"phase": "3-6 months", "actions": ["action1", "action2"], "goal": "string"}},
    {{"phase": "6-12 months", "actions": ["action1", "action2"], "goal": "string"}}
  ],
  "recruiter_simulation": {{
    "first_impression": "string (what a recruiter thinks in 6 seconds)",
    "would_shortlist": true or false,
    "rejection_risks": ["risk1", "risk2"],
    "interview_likelihood": "High/Medium/Low",
    "salary_range_estimate": "string",
    "fit_score": number between 0-100,
    "recruiter_notes": "string (2-3 sentences as if the recruiter is talking)"
  }},
  "rewritten_bullets": [
    {{"original": "string", "improved": "string", "why": "string"}}
  ],
  "job_titles_to_target": ["title1", "title2", "title3"]
}}"""

        response_text = call_claude(system, user_msg, max_tokens=3000)

        # Clean and parse JSON
        response_text = response_text.strip()
        if response_text.startswith("```"):
            response_text = re.sub(r"```json?\n?", "", response_text)
            response_text = response_text.replace("```", "")

        data = json.loads(response_text)
        return jsonify({"success": True, "data": data})

    except json.JSONDecodeError as e:
        return jsonify({"error": f"Failed to parse AI response: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        os.unlink(tmp_path)


@app.route("/api/chat", methods=["POST"])
def recruiter_chat():
    """Simulated recruiter chat endpoint."""
    body = request.json
    resume_text = body.get("resume_text", "")
    messages = body.get("messages", [])
    job_description = body.get("job_description", "")

    system = f"""You are "Alex", a senior tech recruiter at a top-tier company with 12 years of experience. 
You are reviewing this candidate's resume RIGHT NOW in a mock interview scenario.

You are direct, insightful, sometimes brutally honest but always constructive.
You ask tough questions. You probe weaknesses. You also appreciate genuine strengths.
Speak naturally, like a real recruiter on a call. Short, punchy responses. Max 3 sentences per turn.

RESUME ON YOUR DESK:
{resume_text}

JOB DESCRIPTION:
{job_description if job_description else "General tech role at a competitive company"}

Stay in character as Alex throughout the conversation."""

    api_messages = [{"role": m["role"], "content": m["content"]} for m in messages]

    response = client.messages.create(
        model=MODEL,
        max_tokens=400,
        system=system,
        messages=api_messages,
    )

    return jsonify({"reply": response.content[0].text})


@app.route("/api/rewrite", methods=["POST"])
def rewrite_bullet():
    """Rewrite a single bullet point."""
    body = request.json
    bullet = body.get("bullet", "")
    context = body.get("context", "")

    system = "You are an elite resume writer. Rewrite bullet points to be powerful, quantified, and ATS-optimized. Return JSON only."
    user_msg = f"""Rewrite this resume bullet point to be more impactful.
Context: {context}
Original: {bullet}

Return JSON: {{"original": "...", "improved": "...", "why": "...", "impact_score_before": 0-10, "impact_score_after": 0-10}}"""

    response = call_claude(system, user_msg, max_tokens=500)
    response = response.strip().replace("```json", "").replace("```", "")
    return jsonify(json.loads(response))


@app.route("/api/cover-letter", methods=["POST"])
def generate_cover_letter():
    """Generate a tailored cover letter."""
    body = request.json
    resume_text = body.get("resume_text", "")
    job_description = body.get("job_description", "")
    tone = body.get("tone", "professional")

    system = "You are a world-class cover letter writer. Write compelling, authentic cover letters that get responses."
    user_msg = f"""Write a {tone} cover letter for this candidate.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Write a 3-paragraph cover letter. Make it specific, compelling, not generic. No placeholders."""

    response = call_claude(system, user_msg, max_tokens=800)
    return jsonify({"cover_letter": response})


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "true").lower() == "true"
    print(f"\n🏺 INDUS VALLEY Platform starting on http://localhost:{port}\n")
    app.run(debug=debug, port=port, host="0.0.0.0")