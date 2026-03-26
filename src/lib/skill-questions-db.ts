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

import { chatSession } from "@/scripts";
import { addDoc } from "firebase/firestore";

/**
 * Fetch questions from database for a given skill.
 * If not found, generates them using Gemini AI, saves to the database, and returns them.
 */
export const fetchQuestionsForSkill = async (
  skill: string
): Promise<SkillQuestion[]> => {
  try {
    const questionsRef = collection(db, "skillQuestions");
    const q = query(questionsRef, where("skill", "==", skill));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn(`No questions found in DB for skill: ${skill}. Generating using AI...`);
      
      const prompt = `
        Generate a JSON array of 2 technical interview questions for the specific skill/technology: "${skill}".
        Each object in the array MUST have exactly these two fields: "question" and "expectedAnswer".
        Ensure the questions are moderately difficult and evaluate core concepts of ${skill}.
        Return ONLY the JSON array, nothing else:
        [
          { "question": "<Question 1>", "expectedAnswer": "<Answer 1>" },
          { "question": "<Question 2>", "expectedAnswer": "<Answer 2>" }
        ]
      `;
      
      try {
        const response = await chatSession.sendMessage(prompt);
        let rawResponse = response.response.text().trim();
        rawResponse = rawResponse.replace(/(json|```|`)/g, "");

        const jsonMatch = rawResponse.match(/\[.*\]/s);
        if (jsonMatch) {
          rawResponse = jsonMatch[0];
        }

        const generatedData = JSON.parse(rawResponse);
        if (Array.isArray(generatedData) && generatedData.length > 0) {
          // Save to database
          await addDoc(questionsRef, {
            skill: skill,
            questions: generatedData.map((q: any) => ({
              question: q.question,
              expectedAnswer: q.expectedAnswer
            }))
          });

          return generatedData.map((q: any) => ({
            skill,
            question: q.question,
            expectedAnswer: q.expectedAnswer
          }));
        }
      } catch (e) {
        console.error(`AI Generation failed for skill ${skill}:`, e);
      }
      return [];
    }

    const docSnapshot = querySnapshot.docs[0];
    const data = docSnapshot.data() as SkillQuestionDocument;

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

    // Gemini Free Tier has a strict 15 Requests Per Minute limit. 
    // We must fetch questions sequentially with a slight delay to avoid 429 Rate Limit Quota errors.
    for (const skill of skills) {
      const questions = await fetchQuestionsForSkill(skill);
      allQuestions.push(...questions.slice(0, 2));

      // Add a 1.5 second delay between requests to keep the API happy (only if we actually made a request,
      // but it's safer to just delay slightly)
      await new Promise(resolve => setTimeout(resolve, 1500));
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
