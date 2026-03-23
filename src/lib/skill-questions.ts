import { chatSession } from "@/scripts";
import { SkillMatch } from "@/lib/resume-parser";

export interface SkillQuestion {
  skill: string;
  question: string;
  expectedAnswer: string;
}

/**
 * Generate interview questions based on extracted skills
 */
export const generateSkillBasedQuestions = async (
  skills: SkillMatch[],
  questionsPerSkill: number = 2
): Promise<SkillQuestion[]> => {
  if (skills.length === 0) {
    return [];
  }

  // Select up to 5 skills (to keep the interview manageable)
  const selectedSkills = skills.slice(0, 5);
  const skillNames = selectedSkills.map((s) => s.skill).join(", ");

  const prompt = `
You are an experienced technical interviewer. Generate concise and practical interview questions based on the following skills: ${skillNames}.

Generate ${questionsPerSkill} question(s) per skill (total: ${selectedSkills.length * questionsPerSkill} questions).

For each skill, create questions that:
1. Are practical and real-world focused
2. Test both understanding and hands-on experience
3. Are suitable for voice-based answers (keep expected answers to 2-3 sentences)

Format your response as a JSON array with this exact structure (NO additional text):
[
  {
    "skill": "SkillName",
    "question": "What is your experience with SkillName?",
    "expectedAnswer": "Concise expected answer about the skill"
  }
]

IMPORTANT: Return ONLY the JSON array, no markdown formatting, no code blocks, no explanations.
`;

  try {
    const response = await chatSession.sendMessage(prompt);
    const responseText = response.response.text();

    // Clean and parse the response
    let cleanedText = responseText.trim();
    cleanedText = cleanedText.replace(/(json|```|`)/g, "");

    const jsonMatch = cleanedText.match(/\[.*\]/s);
    if (!jsonMatch) {
      throw new Error("No JSON array found in response");
    }

    const questions: SkillQuestion[] = JSON.parse(jsonMatch[0]);
    return questions;
  } catch (error) {
    console.error("Error generating skill-based questions:", error);
    // Return fallback questions if API fails
    return generateFallbackSkillQuestions(selectedSkills);
  }
};

/**
 * Fallback questions when API fails
 */
const generateFallbackSkillQuestions = (skills: SkillMatch[]): SkillQuestion[] => {
  const fallbackQuestions: { [key: string]: string[] } = {
    React: [
      "What is the difference between state and props in React?",
      "How do React hooks improve component logic?",
    ],
    "TypeScript": [
      "How does TypeScript help catch errors early in development?",
      "What are the benefits of using interfaces in TypeScript?",
    ],
    "Node.js": [
      "How does the event-driven architecture work in Node.js?",
      "Explain the concept of middleware in Express.js",
    ],
    "Python": [
      "What are the advantages of Python for backend development?",
      "Explain the concept of decorators in Python",
    ],
    "AWS": [
      "What are the key services you've used in AWS?",
      "How would you design a scalable application on AWS?",
    ],
    "Docker": [
      "How does containerization help in application deployment?",
      "What is the difference between Docker images and containers?",
    ],
    "SQL": [
      "What are the different types of joins in SQL?",
      "How do you optimize slow SQL queries?",
    ],
    "MongoDB": [
      "What are the advantages of using MongoDB over relational databases?",
      "How do you structure documents in MongoDB?",
    ],
  };

  const questions: SkillQuestion[] = [];

  skills.forEach((skill) => {
    const skillName = skill.skill;
    const skillQuestions = fallbackQuestions[skillName] || [
      `What is your experience level with ${skillName}?`,
      `How have you used ${skillName} in your projects?`,
    ];

    skillQuestions.slice(0, 2).forEach((q) => {
      questions.push({
        skill: skillName,
        question: q,
        expectedAnswer: `Provide a thoughtful answer about your experience with ${skillName}.`,
      });
    });
  });

  return questions;
};
