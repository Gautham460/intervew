import { db } from "@/config/firebase.config";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";

export interface CompanyQuestion {
  id?: string;
  company: string;
  role: string;
  question: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  tips: string[];
  exampleAnswer: string;
  frequency: number;
  addedBy: string;
  createdAt?: Date;
}

export async function getCompanyQuestions(company?: string, role?: string): Promise<CompanyQuestion[]> {
  try {
    const questionsRef = collection(db, "company_questions");
    let q = query(questionsRef);

    if (company || role) {
      const filters = [];
      if (company) {
        // Normalize company name (e.g. "google" -> "Google") to match Firebase exact-match limits
        const normalizedCompany = company.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
        filters.push(where("company", "==", normalizedCompany));
      }
      if (role) {
        // Normalize role name (e.g. "software engineer" -> "Software Engineer")
        const normalizedRole = role.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
        filters.push(where("role", "==", normalizedRole));
      }
      q = query(questionsRef, ...filters);
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.(),
    } as CompanyQuestion));
  } catch (error) {
    console.error("Error fetching company questions:", error);
    return [];
  }
}

export async function addCompanyQuestion(question: CompanyQuestion): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "company_questions"), {
      ...question,
      frequency: 0,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding company question:", error);
    throw error;
  }
}

export async function updateCompanyQuestion(id: string, updates: Partial<CompanyQuestion>): Promise<void> {
  try {
    await updateDoc(doc(db, "company_questions", id), updates);
  } catch (error) {
    console.error("Error updating company question:", error);
    throw error;
  }
}

export async function deleteCompanyQuestion(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "company_questions", id));
  } catch (error) {
    console.error("Error deleting company question:", error);
    throw error;
  }
}

export async function incrementQuestionFrequency(id: string): Promise<void> {
  try {
    const docRef = doc(db, "company_questions", id);
    const docSnap = await getDocs(query(collection(db, "company_questions"), where("id", "==", id)));
    if (docSnap.docs.length > 0) {
      const currentFreq = docSnap.docs[0].data().frequency || 0;
      await updateDoc(docRef, { frequency: currentFreq + 1 });
    }
  } catch (error) {
    console.error("Error incrementing frequency:", error);
  }
}

export async function searchCompanyQuestions(
  company: string,
  searchTerm: string
): Promise<CompanyQuestion[]> {
  try {
    const questions = await getCompanyQuestions(company);
    return questions.filter(
      (q) =>
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error("Error searching questions:", error);
    return [];
  }
}

export const popularCompanies = [
  "Google",
  "Meta",
  "Apple",
  "Microsoft",
  "Amazon",
  "Netflix",
  "Tesla",
  "Stripe",
  "Airbnb",
  "LinkedIn",
];

export const interviewCategories = [
  "Behavioral",
  "Technical",
  "System Design",
  "Data Structures",
  "Algorithms",
  "Problem Solving",
  "Leadership",
  "Communication",
];
