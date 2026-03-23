import { UserAnswer } from "@/types";

export interface PerformanceMetrics {
  averageRating: number;
  totalQuestions: number;
  questionsPerformance: {
    excellent: number; // 8-10
    good: number; // 6-7.9
    average: number; // 4-5.9
    poor: number; // 0-3.9
  };
  improvementTrend: "improving" | "declining" | "stable";
  strongSkills: string[];
  weakSkills: string[];
  timeToImprove: number; // days based on trend
}

export interface SkillPerformance {
  skill: string;
  averageRating: number;
  questionCount: number;
  lastAttemptDate: Date;
  improvementRate: number; // percentage
}

export interface InterviewAnalytics {
  totalInterviews: number;
  averageScore: number;
  bestPerformedInterviews: { position: string; score: number; date: Date }[];
  worstPerformedInterviews: { position: string; score: number; date: Date }[];
  completionRate: number; // percentage of started interviews
  totalHoursSpent: number;
  averageTimePerInterview: number; // minutes
}

export const calculatePerformanceMetrics = (
  feedbacks: UserAnswer[],
  proctorSessions: any[] = [],
  companyAttempts: any[] = []
): PerformanceMetrics => {
  const allDataPoints = [...feedbacks];
  
  // Add proctor sessions as data points
  // Proctor sessions score is usually 0-100, normalize to 0-10
  proctorSessions.forEach(session => {
    if (session.status === "completed") {
      allDataPoints.push({
        rating: session.score / 10,
        createdAt: session.endTime || session.createdAt,
        question: "Proctored Interview Session",
      } as any);
    }
  });

  // Add company question attempts as data points
  companyAttempts.forEach(attempt => {
    allDataPoints.push({
      rating: attempt.rating,
      createdAt: attempt.createdAt,
      question: `${attempt.company}: ${attempt.question}`,
    } as any);
  });

  if (allDataPoints.length === 0) {
    return {
      averageRating: 0,
      totalQuestions: 0,
      questionsPerformance: { excellent: 0, good: 0, average: 0, poor: 0 },
      improvementTrend: "stable",
      strongSkills: [],
      weakSkills: [],
      timeToImprove: 0,
    };
  }

  const avgRating =
    allDataPoints.reduce((sum, f) => sum + f.rating, 0) / allDataPoints.length;

  const performance = {
    excellent: allDataPoints.filter((f) => f.rating >= 8).length,
    good: allDataPoints.filter((f) => f.rating >= 6 && f.rating < 8).length,
    average: allDataPoints.filter((f) => f.rating >= 4 && f.rating < 6).length,
    poor: allDataPoints.filter((f) => f.rating < 4).length,
  };

  // Calculate trend by comparing first half to second half
  const midpoint = Math.ceil(allDataPoints.length / 2);
  const firstHalf = allDataPoints
    .slice(0, midpoint)
    .reduce((sum, f) => sum + f.rating, 0) / midpoint;
  const secondHalf = allDataPoints
    .slice(midpoint)
    .reduce((sum, f) => sum + f.rating, 0) / (allDataPoints.length - midpoint);

  const trend = Math.abs(secondHalf - firstHalf) < 0.5 ? 
    "stable" : 
    secondHalf > firstHalf ? 
    "improving" : 
    "declining";

  const timeToImprove = trend === "improving" ? 0 : trend === "declining" ? 14 : 7;

  return {
    averageRating: Math.round(avgRating * 10) / 10,
    totalQuestions: allDataPoints.length,
    questionsPerformance: performance,
    improvementTrend: trend,
    strongSkills: [],
    weakSkills: [],
    timeToImprove,
  };
};

export const groupFeedbacksBySkill = (
  feedbacks: UserAnswer[]
): Map<string, UserAnswer[]> => {
  const skillMap = new Map<string, UserAnswer[]>();

  feedbacks.forEach((feedback) => {
    // Check if it's a company question to categorize better
    const skillMatch = feedback.question.match(
      /^(React|TypeScript|Node\.js|Python|Java|JavaScript|CSS|HTML|Vue|Angular|Docker|Kubernetes|Git|AWS|SQL|MongoDB|Firebase|C#|Tailwind|REST API|System Design|Behavioral|Technical|System Design|Data Structures|Algorithms|Problem Solving|Leadership|Communication)/
    );
    const skill = skillMatch ? skillMatch[0] : "General";

    if (!skillMap.has(skill)) {
      skillMap.set(skill, []);
    }
    skillMap.get(skill)?.push(feedback);
  });

  return skillMap;
};

export const calculateSkillPerformance = (
  feedbacks: UserAnswer[],
  proctorSessions: any[] = [],
  companyAttempts: any[] = []
): SkillPerformance[] => {
  const allDataPoints = [...feedbacks];
  
  proctorSessions.forEach(session => {
    if (session.status === "completed") {
      allDataPoints.push({
        rating: session.score / 10,
        createdAt: session.endTime || session.createdAt,
        question: "System Design: Proctored Session", // Assigning to System Design for categorization
      } as any);
    }
  });

  companyAttempts.forEach(attempt => {
    allDataPoints.push({
      rating: attempt.rating,
      createdAt: attempt.createdAt,
      question: `${attempt.category}: ${attempt.question}`,
    } as any);
  });

  const skillMap = groupFeedbacksBySkill(allDataPoints);
  const skillPerformances: SkillPerformance[] = [];

  skillMap.forEach((questions, skill) => {
    const avgRating =
      questions.reduce((sum, q) => sum + q.rating, 0) / questions.length;
    
  const getDate = (ts: any) => {
    if (!ts) return new Date();
    if (typeof ts.toDate === "function") return ts.toDate();
    return new Date(ts);
  };

  // Sort questions by date to get the latest attempt
  const sortedQuestions = [...questions].sort((a, b) => {
    return getDate(b.createdAt).getTime() - getDate(a.createdAt).getTime();
  });

  const firstQuestion = sortedQuestions[0];
  const lastAttempt = getDate(firstQuestion.createdAt);

    skillPerformances.push({
      skill,
      averageRating: Math.round(avgRating * 10) / 10,
      questionCount: questions.length,
      lastAttemptDate: lastAttempt,
      improvementRate: 0, // Will be calculated with historical data
    });
  });

  return skillPerformances.sort((a, b) => b.averageRating - a.averageRating);
};

export const getStrongAndWeakSkills = (
  skillPerformances: SkillPerformance[]
): { strongSkills: string[]; weakSkills: string[] } => {
  const sorted = [...skillPerformances].sort(
    (a, b) => b.averageRating - a.averageRating
  );

  const strongSkills = sorted
    .filter((s) => s.averageRating >= 7)
    .slice(0, 3)
    .map((s) => s.skill);

  const weakSkills = sorted
    .filter((s) => s.averageRating < 6)
    .slice(0, 3)
    .map((s) => s.skill);

  return { strongSkills, weakSkills };
};
