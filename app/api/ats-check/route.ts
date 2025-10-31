import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { hasCredits, deductCredits } from '@/payment/creditService';
import { CREDIT_COSTS } from '@/payment/config';
const pdfParse = require('pdf-parse');

interface Suggestion {
  suggestion: string;
  originalText: string;
  improvedText: string;
  category: 'text' | 'keyword' | 'other';
}

interface CompatibilityResult {
  currentScore: number;
  potentialScore: number;
  currentCallback: number;
  potentialCallback: number;
  keywords: string[];
  topRequiredKeywords: string[];
  missingKeywords: string[];
  suggestions: Suggestion[];
  textSuggestions: Suggestion[];
  keywordSuggestions: Suggestion[];
  otherSuggestions: Suggestion[];
  evidence: {
    matchedResponsibilities: Array<{ jdFragment: string; resumeFragment: string }>;
    matchedSkills: Array<{ skill: string; resumeFragment: string }>;
  };
  scoreBreakdown: {
    requiredSkills: number;
    experience: number;
    responsibilities: number;
    education: number;
    industry: number;
  };
  confidence: number;
  isValidJD: boolean;
  isValidCV: boolean;
  validationWarning?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Get user
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = (user._id as any).toString();

    // Check credits BEFORE processing
    const hasSufficientCredits = await hasCredits(
      userId, 
      CREDIT_COSTS.RESUME_ANALYSIS
    );
    
    if (!hasSufficientCredits) {
      return NextResponse.json(
        { 
          error: 'Insufficient credits',
          code: 'INSUFFICIENT_CREDITS',
          requiredCredits: CREDIT_COSTS.RESUME_ANALYSIS
        },
        { status: 402 }
      );
    }

    const formData = await req.formData();
    const resumeFile = formData.get("resume") as File;
    const jobDescription = formData.get("jobDescription") as string | null;

    if (!resumeFile) {
      return NextResponse.json({ error: "No resume uploaded" }, { status: 400 });
    }

    if (!jobDescription || jobDescription.trim().length === 0) {
      return NextResponse.json({ error: "Job description is required" }, { status: 400 });
    }

    // Extract text from PDF or plain text
    let resumeText: string;
    
    if (resumeFile.type === 'application/pdf') {
      const pdfBuffer = Buffer.from(await resumeFile.arrayBuffer());
      const pdfData = await pdfParse(pdfBuffer);
      resumeText = pdfData.text;
    } else {
      // Handle plain text file
      resumeText = await resumeFile.text();
    }
    
    console.log("Extracted resume text:", resumeText.substring(0, 200));

    // Call OpenRouter AI for job description compatibility analysis
    const compatibilityResult = await analyzeWithOpenRouter(resumeText, jobDescription);

    // Deduct credits AFTER successful analysis
    await deductCredits(
      userId,
      CREDIT_COSTS.RESUME_ANALYSIS,
      'resume_analysis',
      undefined,
      resumeFile.name
    );

    return NextResponse.json(compatibilityResult);
  } catch (error) {
    console.error("Error in compatibility check:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

async function analyzeWithOpenRouter(resumeText: string, jobDescription: string): Promise<CompatibilityResult> {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API key not configured");
  }

  const prompt = `You are an expert Resume & Job Description Alignment Analyst combining expertise from Senior Technical Recruiters, ATS (Applicant Tracking System) Engineers, and Hiring Managers across multiple domains.

Your objective: Evaluate how well a candidate's resume matches a specific job description and return an evidence-based JSON report optimized for ATS success and realistic recruiter callback probability.

---

INPUT VALIDATION REQUIREMENTS:
First, validate that the inputs are actually a resume/CV and a job description:

Resume/CV Validation Criteria:
- Must contain personal/professional information (name, contact, or professional summary)
- Must contain work experience, projects, or education sections
- Should have skills, qualifications, or competencies
- Typical length: 300-10,000 characters
- Red flags: Looks like a job posting, contains "we are looking for", "responsibilities include"

Job Description Validation Criteria:
- Must contain job title, role description, or position details
- Must contain requirements, qualifications, or responsibilities
- Should include company expectations or desired skills
- Typical length: 300-8,000 characters
- Red flags: Looks like a resume, contains "I have experience in", personal pronouns about candidate

If Resume appears to be a JD: Set isValidCV=false, validationWarning="The resume text appears to be a job description. Please provide your actual resume/CV."
If JD appears to be a Resume: Set isValidJD=false, validationWarning="The job description appears to be a resume. Please provide the actual job posting."
If both are invalid or swapped: Set both to false, validationWarning="The inputs appear to be swapped or invalid. Please ensure you paste your resume in the resume field and the job description in the JD field."
If inputs are too short (<200 chars each): Return error JSON

---

INPUT REQUIREMENTS:
- Resume Text: Plain UTF-8 string (max 20,000 characters). Parsed OCR-safe resume text including all sections (Experience, Skills, Education, etc.).
- Job Description: Plain UTF-8 string (max 15,000 characters). Full job posting text.
- Minimum valid input: 200 characters each.

If inputs are invalid, return: {"error":"INVALID_INPUT","errorCode":"TEXT_TOO_SHORT"}

---

COMPATIBILITY SCORING CRITERIA (Total 100 points):

1. Required Skills Match (30 points)
   - Frequency and semantic overlap of required skills from JD
   - Use fuzzy + semantic matching for synonyms and abbreviations
   - Examples: "AI" ↔ "Artificial Intelligence", "AWS" ↔ "Amazon Web Services"
   - Scoring: matched_required / total_required
   - Partial matches: exact = 1.0, synonym = 0.7, related = 0.5

2. Experience Relevance (25 points)
   - Years and type of experience alignment
   - Scoring: candidateYears / requiredYears (capped at 1.0)
   - Derive years from role dates and duration
   - Consider seniority level match

3. Responsibilities Alignment (20 points)
   - How well past roles match job requirements
   - Scoring: matchedResponsibilities / top8JDResponsibilities
   - Match past duties with JD expectations

4. Education & Certifications (15 points)
   - Degree and certification requirements
   - Scoring: exact match = 1.0, partial = 0.5, missing = 0

5. Industry & Domain Fit (10 points)
   - Relevant industry experience and sector-level relevance
   - Scoring: matchedIndustryKeywords / totalIndustryKeywords

---

SCORING METHODOLOGY:

Current Score Calculation:
- Calculate weighted sum of all 5 criteria
- Round to nearest integer (0-100)
- Be realistic: perfect matches are rare
- Missing required skills significantly lower score
- Partial experience matches scored proportionally
- Irrelevant experience does not count positively

Potential Score Calculation:
- Current score + estimated improvement gain
- Based on how many suggestions can realistically be implemented
- Maximum cap: 100
- Consider: Can missing skills be learned? Can experience be reframed?

---

CALLBACK PROBABILITY MAPPING:

Calculate realistic interview/callback chances:

| Current Score Range | Callback Probability Range |
|---------------------|----------------------------|
| 0-30                | 5-15%                      |
| 30-50               | 15-35%                     |
| 50-70               | 35-60%                     |
| 70-85               | 60-80%                     |
| 85-100              | 80-95%                     |

Adjustments (±10%):
- Add 10% if candidate has rare/high-demand skills
- Subtract 10% if significantly overqualified or underqualified
- Consider market conditions and competition level

---

ANALYSIS REQUIREMENTS:

1. Extract and match top 10 keywords/skills from JD that CURRENTLY APPEAR in the resume
2. Identify top 10 MOST IMPORTANT keywords/skills from JD (regardless of whether they appear in resume)
3. Identify 5-10 MISSING critical keywords/skills NOT in resume but required by JD
4. Provide COMPREHENSIVE improvement suggestions (NO LIMIT - provide as many as needed, typically 10-20+):
   
   CATEGORIZE each suggestion into one of three types:
   
   a) TEXT IMPROVEMENTS ("text"):
      - Rewriting existing resume content for better ATS optimization
      - Improving bullet points, descriptions, and achievements
      - Making language more impactful and quantifiable
      - Reformatting or restructuring existing content
   
   b) KEYWORD IMPROVEMENTS ("keyword"):
      - Adding missing critical keywords from the job description
      - Incorporating technical skills, tools, or technologies
      - Including industry-specific terminology
      - Adding certifications or qualifications mentioned in JD
   
   c) OTHER IMPROVEMENTS ("other"):
      - Structural changes (adding sections, reordering)
      - Format recommendations
      - General strategy suggestions
      - Soft skills or cultural fit improvements
      - Any suggestions that don't fit text or keyword categories

5. For EACH suggestion, provide:
   - The exact sentence/phrase from resume that needs improvement (or "MISSING" if not present)
   - A rewritten replacement sentence optimized for ATS and job match
   - The category: "text", "keyword", or "other"
6. Include matched responsibilities with exact text fragments
7. Include matched skills with resume context
8. Calculate confidence score (0-100) based on text quality and clarity

---

REQUIRED OUTPUT FORMAT (STRICT JSON ONLY):

{
  "isValidCV": boolean,                // true if resume input is actually a resume/CV
  "isValidJD": boolean,                // true if job description input is actually a JD
  "validationWarning": string,         // Optional warning message if validation fails
  "currentScore": number,              // 0-100, how well resume currently matches
  "potentialScore": number,            // 0-100, estimated score after improvements
  "currentCallback": number,           // 0-100, current interview probability
  "potentialCallback": number,         // 0-100, potential probability after improvements
  "keywords": [string],                // Top 10 matched keywords FOUND in resume
  "topRequiredKeywords": [string],     // Top 10 most important keywords from JD (priority order)
  "missingKeywords": [string],         // 5-10 critical missing keywords from JD
  "suggestions": [
    {
      "suggestion": string,            // The actionable improvement tip
      "originalText": string,          // Exact sentence from resume to replace (or "MISSING" if not present)
      "improvedText": string,          // Recommended replacement sentence for resume
      "category": string               // "text", "keyword", or "other"
    }
  ],
  "textSuggestions": [                 // All text improvement suggestions
    {
      "suggestion": string,
      "originalText": string,
      "improvedText": string,
      "category": "text"
    }
  ],
  "keywordSuggestions": [              // All keyword improvement suggestions
    {
      "suggestion": string,
      "originalText": string,
      "improvedText": string,
      "category": "keyword"
    }
  ],
  "otherSuggestions": [                // All other improvement suggestions
    {
      "suggestion": string,
      "originalText": string,
      "improvedText": string,
      "category": "other"
    }
  ],
  "evidence": {
    "matchedResponsibilities": [
      {
        "jdFragment": string,          // Exact text from job description
        "resumeFragment": string       // Matching text from resume
      }
    ],
    "matchedSkills": [
      {
        "skill": string,               // Skill name
        "resumeFragment": string       // Context from resume showing skill
      }
    ]
  },
  "scoreBreakdown": {                  // Detailed scoring transparency
    "requiredSkills": number,          // 0-30 points
    "experience": number,              // 0-25 points
    "responsibilities": number,        // 0-20 points
    "education": number,               // 0-15 points
    "industry": number                 // 0-10 points
  },
  "confidence": number                 // 0-100, analysis confidence level
}

---

CRITICAL RULES:
- FIRST validate inputs: Set isValidCV and isValidJD appropriately
- If validation fails, still provide analysis but include validationWarning
- Return ONLY valid JSON, no additional text
- All numbers must be integers (rounded to nearest whole number)
- All probabilities capped at [0, 100]
- "keywords" must contain ONLY matches found in BOTH documents
- "topRequiredKeywords" must contain the 10 MOST CRITICAL skills/keywords from JD ranked by importance
- "missingKeywords" must contain critical terms from JD that are ABSENT in resume
- Provide COMPREHENSIVE suggestions (10-20+ recommendations, NO LIMIT)
- Each suggestion object MUST include all FOUR fields: suggestion, originalText, improvedText, category
- Category must be exactly "text", "keyword", or "other"
- Populate textSuggestions, keywordSuggestions, and otherSuggestions arrays by filtering suggestions by category
- All suggestions array should contain ALL suggestions, while the categorized arrays contain filtered subsets
- If originalText is missing from resume, use "MISSING" as the value
- improvedText must be a complete, ready-to-use sentence for the resume
- Evidence fragments must be exact quotes from source documents
- If unable to parse or analyze, return error JSON with explanation
- only analyze the requiremnts from the given job discription and preffered qualification.

---

Resume Text: """${resumeText}"""

Job Description: """${jobDescription}"""`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "X-Title": "ResumeAI - Free Open Source Resume Builder",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`);
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);

  return result;
}
