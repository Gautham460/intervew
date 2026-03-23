import { db } from "@/config/firebase.config";
import { collection, getDocs, query, where } from "firebase/firestore";

export interface SkillQuestion {
  skill: string;
  question: string;
  expectedAnswer: string;
}

export interface SkillQuestionDocument {
  skill: string;
  questions: {
    question: string;
    expectedAnswer: string;
  }[];
}

/**
 * Fetch questions from database for a given skill
 */
export const fetchQuestionsForSkill = async (
  skill: string
): Promise<SkillQuestion[]> => {
  try {
    const questionsRef = collection(db, "skillQuestions");
    const q = query(questionsRef, where("skill", "==", skill));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn(`No questions found for skill: ${skill}`);
      return [];
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data() as SkillQuestionDocument;

    // Format questions with skill name
    return data.questions.map((q) => ({
      skill: data.skill,
      question: q.question,
      expectedAnswer: q.expectedAnswer,
    }));
  } catch (error) {
    console.error(`Error fetching questions for skill ${skill}:`, error);
    return [];
  }
};

/**
 * Fetch questions for multiple skills
 */
export const fetchQuestionsForSkills = async (
  skills: string[]
): Promise<SkillQuestion[]> => {
  try {
    const allQuestions: SkillQuestion[] = [];

    // Fetch questions for each skill (max 2 questions per skill)
    for (const skill of skills) {
      const questions = await fetchQuestionsForSkill(skill);
      allQuestions.push(...questions.slice(0, 2)); // Limit to 2 questions per skill
    }

    return allQuestions;
  } catch (error) {
    console.error("Error fetching questions for multiple skills:", error);
    return [];
  }
};

/**
 * Get all available skills from database
 */
export const getAvailableSkills = async (): Promise<string[]> => {
  try {
    const questionsRef = collection(db, "skillQuestions");
    const querySnapshot = await getDocs(questionsRef);

    const skills: string[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as SkillQuestionDocument;
      if (data.skill) {
        skills.push(data.skill);
      }
    });

    return skills.sort();
  } catch (error) {
    console.error("Error fetching available skills:", error);
    return [];
  }
};
