import { db } from "@/config/firebase.config";
import { collection, addDoc, updateDoc, doc, getDocs, query, where } from "firebase/firestore";

export interface AdaptiveQuestion {
  id?: string;
  baseQuestion: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  variants: QuestionVariant[];
  createdAt?: Date;
}

export interface QuestionVariant {
  id: string;
  text: string;
  difficulty: "easy" | "medium" | "hard";
  keywords: string[];
}

export interface UserPerformanceData {
  userId: string;
  categoryScores: Record<string, number>;
  attemptCounts: Record<string, number>;
  averageConfidence: number;
  strongCategories: string[];
  weakCategories: string[];
  learningCurve: number;
}

export const adaptiveDifficultyRules = {
  promote: {
    condition: (score: number, attempts: number) => score >= 80 && attempts >= 2,
    difficulty: (current: string) => {
      if (current === "easy") return "medium";
      if (current === "medium") return "hard";
      return "hard";
    },
  },
  demote: {
    condition: (score: number, attempts: number) => score < 50 && attempts >= 1,
    difficulty: (current: string) => {
      if (current === "hard") return "medium";
      if (current === "medium") return "easy";
      return "easy";
    },
  },
};

export async function selectAdaptiveQuestion(
  _userId: string,
  category: string,
  currentPerformance: UserPerformanceData
): Promise<string | null> {
  try {
    const questions = await getDocs(
      query(collection(db, "adaptive_questions"), where("category", "==", category))
    );

    if (questions.docs.length === 0) return null;

    // Determine difficulty based on performance
    const userScore = currentPerformance.categoryScores[category] || 50;
    const attempts = currentPerformance.attemptCounts[category] || 0;

    let selectedDifficulty = "medium" as "easy" | "medium" | "hard";

    if (
      adaptiveDifficultyRules.promote.condition(userScore, attempts)
    ) {
      selectedDifficulty = adaptiveDifficultyRules.promote.difficulty(
        currentPerformance.categoryScores[category] ? "hard" : "medium"
      ) as "easy" | "medium" | "hard";
    } else if (adaptiveDifficultyRules.demote.condition(userScore, attempts)) {
      selectedDifficulty = adaptiveDifficultyRules.demote.difficulty(
        currentPerformance.categoryScores[category] ? "hard" : "easy"
      ) as "easy" | "medium" | "hard";
    }

    // Filter questions by selected difficulty
    const filtered = questions.docs.filter(
      (doc) =>
        doc.data().difficulty === selectedDifficulty ||
        currentPerformance.weakCategories.includes(category)
    );

    if (filtered.length === 0) return questions.docs[0].id;

    return filtered[Math.floor(Math.random() * filtered.length)].id;
  } catch (error) {
    console.error("Error selecting adaptive question:", error);
    return null;
  }
}

export async function updateUserPerformance(
  userId: string,
  category: string,
  score: number
): Promise<void> {
  try {
    const userDocs = await getDocs(
      query(collection(db, "user_performance"), where("userId", "==", userId))
    );

    if (userDocs.docs.length === 0) {
      await addDoc(collection(db, "user_performance"), {
        userId,
        categoryScores: { [category]: score },
        attemptCounts: { [category]: 1 },
        averageConfidence: score,
        strongCategories: [],
        weakCategories: [category],
        learningCurve: 0,
        createdAt: new Date(),
      });
    } else {
      const docRef = doc(db, "user_performance", userDocs.docs[0].id);
      const currentData = userDocs.docs[0].data();
      const avgScore = (currentData.categoryScores?.[category] || 0 + score) / 2;
      const attempts = (currentData.attemptCounts?.[category] || 0) + 1;

      await updateDoc(docRef, {
        categoryScores: {
          ...currentData.categoryScores,
          [category]: avgScore,
        },
        attemptCounts: {
          ...currentData.attemptCounts,
          [category]: attempts,
        },
      });
    }
  } catch (error) {
    console.error("Error updating user performance:", error);
    throw error;
  }
}

export async function getUserPerformance(userId: string): Promise<UserPerformanceData | null> {
  try {
    const userDocs = await getDocs(
      query(collection(db, "user_performance"), where("userId", "==", userId))
    );

    if (userDocs.docs.length === 0) return null;

    const data = userDocs.docs[0].data();
const scores = Object.values(data.categoryScores || {}) as number[];
      const avgScore = scores.reduce((a: number, b: number) => a + b, 0) /
      (scores.length || 1);

    return {
      userId,
      categoryScores: data.categoryScores || {},
      attemptCounts: data.attemptCounts || {},
      averageConfidence: avgScore,
      strongCategories: data.strongCategories || [],
      weakCategories: data.weakCategories || [],
      learningCurve: data.learningCurve || 0,
    };
  } catch (error) {
    console.error("Error fetching user performance:", error);
    return null;
  }
}

// Removed duplicate export

export function calculateLearningCurve(performances: Array<{ score: number; date: Date }>): number {
  if (performances.length < 2) return 0;

  const sortedByDate = performances.sort((a, b) => a.date.getTime() - b.date.getTime());
  const firstScore = sortedByDate[0].score;
  const lastScore = sortedByDate[sortedByDate.length - 1].score;

  return lastScore - firstScore;
}
