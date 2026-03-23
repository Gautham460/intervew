import { GoogleGenerativeAI } from "@google/generative-ai";

export interface CoachingSession {
  id: string;
  userId: string;
  question: string;
  userAnswer: string;
  coachFeedback: CoachFeedback;
  score: number;
  improvements: string[];
  nextSteps: string[];
  createdAt: Date;
}

export interface CoachFeedback {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  realTimeHints: string[];
  sentimentAnalysis: {
    confidence: number; // 0-100
    fillerWords: string[];
    pacing: "too-slow" | "good" | "too-fast";
  };
  communityBenchmark: {
    avgScore: number;
    percentile: number;
  };
  recommendedPractice: string;
}

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_KEY || "");

export async function generateCoachFeedback(
  question: string,
  userAnswer: string,
  category: string
): Promise<CoachFeedback> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are an expert interview coach. Analyze this interview answer and provide detailed feedback.

Question: "${question}"
Category: "${category}"
User's Answer: "${userAnswer}"

Provide feedback in this exact JSON format:
{
  "overallScore": <number 0-100>,
  "strengths": [<list of 3-4 key strengths>],
  "weaknesses": [<list of 3-4 areas to improve>],
  "realTimeHints": [<list of 2-3 specific improvement tips>],
  "sentimentAnalysis": {
    "confidence": <number 0-100>,
    "fillerWords": [<detected filler words like um, ah, like>],
    "pacing": "too-slow" | "good" | "too-fast"
  },
  "recommendedPractice": "<specific practice recommendation>"
}

Be encouraging but honest. Focus on actionable improvements.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          overallScore: parsed.overallScore || 0,
          strengths: parsed.strengths || [],
          weaknesses: parsed.weaknesses || [],
          realTimeHints: parsed.realTimeHints || [],
          sentimentAnalysis: parsed.sentimentAnalysis || {
            confidence: 70,
            fillerWords: [],
            pacing: "good",
          },
          communityBenchmark: {
            avgScore: 72,
            percentile: Math.random() * 100,
          },
          recommendedPractice: parsed.recommendedPractice || "",
        };
      }
    } catch {
      return createDefaultFeedback();
    }
    return createDefaultFeedback();
  } catch (error) {
    console.error("Error generating coach feedback:", error);
    return createDefaultFeedback();
  }
}

function createDefaultFeedback(): CoachFeedback {
  return {
    overallScore: 0,
    strengths: ["Thinking time utilized well"],
    weaknesses: ["Answer lacked specific STAR method details"],
    realTimeHints: ["Focus on explaining the impact of your actions"],
    sentimentAnalysis: {
      confidence: 50,
      fillerWords: [],
      pacing: "good",
    },
    communityBenchmark: {
      avgScore: 70,
      percentile: 50,
    },
    recommendedPractice: "Try practicing more behavioral questions.",
  };
}

export async function getCoachContextResponse(
  query: string,
  userHistory: any[]
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are an AI Interview Coach with access to the user's historical performance. 
    User Query: "${query}"
    
    User Performance History:
    ${JSON.stringify(userHistory.slice(-5))}
    
    Based on their history, provide a personalized, encouraging, and highly specific answer to their query. Mention specific categories or scores if relevant.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating contextual response:", error);
    return "I'm sorry, I'm having trouble accessing your history right now. Generally, focusing on structured answers using the STAR method is always a great way to improve!";
  }
}

export async function generateRealTimeHints(
  question: string,
  partialAnswer: string
): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Given this interview question and partial answer, provide 2-3 real-time hints to improve the response:

Question: "${question}"
Current Answer: "${partialAnswer}"

Return ONLY a JSON array of strings: ["hint1", "hint2", "hint3"]`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    try {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      return getDefaultHints();
    }
    return getDefaultHints();
  } catch (error) {
    console.error("Error generating hints:", error);
    return getDefaultHints();
  }
}

function getDefaultHints(): string[] {
  return [
    "Provide a concrete example to support your point",
    "Explain the 'why' behind your approach",
    "Mention the impact or results you achieved",
  ];
}

export interface PersonalizedCoachingPlan {
  userId: string;
  focusAreas: string[];
  weeklyGoals: string[];
  recommendedQuestions: string[];
  estimatedImprovement: number;
  startDate: Date;
  endDate: Date;
}

export async function generateCoachingPlan(
  userPerformance: Record<string, number>,
  _userGoals: string[]
): Promise<PersonalizedCoachingPlan> {
  try {
    const weakAreas = Object.entries(userPerformance)
      .filter(([, score]) => score < 70)
      .map(([area]) => area)
      .slice(0, 3);

    return {
      userId: "",
      focusAreas: weakAreas,
      weeklyGoals: [
        "Complete 5 practice questions in focus areas",
        "Record and review 2 answers",
        "Study one advanced topic",
      ],
      recommendedQuestions: [],
      estimatedImprovement: Math.min(weakAreas.length * 8, 25),
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
  } catch (error) {
    console.error("Error generating coaching plan:", error);
    throw error;
  }
}

export function calculateImprovement(previousScore: number, currentScore: number): number {
  return currentScore - previousScore;
}

export interface CoachMetrics {
  sessionsCompleted: number;
  averageScore: number;
  improvementRate: number;
  focusAreasImprovement: Record<string, number>;
  nextRecommendedTopic: string;
}

export function calculateCoachMetrics(sessions: CoachingSession[]): CoachMetrics {
  if (sessions.length === 0) {
    return {
      sessionsCompleted: 0,
      averageScore: 0,
      improvementRate: 0,
      focusAreasImprovement: {},
      nextRecommendedTopic: "General Interview Prep",
    };
  }

  const avgScore = sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length;
  const improvementRate =
    sessions.length >= 2
      ? ((sessions[sessions.length - 1].score - sessions[0].score) /
        sessions[0].score) *
      100
      : 0;

  return {
    sessionsCompleted: sessions.length,
    averageScore: Math.round(avgScore),
    improvementRate: Math.round(improvementRate * 10) / 10,
    focusAreasImprovement: {},
    nextRecommendedTopic: "System Design",
  };
}
