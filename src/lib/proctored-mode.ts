import { db } from "@/config/firebase.config";
import { collection, addDoc, updateDoc, doc, getDoc } from "firebase/firestore";

export interface ProctorSession {
  id?: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  difficulty: "easy" | "medium" | "hard";
  questionCount: number;
  questions: string[];
  answers: ProctorAnswer[];
  score: number;
  status: "in-progress" | "completed" | "flagged";
  violations: ProctorViolation[];
  environment: EnvironmentData;
  createdAt?: Date;
}

export interface ProctorAnswer {
  questionIndex: number;
  answer: string;
  timeSpent: number;
  confidence: number;
  flagged: boolean;
}

export interface ProctorViolation {
  type: "tab-switch" | "copy-paste" | "audio-off" | "face-not-detected" | "multiple-faces" | "unusual-activity";
  timestamp: Date;
  severity: "warning" | "critical";
  description: string;
}

export interface EnvironmentData {
  browserInfo: string;
  screenResolution: string;
  cameraDetected: boolean;
  microphoneDetected: boolean;
  systemTime: Date;
}

export async function startProctorSession(
  userId: string,
  difficulty: "easy" | "medium" | "hard"
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "proctor_sessions"), {
      userId,
      difficulty,
      startTime: new Date(),
      duration: 0,
      questionCount: difficulty === "easy" ? 3 : difficulty === "medium" ? 5 : 7,
      answers: [],
      score: 0,
      status: "in-progress",
      violations: [],
      environment: getEnvironmentData(),
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error starting proctor session:", error);
    throw error;
  }
}

export async function recordAnswer(
  sessionId: string,
  answer: ProctorAnswer
): Promise<void> {
  try {
    const docRef = doc(db, "proctor_sessions", sessionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const currentAnswers = docSnap.data().answers || [];
      await updateDoc(docRef, {
        answers: [...currentAnswers, answer],
      });
    }
  } catch (error) {
    console.error("Error recording answer:", error);
    throw error;
  }
}

export async function flagViolation(
  sessionId: string,
  violation: ProctorViolation
): Promise<void> {
  try {
    const docRef = doc(db, "proctor_sessions", sessionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const session = docSnap.data() as ProctorSession;
      const updatedViolations = [...(session.violations || []), violation];

      let status: "in-progress" | "completed" | "flagged" = "in-progress";
      if (
        updatedViolations.filter((v) => v.severity === "critical").length >= 2
      ) {
        status = "flagged";
      }

      await updateDoc(docRef, {
        violations: updatedViolations,
        status,
      });
    }
  } catch (error) {
    console.error("Error flagging violation:", error);
    throw error;
  }
}

export async function completeProctorSession(
  sessionId: string,
  questions: string[] = []
): Promise<number> {
  try {
    const endTime = new Date();
    const docRef = doc(db, "proctor_sessions", sessionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const sessionData = docSnap.data();
      const startTime = sessionData.startTime?.toDate?.() || new Date(sessionData.startTime);
      const duration = (endTime.getTime() - startTime.getTime()) / 60000;
      
      const session = { id: docSnap.id, ...sessionData } as ProctorSession;
      const finalScore = calculateProctorScore(session, questions);

      await updateDoc(docRef, {
        endTime,
        duration: Math.round(duration),
        score: finalScore,
        status: "completed",
      });

      return finalScore;
    }
    return 0;
  } catch (error) {
    console.error("Error completing session:", error);
    throw error;
  }
}

export function getEnvironmentData(): EnvironmentData {
  return {
    browserInfo: navigator.userAgent,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    cameraDetected: false,
    microphoneDetected: false,
    systemTime: new Date(),
  };
}

export async function monitorEnvironment(sessionId: string): Promise<void> {
  try {
    let tabSwitches = 0;
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        tabSwitches++;
        if (tabSwitches >= 2) {
          await flagViolation(sessionId, {
            type: "tab-switch",
            timestamp: new Date(),
            severity: "critical",
            description: "User switched tabs multiple times",
          });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
  } catch (error) {
    console.error("Error monitoring environment:", error);
  }
}

const KEYWORDS: { [key: string]: string[] } = {
  "Describe a system design for a URL shortener like bit.ly": ["hash", "hashing", "base62", "redirect", "short", "unique", "id", "sharding", "database", "api"],
  "What is the difference between SQL and NoSQL databases?": ["schema", "structured", "unstructured", "scaling", "horizontal", "vertical", "acid", "document", "relational", "flexibility"],
  "Explain the concept of microservices architecture": ["distributed", "independent", "decoupled", "monolith", "deployment", "scaling", "api", "communication", "service", "loose"],
  "How would you approach debugging a production issue?": ["logs", "monitoring", "hypothesis", "rollback", "environment", "metrics", "isolation", "reproduce", "incident", "root cause"],
  "What is your experience with cloud platforms?": ["aws", "azure", "gcp", "instances", "storage", "deployment", "serverless", "infrastructure", "scaling", "security"]
};

export function calculateProctorScore(session: ProctorSession, questions: string[] = []): number {
  let contentScore = 0;
  
  if (session.answers.length > 0) {
    session.answers.forEach((ans) => {
      let qScore = 0;
      const questionText = questions[ans.questionIndex];
      const answerLower = ans.answer.toLowerCase();
      
      // 1. Length check (up to 40 points)
      if (ans.answer.length > 300) qScore += 40;
      else if (ans.answer.length > 100) qScore += 20;
      else if (ans.answer.length > 50) qScore += 10;

      // 2. Keyword check (up to 60 points)
      if (questionText && KEYWORDS[questionText]) {
        const matches = KEYWORDS[questionText].filter(k => answerLower.includes(k)).length;
        qScore += Math.min(60, matches * 10);
      }
      
      contentScore += qScore;
    });
    
    // Average content score across questions
    contentScore = contentScore / session.answers.length;
  } else {
    contentScore = 0;
  }

  // 3. Penalty for violations
  let penalty = 0;
  session.violations.forEach((v) => {
    penalty += v.severity === "critical" ? 15 : 5;
  });

  return Math.max(0, Math.round(contentScore - penalty));
}
