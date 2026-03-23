import { db } from "@/config/firebase.config";
import { collection, addDoc, updateDoc, doc, getDocs, query, where } from "firebase/firestore";

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
  try {
    const topics = generateTopics(targetRole, currentLevel);
    const milestones = generateMilestones(daysAvailable);
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + daysAvailable * 24 * 60 * 60 * 1000);

    return {
      userId,
      title: `${targetRole} Interview Preparation - ${daysAvailable} Days`,
      goal: `Prepare for ${targetRole} interviews`,
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
