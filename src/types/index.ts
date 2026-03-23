import { FieldValue, Timestamp } from "firebase/firestore";

export interface User {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  role?: "candidate" | "recruiter" | "admin";
  organizationId?: string;
  createdAt: Timestamp | FieldValue;
  updateAt: Timestamp | FieldValue;
}

export interface Organization {
  id: string;
  name: string;
  domain: string;
  createdAt: Timestamp;
}

export interface Interview {
  id: string;
  position: string;
  description: string;
  experience: number;
  userId: string;
  techStack: string;
  questions: { question: string; answer: string }[];
  skillQuestions?: { skill: string; question: string; expectedAnswer: string }[];
  difficulty?: "easy" | "medium" | "hard";
  preferredCompany?: string;
  organizationId?: string;
  createdAt: Timestamp;
  updateAt: Timestamp;
}

export interface UserAnswer {
  id: string;
  mockIdRef: string;
  question: string;
  correct_ans: string;
  user_ans: string;
  feedback: string;
  rating: number;
  userId: string;
  createdAt: Timestamp;
  updateAt: Timestamp;
}
