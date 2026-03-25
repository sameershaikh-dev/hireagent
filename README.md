# HireAgent — Agentic AI Resume Screener

A Next.js POC that uses a 3-agent AI pipeline to automatically parse, score, and rank candidates against a job description.

## Architecture

```
Parse Agent → Score Agent → Justify Agent (Gemini 2.0 Flash) → Ranked Results
```

| Agent | Role | Output |
|-------|------|--------|
| **Parse Agent** | Extracts text from PDF / DOCX / TXT | Raw resume text |
| **Score Agent** | Rule-based skill matching + experience + education | Score out of 100 |
| **Justify Agent** | Gemini AI role-fit evaluation | Strengths, gaps, recommendation |

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Get a free Gemini API key

Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) and create a key.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Use the app

1. Paste your **Gemini API key** in the field
2. Paste the **Job Description**
3. Upload **10–20 resumes** (PDF, DOCX, or TXT)
4. Click **Screen Resumes**
5. Review the ranked shortlist with AI explanations

## Tech Stack

- **Next.js 16** — full-stack React framework
- **TypeScript** — type safety
- **Gemini 2.0 Flash** — AI role-fit justification
- **pdf-parse** — PDF text extraction
- **mammoth** — DOCX text extraction
- **Tailwind CSS** — utility styling

## Project Structure

```
app/
  page.tsx              # Main UI (setup + results)
  layout.tsx            # Root layout
  globals.css           # CSS variables & base styles
  api/screen/route.ts   # 3-agent pipeline API

components/
  JobDescriptionForm.tsx
  ResumeUploader.tsx
  ProcessingScreen.tsx

types/
  index.ts              # Shared interfaces
```

## Scoring Logic

**Rule-Based Score (40% of final)**
- Skill match: up to 40 pts (regex match against JD skills)
- Experience: up to 30 pts (years vs. JD requirement)
- Education: up to 30 pts (degree level detection)

**AI Score (60% of final)**
- Gemini evaluates the full resume against the JD
- Returns role fit score, strengths, gaps, and recommendation

**Final Score** = `(ruleScore × 0.4) + (aiScore × 0.6)`
