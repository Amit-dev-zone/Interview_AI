const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
const MODEL_NAME = "gemini-2.5-flash";

/**
 * Clean JSON output from LLM (strip ```json fences)
 */
function parseCleanJson(text) {
  try {
    let clean = text.trim();
    if (clean.startsWith("```json")) {
      clean = clean.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (clean.startsWith("```")) {
      clean = clean.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    return JSON.parse(clean);
  } catch (err) {
    console.error("JSON parse error from AI response:", err, text);
    throw new Error("Failed to parse structured response from AI model.");
  }
}

/**
 * Generate a personalized day-wise study roadmap based on candidate's resume
 */
async function generateDaywisePlan(resumeText, targetRole = "Software Engineer", durationDays = 7, companyTier = "Product / Tech") {
  const prompt = `
You are an elite Tech Career Coach & Hiring Specialist at top technology companies.
Analyze the following candidate's resume and generate a highly structured, realistic, day-by-day interview preparation roadmap.

Target Role: ${targetRole}
Target Company Tier: ${companyTier}
Preparation Duration: ${durationDays} days

Candidate Resume:
"""
${resumeText.slice(0, 10000)}
"""

Output MUST be strictly valid JSON matching this exact structure:
{
  "candidateSummary": "2-3 sentences summarizing the candidate's core background, strengths, and primary focus areas for this role.",
  "extractedSkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
  "skillGaps": ["Area 1 needing improvement", "Area 2 needing improvement"],
  "dailyRoadmap": [
    {
      "dayNumber": 1,
      "title": "Concise Theme for Day 1 (e.g., Core JS Mechanics & Asynchronous Patterns)",
      "keyTopics": ["Topic A", "Topic B", "Topic C"],
      "tasks": [
        "Actionable practice task or coding problem 1",
        "Actionable practice task or system design concept 2",
        "Behavioral STAR story to refine"
      ],
      "milestone": "Deliverable or checkpoint milestone for Day 1"
    }
  ]
}

Ensure there are exactly ${durationDays} entries in dailyRoadmap (from dayNumber 1 to ${durationDays}).
Return ONLY the raw JSON object, without introductory text.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      temperature: 0.2,
      responseMimeType: "application/json"
    }
  });

  return parseCleanJson(response.text);
}

/**
 * Generate the next interview question tailored to the candidate's resume and progress
 */
async function generateInterviewQuestion(resumeText, targetRole = "Software Engineer", difficulty = "Intermediate", questionNumber = 1, totalQuestions = 5, previousQuestions = []) {
  const historyText = previousQuestions.map((q, idx) => `Q${idx + 1} (${q.category}): ${q.question}`).join("\n");

  const prompt = `
You are an expert technical interviewer conducting a live mock interview for a ${targetRole} position (${difficulty} level).
Candidate Resume Summary:
"""
${resumeText.slice(0, 4000)}
"""

Interview Progress: Question ${questionNumber} of ${totalQuestions}.
Previous questions asked:
${historyText || "None (this is the first question)"}

Generate question #${questionNumber}. 
Ensure questions balance:
- Core technical fundamentals & language mastery
- Real-world system architecture & debugging
- Behavioral leadership & past project deep-dives

Output MUST be strictly valid JSON matching:
{
  "question": "The interview question text clearly worded",
  "category": "One of: Technical Coding | System Architecture | Problem Solving | Behavioral & STAR",
  "contextHint": "A brief hint on what a strong candidate would focus on"
}
`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      temperature: 0.4,
      responseMimeType: "application/json"
    }
  });

  return parseCleanJson(response.text);
}

/**
 * Evaluate candidate's answer to a question in real-time
 */
async function evaluateInterviewAnswer(question, candidateAnswer, resumeContext = "") {
  const prompt = `
You are a senior tech interviewer evaluating a candidate's answer.
Question: "${question}"
Candidate Answer: "${candidateAnswer}"
Resume Context (if applicable): "${resumeContext.slice(0, 2000)}"

Evaluate the answer objectively on technical correctness, depth, edge-case consideration, structure, and communication clarity.

Output MUST be strictly valid JSON matching:
{
  "score": 85, // integer from 0 to 100
  "feedback": "2-3 sentences of concise, constructive feedback",
  "keyStrengths": ["Strength 1", "Strength 2"],
  "keyImprovements": ["Improvement suggestion 1", "Improvement suggestion 2"],
  "idealAnswer": "A concise bullet-point summary of what an exemplary answer would cover"
}
`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      temperature: 0.2,
      responseMimeType: "application/json"
    }
  });

  return parseCleanJson(response.text);
}

/**
 * Generate final holistic assessment report for the completed interview
 */
async function generateInterviewReport(interviewData) {
  const qaSummary = interviewData.questions.map((q, idx) => 
    `Q${idx+1}: ${q.question}\nAnswer: ${q.candidateAnswer}\nScore: ${q.score}\nFeedback: ${q.feedback}`
  ).join("\n\n");

  const prompt = `
You are the Hiring Committee Lead reviewing the mock interview results for a candidate applying for ${interviewData.targetRole} (${interviewData.difficulty} level).

Interview Transcript:
${qaSummary}

Generate a comprehensive final assessment.
Output MUST be strictly valid JSON matching:
{
  "overallScore": 88, // integer from 0 to 100 (weighted average of questions)
  "recommendation": "One of: Strong Hire | Hire | Lean Hire | Lean No Hire | No Hire",
  "summary": "Comprehensive 3-4 sentence holistic evaluation of candidate performance.",
  "topStrengths": ["Strength 1", "Strength 2", "Strength 3"],
  "areasToImprove": ["Area 1", "Area 2", "Area 3"],
  "nextStepsPlan": ["Actionable step 1 for candidate to prepare before real interview", "Actionable step 2"]
}
`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      temperature: 0.2,
      responseMimeType: "application/json"
    }
  });

  return parseCleanJson(response.text);
}

module.exports = {
  generateDaywisePlan,
  generateInterviewQuestion,
  evaluateInterviewAnswer,
  generateInterviewReport
};
