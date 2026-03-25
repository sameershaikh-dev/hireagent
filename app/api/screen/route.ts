// import { NextRequest, NextResponse } from 'next/server'
// import { GoogleGenerativeAI } from '@google/generative-ai'
// import type { ParsedResume, RuleBasedScore, AIAssessment, CandidateResult } from '@/types'

// // ─── PARSE AGENT ────────────────────────────────────────────────────────────

// async function parseAgent(file: File): Promise<ParsedResume> {
//   const name = file.name.toLowerCase()

//   if (name.endsWith('.txt')) {
//     const text = await file.text()
//     return { fileName: file.name, rawText: text, parseMethod: 'plain-text' }
//   }

//   if (name.endsWith('.pdf')) {
//     try {
//       const arrayBuffer = await file.arrayBuffer()
//       const buffer = Buffer.from(arrayBuffer)
//       // Dynamic import to avoid edge runtime issues
//       const pdfParse = (await import('pdf-parse')).default
//       const result = await pdfParse(buffer)
//       return { fileName: file.name, rawText: result.text, parseMethod: 'pdf-parse' }
//     } catch {
//       return { fileName: file.name, rawText: '[PDF parse failed - scanned or encrypted]', parseMethod: 'ai-fallback' }
//     }
//   }

//   if (name.endsWith('.docx')) {
//     try {
//       const arrayBuffer = await file.arrayBuffer()
//       const buffer = Buffer.from(arrayBuffer)
//       const mammoth = await import('mammoth')
//       const result = await mammoth.extractRawText({ buffer })
//       return { fileName: file.name, rawText: result.value, parseMethod: 'mammoth' }
//     } catch {
//       return { fileName: file.name, rawText: '[DOCX parse failed]', parseMethod: 'ai-fallback' }
//     }
//   }

//   return { fileName: file.name, rawText: '', parseMethod: 'ai-fallback' }
// }

// // ─── SCORE AGENT ─────────────────────────────────────────────────────────────

// function extractSkillsFromJD(jd: string): string[] {
//   // Common tech skills to look for
//   const commonSkills = [
//     'javascript','typescript','react','vue','angular','next.js','node.js','express',
//     'python','django','flask','java','spring','c#','.net','php','laravel','ruby','rails',
//     'postgresql','mysql','mongodb','redis','sqlite','sql','nosql',
//     'aws','azure','gcp','docker','kubernetes','terraform','ci/cd','devops',
//     'rest api','graphql','microservices','git','linux','agile','scrum',
//     'html','css','tailwind','sass','webpack','vite',
//     'machine learning','ai','llm','tensorflow','pytorch',
//   ]
//   const jdLower = jd.toLowerCase()
//   return commonSkills.filter(skill => jdLower.includes(skill))
// }

// function extractExperienceYearsFromText(text: string): number {
//   const patterns = [
//     /(\d+)\+?\s*years?\s+(?:of\s+)?(?:experience|exp)/gi,
//     /experience\s*[:\-]?\s*(\d+)\+?\s*years?/gi,
//   ]
//   const years: number[] = []
//   for (const p of patterns) {
//     let m: RegExpExecArray | null
//     while ((m = p.exec(text)) !== null) {
//       years.push(parseInt(m[1]))
//     }
//   }
//   return years.length ? Math.max(...years) : 0
// }

// function detectEducation(text: string): number {
//   const t = text.toLowerCase()
//   if (t.includes('phd') || t.includes('doctorate') || t.includes('ph.d')) return 30
//   if (t.includes('master') || t.includes('m.s') || t.includes('mba') || t.includes('m.tech')) return 25
//   if (t.includes('bachelor') || t.includes('b.s') || t.includes('b.e') || t.includes('b.tech') || t.includes('degree')) return 20
//   if (t.includes('diploma') || t.includes('associate')) return 12
//   return 5
// }

// function scoreAgent(resume: ParsedResume, jdSkills: string[], jdText: string): RuleBasedScore {
//   const text = resume.rawText.toLowerCase()

//   // Skill matching (0-40)
//   const matchedSkills = jdSkills.filter(skill => text.includes(skill.toLowerCase()))
//   const skillScore = jdSkills.length > 0
//     ? Math.min(40, Math.round((matchedSkills.length / jdSkills.length) * 40))
//     : 20

//   // Experience scoring (0-30)
//   const requiredYearsMatch = jdText.match(/(\d+)\+?\s*years?/i)
//   const requiredYears = requiredYearsMatch ? parseInt(requiredYearsMatch[1]) : 3
//   const candidateYears = extractExperienceYearsFromText(resume.rawText)
//   let experienceScore = 0
//   if (candidateYears >= requiredYears) experienceScore = 30
//   else if (candidateYears >= requiredYears - 1) experienceScore = 22
//   else if (candidateYears >= requiredYears - 2) experienceScore = 15
//   else if (candidateYears > 0) experienceScore = 8

//   // Education scoring (0-30)
//   const educationScore = detectEducation(resume.rawText)

//   const total = skillScore + experienceScore + educationScore

//   return {
//     skillScore,
//     experienceScore,
//     educationScore,
//     total,
//     matchedSkills,
//     experienceYears: candidateYears,
//   }
// }

// // ─── JUSTIFY AGENT ────────────────────────────────────────────────────────────

// async function justifyAgent(
//   resume: ParsedResume,
//   ruleScore: RuleBasedScore,
//   jd: string,
//   gemini: ReturnType<GoogleGenerativeAI['getGenerativeModel']>
// ): Promise<AIAssessment> {
//   const prompt = `You are an expert HR recruiter evaluating a candidate's resume against a job description.

// JOB DESCRIPTION:
// ${jd.slice(0, 1500)}

// RESUME (${resume.fileName}):
// ${resume.rawText.slice(0, 2000)}

// RULE-BASED SCORES:
// - Skill Match: ${ruleScore.skillScore}/40 (matched: ${ruleScore.matchedSkills.join(', ') || 'none'})
// - Experience: ${ruleScore.experienceScore}/30 (${ruleScore.experienceYears} years detected)
// - Education: ${ruleScore.educationScore}/30

// Evaluate this candidate and respond with ONLY a valid JSON object (no markdown, no extra text):
// {
//   "roleFitScore": <number 0-100>,
//   "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
//   "gaps": ["<gap 1>", "<gap 2>"],
//   "explanation": "<2-3 sentence summary of overall fit>",
//   "recommendation": "<one of: Strong Yes, Yes, Maybe, No>"
// }`

//   try {
//     const result = await gemini.generateContent(prompt)
//     const text = result.response.text().trim()
//     const cleaned = text.replace(/```json|```/g, '').trim()
//     const parsed = JSON.parse(cleaned)

//     const roleFitScore = Math.min(100, Math.max(0, Number(parsed.roleFitScore) || 50))
//     const overallScore = Math.round(ruleScore.total * 0.4 + roleFitScore * 0.6)

//     return {
//       roleFitScore,
//       overallScore,
//       strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3) : [],
//       gaps: Array.isArray(parsed.gaps) ? parsed.gaps.slice(0, 3) : [],
//       explanation: String(parsed.explanation || ''),
//       recommendation: ['Strong Yes', 'Yes', 'Maybe', 'No'].includes(parsed.recommendation)
//         ? parsed.recommendation
//         : 'Maybe',
//     }
//   } catch {
//     // Fallback if AI fails
//     const roleFitScore = Math.min(100, Math.round(ruleScore.total * 0.9))
//     return {
//       roleFitScore,
//       overallScore: Math.round(ruleScore.total * 0.4 + roleFitScore * 0.6),
//       strengths: ruleScore.matchedSkills.slice(0, 3).map(s => `Has experience with ${s}`),
//       gaps: ['Could not fully assess — AI evaluation failed'],
//       explanation: 'Assessment based primarily on rule-based scoring due to AI evaluation error.',
//       recommendation: ruleScore.total >= 70 ? 'Yes' : ruleScore.total >= 50 ? 'Maybe' : 'No',
//     }
//   }
// }

// // ─── MAIN ROUTE ───────────────────────────────────────────────────────────────

// export async function POST(req: NextRequest) {
//   try {
//     const formData = await req.formData()
//     const jd = formData.get('jobDescription') as string
//     const apiKey = formData.get('apiKey') as string
//     const files = formData.getAll('resumes') as File[]

//     if (!jd || jd.trim().length < 20) {
//       return NextResponse.json({ error: 'Job description is too short.' }, { status: 400 })
//     }
//     if (!apiKey || apiKey.trim().length < 10) {
//       return NextResponse.json({ error: 'Gemini API key is required.' }, { status: 400 })
//     }
//     if (!files || files.length === 0) {
//       return NextResponse.json({ error: 'No resume files uploaded.' }, { status: 400 })
//     }

//     const genAI = new GoogleGenerativeAI(apiKey.trim())
//     const gemini = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

//     // Extract skills from JD once
//     const jdSkills = extractSkillsFromJD(jd)

//     const candidates: CandidateResult[] = []

//     for (let i = 0; i < files.length; i++) {
//       const file = files[i]

//       // Parse Agent
//       const parsed = await parseAgent(file)

//       // Score Agent
//       const ruleScore = scoreAgent(parsed, jdSkills, jd)

//       // Justify Agent
//       const aiAssessment = await justifyAgent(parsed, ruleScore, jd, gemini)

//       candidates.push({
//         id: `candidate-${i + 1}`,
//         fileName: file.name,
//         ruleScore,
//         aiAssessment,
//         finalScore: aiAssessment.overallScore,
//         rank: 0, // assigned after sort
//       })
//     }

//     // Rank
//     candidates.sort((a, b) => b.finalScore - a.finalScore)
//     candidates.forEach((c, i) => { c.rank = i + 1 })

//     return NextResponse.json({
//       candidates,
//       processedAt: new Date().toISOString(),
//       totalResumes: files.length,
//     })
//   } catch (err: unknown) {
//     console.error('Screening error:', err)
//     const message = err instanceof Error ? err.message : 'Unknown error'
//     return NextResponse.json({ error: `Screening failed: ${message}` }, { status: 500 })
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  ParsedResume,
  RuleBasedScore,
  AIAssessment,
  CandidateResult,
} from "@/types";

// ─── PARSE AGENT ────────────────────────────────────────────────────────────

async function parseAgent(file: File): Promise<ParsedResume> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".txt")) {
    const text = await file.text();
    return { fileName: file.name, rawText: text, parseMethod: "plain-text" };
  }

  if (name.endsWith(".pdf")) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      // Dynamic import to avoid edge runtime issues
      const pdfParse = (await import("pdf-parse")).default;
      const result = await pdfParse(buffer);
      return {
        fileName: file.name,
        rawText: result.text,
        parseMethod: "pdf-parse",
      };
    } catch {
      return {
        fileName: file.name,
        rawText: "[PDF parse failed - scanned or encrypted]",
        parseMethod: "ai-fallback",
      };
    }
  }

  if (name.endsWith(".docx")) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      return {
        fileName: file.name,
        rawText: result.value,
        parseMethod: "mammoth",
      };
    } catch {
      return {
        fileName: file.name,
        rawText: "[DOCX parse failed]",
        parseMethod: "ai-fallback",
      };
    }
  }

  return { fileName: file.name, rawText: "", parseMethod: "ai-fallback" };
}

// ─── SCORE AGENT ─────────────────────────────────────────────────────────────

function extractSkillsFromJD(jd: string): string[] {
  // Common tech skills to look for
  const commonSkills = [
    "javascript",
    "typescript",
    "react",
    "vue",
    "angular",
    "next.js",
    "node.js",
    "express",
    "python",
    "django",
    "flask",
    "java",
    "spring",
    "c#",
    ".net",
    "php",
    "laravel",
    "ruby",
    "rails",
    "postgresql",
    "mysql",
    "mongodb",
    "redis",
    "sqlite",
    "sql",
    "nosql",
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
    "terraform",
    "ci/cd",
    "devops",
    "rest api",
    "graphql",
    "microservices",
    "git",
    "linux",
    "agile",
    "scrum",
    "html",
    "css",
    "tailwind",
    "sass",
    "webpack",
    "vite",
    "machine learning",
    "ai",
    "llm",
    "tensorflow",
    "pytorch",
  ];
  const jdLower = jd.toLowerCase();
  return commonSkills.filter((skill) => jdLower.includes(skill));
}

function extractExperienceYearsFromText(text: string): number {
  const patterns = [
    /(\d+)\+?\s*years?\s+(?:of\s+)?(?:experience|exp)/gi,
    /experience\s*[:\-]?\s*(\d+)\+?\s*years?/gi,
  ];
  const years: number[] = [];
  for (const p of patterns) {
    let m: RegExpExecArray | null;
    while ((m = p.exec(text)) !== null) {
      years.push(parseInt(m[1]));
    }
  }
  return years.length ? Math.max(...years) : 0;
}

function detectEducation(text: string): number {
  const t = text.toLowerCase();
  if (t.includes("phd") || t.includes("doctorate") || t.includes("ph.d"))
    return 30;
  if (
    t.includes("master") ||
    t.includes("m.s") ||
    t.includes("mba") ||
    t.includes("m.tech")
  )
    return 25;
  if (
    t.includes("bachelor") ||
    t.includes("b.s") ||
    t.includes("b.e") ||
    t.includes("b.tech") ||
    t.includes("degree")
  )
    return 20;
  if (t.includes("diploma") || t.includes("associate")) return 12;
  return 5;
}

function scoreAgent(
  resume: ParsedResume,
  jdSkills: string[],
  jdText: string,
): RuleBasedScore {
  const text = resume.rawText.toLowerCase();

  // Skill matching (0-40)
  const matchedSkills = jdSkills.filter((skill) =>
    text.includes(skill.toLowerCase()),
  );
  const skillScore =
    jdSkills.length > 0
      ? Math.min(40, Math.round((matchedSkills.length / jdSkills.length) * 40))
      : 20;

  // Experience scoring (0-30)
  const requiredYearsMatch = jdText.match(/(\d+)\+?\s*years?/i);
  const requiredYears = requiredYearsMatch
    ? parseInt(requiredYearsMatch[1])
    : 3;
  const candidateYears = extractExperienceYearsFromText(resume.rawText);
  let experienceScore = 0;
  if (candidateYears >= requiredYears) experienceScore = 30;
  else if (candidateYears >= requiredYears - 1) experienceScore = 22;
  else if (candidateYears >= requiredYears - 2) experienceScore = 15;
  else if (candidateYears > 0) experienceScore = 8;

  // Education scoring (0-30)
  const educationScore = detectEducation(resume.rawText);

  const total = skillScore + experienceScore + educationScore;

  return {
    skillScore,
    experienceScore,
    educationScore,
    total,
    matchedSkills,
    experienceYears: candidateYears,
  };
}

// ─── JUSTIFY AGENT ────────────────────────────────────────────────────────────

async function justifyAgent(
  resume: ParsedResume,
  ruleScore: RuleBasedScore,
  jd: string,
  gemini: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>,
): Promise<AIAssessment> {
  const prompt = `You are a senior technical recruiter. Evaluate this candidate's resume strictly against the job description below.

JOB DESCRIPTION:
${jd.slice(0, 1500)}

RESUME (${resume.fileName}):
${resume.rawText.slice(0, 2500)}

RULE-BASED PRE-SCREENING:
- Skills matched from JD: ${ruleScore.matchedSkills.join(", ") || "none detected"}
- Experience years detected: ${ruleScore.experienceYears}
- Rule score: ${ruleScore.total}/100

Your task: Return a JSON object. Output ONLY the raw JSON — no markdown, no code fences, no explanation outside the JSON.

Required JSON shape:
{
  "roleFitScore": <integer 0-100 reflecting how well this candidate fits the specific JD>,
  "strengths": [
    "<specific strength tied to a JD requirement>",
    "<specific strength tied to a JD requirement>",
    "<specific strength tied to a JD requirement>"
  ],
  "gaps": [
    "<specific gap or missing JD requirement>",
    "<specific gap or missing JD requirement>"
  ],
  "explanation": "<2-3 sentences: how well the candidate matches this specific role and why>",
  "whySelect": "<1-2 sentences: the strongest concrete reason to shortlist this candidate for THIS job, referencing specific JD criteria they meet>",
  "whyNotSelect": "<1-2 sentences: the strongest concrete reason NOT to select, referencing specific JD criteria they are missing or weak on>",
  "recommendation": "<exactly one of: Strong Yes, Yes, Maybe, No>"
}`;

  try {
    const result = await gemini.generateContent(prompt);
    const rawText = result.response.text().trim();

    // Robust JSON extraction: strip markdown fences, find first { ... } block
    let jsonStr = rawText;
    // Remove ```json ... ``` or ``` ... ``` fences
    jsonStr = jsonStr
      .replace(/```(?:json)?\s*/gi, "")
      .replace(/```/g, "")
      .trim();
    // Extract the first valid JSON object in case there's surrounding text
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!jsonMatch)
      throw new Error(
        `No JSON object found in response: ${rawText.slice(0, 200)}`,
      );
    const parsed = JSON.parse(jsonMatch[0]);

    const roleFitScore = Math.min(
      100,
      Math.max(0, Number(parsed.roleFitScore) || 50),
    );
    const overallScore = Math.round(ruleScore.total * 0.4 + roleFitScore * 0.6);

    return {
      roleFitScore,
      overallScore,
      strengths: Array.isArray(parsed.strengths)
        ? parsed.strengths.slice(0, 3)
        : [],
      gaps: Array.isArray(parsed.gaps) ? parsed.gaps.slice(0, 3) : [],
      explanation: String(parsed.explanation || ""),
      whySelect: String(parsed.whySelect || ""),
      whyNotSelect: String(parsed.whyNotSelect || ""),
      recommendation: ["Strong Yes", "Yes", "Maybe", "No"].includes(
        parsed.recommendation,
      )
        ? parsed.recommendation
        : "Maybe",
    };
  } catch (err) {
    console.error("Justify agent error for", resume.fileName, err);
    // Fallback: build meaningful response from rule scores
    const roleFitScore = Math.min(100, Math.round(ruleScore.total * 0.85));
    const matched = ruleScore.matchedSkills;
    return {
      roleFitScore,
      overallScore: Math.round(ruleScore.total * 0.4 + roleFitScore * 0.6),
      strengths:
        matched.length > 0
          ? matched.slice(0, 3).map((s) => `Demonstrated experience with ${s}`)
          : ["Resume submitted for review"],
      gaps: ["Full AI assessment unavailable — review resume manually"],
      explanation: `Rule-based screening gave a score of ${ruleScore.total}/100. ${matched.length} JD skills matched: ${matched.slice(0, 5).join(", ") || "none"}.`,
      whySelect:
        matched.length >= 3
          ? `Candidate matches ${matched.length} key skills from the JD including ${matched.slice(0, 3).join(", ")}.`
          : "Insufficient skill overlap detected for a confident recommendation.",
      whyNotSelect:
        ruleScore.experienceYears === 0
          ? "Years of experience could not be verified from the resume."
          : `AI assessment failed; manual review required to verify JD fit.`,
      recommendation:
        ruleScore.total >= 70 ? "Yes" : ruleScore.total >= 50 ? "Maybe" : "No",
    };
  }
}

// ─── MAIN ROUTE ───────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const jd = formData.get("jobDescription") as string;
    const apiKey = formData.get("apiKey") as string;
    const files = formData.getAll("resumes") as File[];

    if (!jd || jd.trim().length < 20) {
      return NextResponse.json(
        { error: "Job description is too short." },
        { status: 400 },
      );
    }
    if (!apiKey || apiKey.trim().length < 10) {
      return NextResponse.json(
        { error: "Gemini API key is required." },
        { status: 400 },
      );
    }
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No resume files uploaded." },
        { status: 400 },
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const gemini = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Extract skills from JD once
    const jdSkills = extractSkillsFromJD(jd);

    const candidates: CandidateResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Parse Agent
      const parsed = await parseAgent(file);

      // Score Agent
      const ruleScore = scoreAgent(parsed, jdSkills, jd);

      // Justify Agent
      const aiAssessment = await justifyAgent(parsed, ruleScore, jd, gemini);

      candidates.push({
        id: `candidate-${i + 1}`,
        fileName: file.name,
        ruleScore,
        aiAssessment,
        finalScore: aiAssessment.overallScore,
        rank: 0, // assigned after sort
      });
    }

    // Rank
    candidates.sort((a, b) => b.finalScore - a.finalScore);
    candidates.forEach((c, i) => {
      c.rank = i + 1;
    });

    return NextResponse.json({
      candidates,
      processedAt: new Date().toISOString(),
      totalResumes: files.length,
    });
  } catch (err: unknown) {
    console.error("Screening error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Screening failed: ${message}` },
      { status: 500 },
    );
  }
}
