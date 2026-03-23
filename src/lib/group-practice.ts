import { db } from "@/config/firebase.config";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

export interface GroupSession {
  id?: string;
  name: string;
  description: string;
  createdBy: string;
  members: string[];
  invitedEmails: string[];
  status: "scheduled" | "active" | "completed";
  scheduledTime?: Date;
  completedAt?: Date;
  difficulty: "easy" | "medium" | "hard";
  questions: string[];
  results: SessionResult[];
  createdAt?: Date;
}

export interface SessionResult {
  userId: string;
  userName: string;
  questionIndex: number;
  score: number;
  timeSpent: number;
  feedback: string;
  completedAt: Date;
}

export async function createGroupSession(session: GroupSession): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "group_sessions"), {
      ...session,
      createdAt: new Date(),
      results: [],
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating group session:", error);
    throw error;
  }
}

export async function getGroupSessions(userId: string): Promise<GroupSession[]> {
  try {
    const q = query(
      collection(db, "group_sessions"),
      where("members", "array-contains", userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.(),
      scheduledTime: doc.data().scheduledTime?.toDate?.(),
    } as GroupSession));
  } catch (error) {
    console.error("Error fetching group sessions:", error);
    return [];
  }
}

export async function inviteToSession(sessionId: string, emailAddresses: string[]): Promise<void> {
  try {
    const docRef = doc(db, "group_sessions", sessionId);
    const session = await getDocs(query(collection(db, "group_sessions"), where("id", "==", sessionId)));
    if (session.docs.length > 0) {
      const currentInvites = session.docs[0].data().invitedEmails || [];
      await updateDoc(docRef, {
        invitedEmails: [...new Set([...currentInvites, ...emailAddresses])],
      });
    }
  } catch (error) {
    console.error("Error inviting to session:", error);
    throw error;
  }
}

export async function addSessionResult(
  sessionId: string,
  result: SessionResult
): Promise<void> {
  try {
    const docRef = doc(db, "group_sessions", sessionId);
    const session = await getDocs(query(collection(db, "group_sessions"), where("id", "==", sessionId)));
    if (session.docs.length > 0) {
      const currentResults = session.docs[0].data().results || [];
      await updateDoc(docRef, {
        results: [...currentResults, result],
      });
    }
  } catch (error) {
    console.error("Error adding session result:", error);
    throw error;
  }
}

export async function endGroupSession(sessionId: string): Promise<void> {
  try {
    await updateDoc(doc(db, "group_sessions", sessionId), {
      status: "completed",
      completedAt: new Date(),
    });
  } catch (error) {
    console.error("Error ending session:", error);
    throw error;
  }
}

export function calculateGroupStats(session: GroupSession) {
  if (session.results.length === 0) {
    return { avgScore: 0, topScorer: null, totalParticipants: 0, avgTime: 0 };
  }

  const avgScore = session.results.reduce((sum, r) => sum + r.score, 0) / session.results.length;
  const avgTime = session.results.reduce((sum, r) => sum + r.timeSpent, 0) / session.results.length;
  const topScorer = session.results.reduce((max, r) => (r.score > max.score ? r : max));

  return {
    avgScore: Math.round(avgScore),
    topScorer,
    totalParticipants: session.members.length,
    avgTime: Math.round(avgTime),
  };
}
