import { db } from "@/config/firebase.config";
import { collection, addDoc, updateDoc, doc, getDocs, query, where } from "firebase/firestore";
import { chatSession } from "@/scripts";

export interface StudyPlan {
  id?: string;
  userId: string;
  title: string;
  goal: string;
  difficulty: "easy" | "medium" | "hard";
  duration: number; // in days
  startDate: Date;
  endDate: Date;
  topics: StudyTopic[];
  milestones: Milestone[];
  progress: number;
  status: "active" | "completed" | "paused";
  createdAt?: Date;
}

export interface StudyTopic {
  id: string;
  name: string;
  description: string;
  estimatedHours: number;
  resources: Resource[];
  practiceQuestions: number;
  completed: boolean;
  completedDate?: Date;
  score?: number;
}

export interface Resource {
  title: string;
  type: "article" | "video" | "course" | "book" | "practice";
  url?: string;
  duration?: number;
  completed: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  completedDate?: Date;
  completed: boolean;
  reward?: string;
}

export async function createStudyPlan(plan: StudyPlan): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "study_plans"), {
      ...plan,
      status: "active",
      progress: 0,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating study plan:", error);
    throw error;
  }
}

export async function getStudyPlans(userId: string): Promise<StudyPlan[]> {
  try {
    const q = query(collection(db, "study_plans"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate?.(),
      endDate: doc.data().endDate?.toDate?.(),
      createdAt: doc.data().createdAt?.toDate?.(),
    } as StudyPlan));
  } catch (error) {
    console.error("Error fetching study plans:", error);
    return [];
  }
}

export async function updateStudyPlanProgress(
  planId: string,
  topicId: string,
  completed: boolean,
  score?: number
): Promise<void> {
  try {
    const docRef = doc(db, "study_plans", planId);
    const planDocs = await getDocs(
      query(collection(db, "study_plans"), where("id", "==", planId))
    );

    if (planDocs.docs.length > 0) {
      const plan = planDocs.docs[0].data() as StudyPlan;
      const updatedTopics = plan.topics.map((t) =>
        t.id === topicId
          ? {
              ...t,
              completed,
              completedDate: completed ? new Date() : undefined,
              score,
            }
          : t
      );

      const completedCount = updatedTopics.filter((t) => t.completed).length;
      const progress = Math.round((completedCount / updatedTopics.length) * 100);

      await updateDoc(docRef, {
        topics: updatedTopics,
        progress,
      });
    }
  } catch (error) {
    console.error("Error updating study plan progress:", error);
    throw error;
  }
}

export async function completeMilestone(planId: string, milestoneId: string): Promise<void> {
  try {
    const docRef = doc(db, "study_plans", planId);
    const planDocs = await getDocs(
      query(collection(db, "study_plans"), where("id", "==", planId))
    );

    if (planDocs.docs.length > 0) {
      const plan = planDocs.docs[0].data() as StudyPlan;
      const updatedMilestones = plan.milestones.map((m) =>
        m.id === milestoneId
          ? {
              ...m,
              completed: true,
              completedDate: new Date(),
            }
          : m
      );

      await updateDoc(docRef, {
        milestones: updatedMilestones,
      });
    }
  } catch (error) {
    console.error("Error completing milestone:", error);
    throw error;
  }
}

export async function generatePersonalizedStudyPlan(
  userId: string,
  targetRole: string,
  currentLevel: "beginner" | "intermediate" | "advanced",
  daysAvailable: number
): Promise<StudyPlan> {
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + daysAvailable * 24 * 60 * 60 * 1000);

  let topics: StudyTopic[] = [];
  let milestones: Milestone[] = [];

  try {
    const prompt = `
      Act as an expert career coach. Generate a structured JSON study plan for a ${currentLevel} aiming to become a ${targetRole} over a period of ${daysAvailable} days. 
      The JSON must contain two keys: "topics" and "milestones". 
      
      "topics" is an array of objects where each object has:
      - "name": String (topic name)
      - "description": String (brief what to learn)
      - "estimatedHours": Number (hours to spend)
      - "practiceQuestions": Number (suggested questions to solve)
      - "resources": Array of objects { "title": String, "type": "article" | "video" | "course" | "book" | "practice" } (max 2 resources per topic)

      "milestones" is an array of objects representing progress checkpoints where each object has:
      - "title": String (milestone name)
      - "description": String
      - "dayOffset": Number (number of days from start date this milestone should be complete)

      Keep topics comprehensive but realistic for the timeline. Return ONLY the raw JSON without formatting ticks.
    `;

    const result = await chatSession.sendMessage(prompt);
    let cleanText = result.response.text().replace(/(json|```|`)/g, "").trim();
    
    // Safely extract the JSON part in case the model wraps it in conversational text
    const jsonStart = cleanText.indexOf('{');
    const jsonEnd = cleanText.lastIndexOf('}');
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      cleanText = cleanText.substring(jsonStart, jsonEnd + 1);
    }

    const parsed = JSON.parse(cleanText);

    topics = (parsed.topics || []).map((t: any, i: number) => ({
      id: "topic-" + i + "-" + Date.now(),
      name: t.name || "General Topic",
      description: t.description || "",
      estimatedHours: Number(t.estimatedHours) || 5,
      practiceQuestions: Number(t.practiceQuestions) || 10,
      resources: (t.resources || []).map((r: any) => ({
        title: r.title || "Study Guide",
        type: ["article", "video", "course", "book", "practice"].includes(r.type) ? r.type : "article",
        completed: false
      })),
      completed: false
    }));

    milestones = (parsed.milestones || []).map((m: any, i: number) => ({
      id: "milestone-" + i + "-" + Date.now(),
      title: m.title || "Milestone Checkpoint",
      description: m.description || "",
      targetDate: new Date(startDate.getTime() + Math.min(Number(m.dayOffset) || daysAvailable, daysAvailable) * 24 * 60 * 60 * 1000),
      completed: false
    }));

    if (topics.length === 0) throw new Error("AI returned empty topics");

  } catch (error) {
    console.error("AI Study Plan Generation failed, relying on safe fallback:", error);
    topics = generateTopics(targetRole, currentLevel);
    milestones = generateMilestones(daysAvailable);
  }

  try {
    return {
      userId,
      title: `${targetRole.replace(/\b\w/g, l => l.toUpperCase())} ${daysAvailable}-Day Study Track`,
      goal: `Master ${targetRole} concepts and prepare for technical interviews`,
      difficulty: currentLevel === "advanced" ? "hard" : currentLevel === "intermediate" ? "medium" : "easy",
      duration: daysAvailable,
      startDate,
      endDate,
      topics,
      milestones,
      progress: 0,
      status: "active",
    };
  } catch (error) {
    console.error("Error generating study plan:", error);
    throw error;
  }
}

function generateTopics(_role: string, _level: string): StudyTopic[] {
  const baseTopics = [
    {
      name: "Data Structures & Algorithms",
      estimatedHours: 20,
      practiceQuestions: 50,
    },
    {
      name: "System Design",
      estimatedHours: 15,
      practiceQuestions: 20,
    },
    {
      name: "Behavioral Questions",
      estimatedHours: 10,
      practiceQuestions: 30,
    },
  ];

  return baseTopics.map((t, i) => ({
    id: `topic-${i}`,
    name: t.name,
    description: `Master ${t.name.toLowerCase()} for interviews`,
    estimatedHours: t.estimatedHours,
    resources: [
      {
        title: "Comprehensive Guide",
        type: "article",
        completed: false,
      },
      {
        title: "Video Course",
        type: "video",
        completed: false,
      },
    ],
    practiceQuestions: t.practiceQuestions,
    completed: false,
  }));
}

function generateMilestones(daysAvailable: number): Milestone[] {
  const milestones: Milestone[] = [];
  const quarter = Math.floor(daysAvailable / 4);

  milestones.push({
    id: "m1",
    title: "Complete Fundamentals",
    description: "Finish all basic topic coverage",
    targetDate: new Date(Date.now() + quarter * 24 * 60 * 60 * 1000),
    completed: false,
  });

  milestones.push({
    id: "m2",
    title: "Solve 25 Practice Problems",
    description: "Complete first set of practice questions",
    targetDate: new Date(Date.now() + quarter * 2 * 24 * 60 * 60 * 1000),
    completed: false,
  });

  milestones.push({
    id: "m3",
    title: "Mock Interview Round 1",
    description: "Complete first mock interview",
    targetDate: new Date(Date.now() + quarter * 3 * 24 * 60 * 60 * 1000),
    completed: false,
  });

  return milestones;
}

export async function getStudyPlanRecommendations(
  _userId: string,
  performance: Record<string, number>
): Promise<string[]> {
  try {
    const recommendations: string[] = [];

    Object.entries(performance).forEach(([topic, score]) => {
      if (score < 60) {
        recommendations.push(`Focus more on ${topic} - Your score is below average`);
      } else if (score > 85) {
        recommendations.push(`Great job on ${topic}! Consider advanced challenges`);
      }
    });

    return recommendations;
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return [];
  }
}

export interface StudyStats {
  totalTopicsCompleted: number;
  averageProgress: number;
  timeSpentHours: number;
  milestonesCompleted: number;
  estimatedCompletionDate: Date;
  consistencyScore: number;
  recommendedNextSteps: string[];
}

export function calculateStudyStats(plan: StudyPlan): StudyStats {
  const completedTopics = plan.topics.filter((t) => t.completed).length;
  const completedMilestones = plan.milestones.filter((m) => m.completed).length;
  const daysRemaining = Math.max(
    0,
    Math.floor(
      (new Date(plan.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  );

  return {
    totalTopicsCompleted: completedTopics,
    averageProgress: plan.progress,
    timeSpentHours: 0,
    milestonesCompleted: completedMilestones,
    estimatedCompletionDate: new Date(
      Date.now() + daysRemaining * 24 * 60 * 60 * 1000
    ),
    consistencyScore: Math.round(Math.random() * 100),
    recommendedNextSteps: [
      "Continue with next topic",
      "Review weak areas",
      "Schedule mock interview",
    ],
  };
}
