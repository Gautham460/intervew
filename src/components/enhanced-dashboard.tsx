import { useState, useMemo, useEffect } from "react";
import { Headings } from "@/components/headings";
import { InterviewPin } from "@/components/pin";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { db } from "@/config/firebase.config";
import { Interview, UserAnswer } from "@/types";
import { useAuth } from "@clerk/clerk-react";
import { collection, onSnapshot, query, where, getDocs } from "firebase/firestore";
import { Plus, Search, Filter, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  EnhancedInterview,
  InterviewFilter,
  enhanceInterviewWithMetrics,
  filterInterviews,
  searchInterviews,
  getInterviewStats,
} from "@/lib/interview-filters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const EnhancedDashboard = () => {
  const [interviews, setInterviews] = useState<EnhancedInterview[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<InterviewFilter>({
    status: "all",
    sortBy: "date",
    sortOrder: "desc",
  });
  const [_allFeedbacks, setAllFeedbacks] = useState<UserAnswer[]>([]);
  const { userId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;

    setLoading(true);

    // Fetch interviews
    const interviewQuery = query(
      collection(db, "interviews"),
      where("userId", "==", userId)
    );

    const unsubscribe = onSnapshot(
      interviewQuery,
      async (snapshot) => {
        const interviewList: Interview[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Interview[];

        // Fetch all feedbacks for metrics
        const feedbackQuery = query(
          collection(db, "userAnswers"),
          where("userId", "==", userId)
        );

        const feedbackSnap = await getDocs(feedbackQuery);
        const feedbackList = feedbackSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as UserAnswer[];

        setAllFeedbacks(feedbackList);

        // Enhance interviews with metrics
        const enhanced = interviewList.map((interview) => {
          const interviewFeedbacks = feedbackList.filter(
            (f) => f.mockIdRef === interview.id
          );
          return enhanceInterviewWithMetrics(interview, interviewFeedbacks);
        });

        setInterviews(enhanced);
        setLoading(false);
      },
      (error) => {
        console.log("Error fetching interviews:", error);
        toast.error("Error", {
          description: "Failed to load interviews. Try again later.",
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const filteredAndSearched = useMemo(() => {
    let result = interviews;

    // Apply search
    if (searchQuery.trim()) {
      result = searchInterviews(result, searchQuery);
    }

    // Apply filters
    result = filterInterviews(result, filters);

    return result;
  }, [interviews, searchQuery, filters]);

  const stats = useMemo(() => getInterviewStats(interviews), [interviews]);

  const handleFilterChange = (key: keyof InterviewFilter, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col w-full gap-6 py-5">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div>
          <Headings title="My Interviews" description="View and manage all your mock interviews" />
        </div>
        <Button onClick={() => navigate("/generate")}>
          <Plus className="w-4 h-4 mr-2" />
          New Interview
        </Button>
      </div>

      <Separator />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Interviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-600">{stats.averageScore.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Avg Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by position, description, or tech stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Select
            value={filters.status || "all"}
            onValueChange={(value: any) => handleFilterChange("status", value)}
          >
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">In Progress</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.sortBy || "date"}
            onValueChange={(value: any) => handleFilterChange("sortBy", value)}
          >
            <SelectTrigger className="w-full sm:w-48">
              <ChevronDown className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Latest First</SelectItem>
              <SelectItem value="score">Score (High to Low)</SelectItem>
              <SelectItem value="position">Position (A-Z)</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Badge variant="outline">{filteredAndSearched.length} Results</Badge>
            {(searchQuery || filters.status !== "all" || filters.sortBy !== "date") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setFilters({ status: "all", sortBy: "date", sortOrder: "desc" });
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Interviews List */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        ) : filteredAndSearched.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">No interviews found</p>
            <Button onClick={() => navigate("/generate")}>
              Create your first interview
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSearched.map((interview) => (
              <div key={interview.id} className="relative">
                <InterviewPin interview={interview} />
                {/* Score Badge */}
                {interview.score !== undefined && (
                  <div className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md">
                    <div
                      className={`text-xs font-bold ${
                        interview.score >= 8
                          ? "text-emerald-600"
                          : interview.score >= 6
                          ? "text-blue-600"
                          : interview.score >= 4
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {interview.score.toFixed(1)}
                    </div>
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-2 left-2">
                  <Badge
                    variant={interview.status === "completed" ? "default" : "secondary"}
                  >
                    {interview.status === "completed" ? "✓ Done" : "In Progress"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
