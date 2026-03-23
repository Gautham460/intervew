import { Interview, UserAnswer } from "@/types";

export interface InterviewFilter {
  position?: string;
  minScore?: number;
  maxScore?: number;
  dateFrom?: Date;
  dateTo?: Date;
  status?: "completed" | "pending" | "all";
  sortBy?: "date" | "score" | "position";
  sortOrder?: "asc" | "desc";
}

export interface EnhancedInterview extends Interview {
  score?: number;
  status: "completed" | "pending";
  questionCount: number;
  completionPercentage: number;
  timeSpent?: number; // minutes
}

export const enhanceInterviewWithMetrics = (
  interview: Interview,
  feedbacks: UserAnswer[]
): EnhancedInterview => {
  const score =
    feedbacks.length > 0
      ? Math.round(
          (feedbacks.reduce((sum, f) => sum + f.rating, 0) /
            feedbacks.length) *
            10
        ) / 10
      : 0;

  const questionCount = interview.questions?.length || 0;
  const answeredCount = feedbacks.length;
  const completionPercentage =
    questionCount > 0 ? (answeredCount / questionCount) * 100 : 0;

  return {
    ...interview,
    score,
    status: completionPercentage === 100 ? "completed" : "pending",
    questionCount,
    completionPercentage,
  };
};

export const filterInterviews = (
  interviews: EnhancedInterview[],
  filters: InterviewFilter
): EnhancedInterview[] => {
  let filtered = [...interviews];

  if (filters.position) {
    filtered = filtered.filter((i) =>
      i.position.toLowerCase().includes(filters.position?.toLowerCase() || "")
    );
  }

  if (filters.minScore !== undefined) {
    filtered = filtered.filter((i) => (i.score || 0) >= filters.minScore!);
  }

  if (filters.maxScore !== undefined) {
    filtered = filtered.filter((i) => (i.score || 0) <= filters.maxScore!);
  }

  if (filters.dateFrom) {
    filtered = filtered.filter(
      (i) => i.createdAt.toDate() >= filters.dateFrom!
    );
  }

  if (filters.dateTo) {
    filtered = filtered.filter((i) => i.createdAt.toDate() <= filters.dateTo!);
  }

  if (filters.status && filters.status !== "all") {
    filtered = filtered.filter((i) => i.status === filters.status);
  }

  // Sorting
  const sortBy = filters.sortBy || "date";
  const sortOrder = filters.sortOrder || "desc";

  filtered.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "score":
        comparison = (a.score || 0) - (b.score || 0);
        break;
      case "position":
        comparison = a.position.localeCompare(b.position);
        break;
      case "date":
      default:
        comparison =
          a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime();
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  return filtered;
};

export const searchInterviews = (
  interviews: EnhancedInterview[],
  searchQuery: string
): EnhancedInterview[] => {
  const query = searchQuery.toLowerCase();
  return interviews.filter(
    (i) =>
      i.position.toLowerCase().includes(query) ||
      i.description.toLowerCase().includes(query) ||
      i.techStack.toLowerCase().includes(query)
  );
};

export const getInterviewStats = (interviews: EnhancedInterview[]) => {
  return {
    total: interviews.length,
    completed: interviews.filter((i) => i.status === "completed").length,
    pending: interviews.filter((i) => i.status === "pending").length,
    averageScore:
      interviews.length > 0
        ? Math.round(
            (interviews.reduce((sum, i) => sum + (i.score || 0), 0) /
              interviews.length) *
              10
          ) / 10
        : 0,
    bestScore: Math.max(...interviews.map((i) => i.score || 0), 0),
    worstScore: Math.min(
      ...interviews.filter((i) => i.score).map((i) => i.score || 0),
      0
    ),
  };
};
