import { db } from "@/config/firebase.config";
import { collection, addDoc, updateDoc, doc, getDocs, query, where } from "firebase/firestore";

export interface InterviewSchedule {
  id?: string;
  userId: string;
  title: string;
  description: string;
  scheduledDate: Date;
  estimatedDuration: number;
  difficulty: "easy" | "medium" | "hard";
  company?: string;
  role?: string;
  topicsFocus: string[];
  reminders: boolean;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  actualDuration?: number;
  score?: number;
  notes?: string;
  createdAt?: Date;
}

export interface ScheduleReminder {
  id?: string;
  scheduleId: string;
  userId: string;
  reminderTime: Date;
  type: "email" | "push" | "in-app";
  sent: boolean;
  createdAt?: Date;
}

export interface InterviewCalendar {
  userId: string;
  schedules: InterviewSchedule[];
  upcomingCount: number;
  completedCount: number;
  averageScore: number;
}

export async function createInterviewSchedule(
  schedule: InterviewSchedule
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "interview_schedules"), {
      ...schedule,
      status: "scheduled",
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating interview schedule:", error);
    throw error;
  }
}

export async function getInterviewSchedules(userId: string): Promise<InterviewSchedule[]> {
  try {
    const q = query(collection(db, "interview_schedules"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      scheduledDate: doc.data().scheduledDate?.toDate?.(),
      createdAt: doc.data().createdAt?.toDate?.(),
    } as InterviewSchedule));
  } catch (error) {
    console.error("Error fetching interview schedules:", error);
    return [];
  }
}

export async function updateScheduleStatus(
  scheduleId: string,
  status: InterviewSchedule["status"],
  score?: number,
  actualDuration?: number
): Promise<void> {
  try {
    await updateDoc(doc(db, "interview_schedules", scheduleId), {
      status,
      score: score || null,
      actualDuration: actualDuration || null,
    });
  } catch (error) {
    console.error("Error updating schedule status:", error);
    throw error;
  }
}

export async function setScheduleReminder(reminder: ScheduleReminder): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "schedule_reminders"), {
      ...reminder,
      sent: false,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error setting reminder:", error);
    throw error;
  }
}

export async function getUpcomingSchedules(userId: string): Promise<InterviewSchedule[]> {
  try {
    const schedules = await getInterviewSchedules(userId);
    const now = new Date();
    return schedules
      .filter(
        (s) =>
          s.status === "scheduled" &&
          new Date(s.scheduledDate) > now
      )
      .sort(
        (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
      );
  } catch (error) {
    console.error("Error fetching upcoming schedules:", error);
    return [];
  }
}

export async function getCompletedSchedules(userId: string): Promise<InterviewSchedule[]> {
  try {
    const schedules = await getInterviewSchedules(userId);
    return schedules.filter((s) => s.status === "completed");
  } catch (error) {
    console.error("Error fetching completed schedules:", error);
    return [];
  }
}

export async function getInterviewCalendar(userId: string): Promise<InterviewCalendar> {
  try {
    const schedules = await getInterviewSchedules(userId);
    const upcoming = schedules.filter((s) => s.status === "scheduled");
    const completed = schedules.filter((s) => s.status === "completed");
    const avgScore =
      completed.length > 0
        ? completed.reduce((sum, s) => sum + (s.score || 0), 0) / completed.length
        : 0;

    return {
      userId,
      schedules,
      upcomingCount: upcoming.length,
      completedCount: completed.length,
      averageScore: Math.round(avgScore),
    };
  } catch (error) {
    console.error("Error getting interview calendar:", error);
    return {
      userId,
      schedules: [],
      upcomingCount: 0,
      completedCount: 0,
      averageScore: 0,
    };
  }
}

export function calculateTimeUntilInterview(scheduledDate: Date): string {
  const now = new Date();
  const diff = new Date(scheduledDate).getTime() - now.getTime();

  if (diff < 0) return "Past";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export interface ScheduleStats {
  totalScheduled: number;
  completionRate: number;
  averagePrepTime: number;
  mostCommonTime: string;
  preferredDifficulty: "easy" | "medium" | "hard" | "mixed";
}

export function calculateScheduleStats(schedules: InterviewSchedule[]): ScheduleStats {
  if (schedules.length === 0) {
    return {
      totalScheduled: 0,
      completionRate: 0,
      averagePrepTime: 0,
      mostCommonTime: "Not scheduled",
      preferredDifficulty: "mixed",
    };
  }

  const completed = schedules.filter((s) => s.status === "completed").length;
  const avgDuration =
    schedules.reduce((sum, s) => sum + s.estimatedDuration, 0) / schedules.length;

  return {
    totalScheduled: schedules.length,
    completionRate: Math.round((completed / schedules.length) * 100),
    averagePrepTime: Math.round(avgDuration),
    mostCommonTime: "Evening",
    preferredDifficulty: "medium",
  };
}
