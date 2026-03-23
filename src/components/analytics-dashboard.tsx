import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/config/firebase.config";
import { useAuth } from "@clerk/clerk-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Interview, UserAnswer } from "@/types";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { LoaderPage } from "@/routes/loader-page";
import { Badge } from "./ui/badge";
import { TrendingDown, TrendingUp } from "lucide-react";

export const AnalyticsDashboard = ({ userId: propUserId }: { userId?: string }) => {
  const { userId: authUserId } = useAuth();
  const userId = propUserId || authUserId;
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [feedbacks, setFeedbacks] = useState<UserAnswer[]>([]);
  const [proctorSessions, setProctorSessions] = useState<any[]>([]);
  const [companyAttempts, setCompanyAttempts] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      try {
        // Fetch data in parallel
        const [interviewSnap, feedbackSnap, proctorSnap, companySnap] = await Promise.all([
          getDocs(query(collection(db, "interviews"), where("userId", "==", userId))),
          getDocs(query(collection(db, "userAnswers"), where("userId", "==", userId))),
          getDocs(query(collection(db, "proctor_sessions"), where("userId", "==", userId))),
          getDocs(query(collection(db, "companyQuestionAttempts"), where("userId", "==", userId))),
        ]);

        const interviewList = interviewSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Interview[];
        setInterviews(interviewList);

        const feedbackList = feedbackSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as UserAnswer[];
        setFeedbacks(feedbackList);

        const proctorList = proctorSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProctorSessions(proctorList);

        const companyList = companySnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCompanyAttempts(companyList);

        // Process data for charts
        processChartsData(interviewList, feedbackList, proctorList, companyList);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const processChartsData = (
    _interviews: Interview[], 
    feedbacks: UserAnswer[], 
    proctorSessions: any[],
    companyAttempts: any[]
  ) => {
    // Prepare all data points
    const performanceByDate: { [key: string]: number[] } = {};

    const addToPerformance = (date: string, rating: number) => {
      if (!performanceByDate[date]) {
        performanceByDate[date] = [];
      }
      performanceByDate[date].push(rating);
    };

    // Regular feedbacks
    feedbacks.forEach((fb) => {
      const date = new Date(fb.createdAt.toDate()).toLocaleDateString();
      addToPerformance(date, fb.rating);
    });

    // Proctor sessions (normalized)
    proctorSessions.forEach((session) => {
      if (session.status === "completed") {
        const date = new Date((session.endTime || session.createdAt).toDate()).toLocaleDateString();
        addToPerformance(date, session.score / 10);
      }
    });

    // Company question attempts
    companyAttempts.forEach((attempt) => {
      const date = new Date(attempt.createdAt.toDate()).toLocaleDateString();
      addToPerformance(date, attempt.rating);
    });

    const chartDataProcessed = Object.entries(performanceByDate).map(([date, ratings]) => ({
      date,
      avgScore: Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10,
      questionsAttempted: ratings.length,
    }));

    setChartData(chartDataProcessed.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));

    // Prepare performance distribution
    const allRatings = [
      ...feedbacks.map(f => f.rating),
      ...proctorSessions.filter(s => s.status === "completed").map(s => s.score / 10),
      ...companyAttempts.map(a => a.rating)
    ];

    const performanceDistribution = [
      {
        name: "Excellent (8-10)",
        value: allRatings.filter((r) => r >= 8).length,
        fill: "#10b981",
      },
      {
        name: "Good (6-7.9)",
        value: allRatings.filter((r) => r >= 6 && r < 8).length,
        fill: "#3b82f6",
      },
      {
        name: "Fair (4-5.9)",
        value: allRatings.filter((r) => r >= 4 && r < 6).length,
        fill: "#eab308",
      },
      {
        name: "Poor (<4)",
        value: allRatings.filter((r) => r < 4).length,
        fill: "#ef4444",
      },
    ];

    setPerformanceData(performanceDistribution.filter((d) => d.value > 0));
  };

  if (loading) {
    return <LoaderPage className="w-full h-[400px]" />;
  }

  const allFeedbacksCount = feedbacks.length + proctorSessions.filter(s => s.status === "completed").length + companyAttempts.length;
  const totalScoreSum = 
    feedbacks.reduce((sum, f) => sum + f.rating, 0) + 
    proctorSessions.filter(s => s.status === "completed").reduce((sum, s) => sum + (s.score / 10), 0) +
    companyAttempts.reduce((sum, a) => sum + a.rating, 0);

  const avgScore = allFeedbacksCount > 0 ? Math.round((totalScoreSum / allFeedbacksCount) * 10) / 10 : 0;

  const completedInterviews = 
    interviews.filter((i) => {
      const interviewFeedbacks = feedbacks.filter((f) => f.mockIdRef === i.id);
      return interviewFeedbacks.length === (i.questions?.length || 0);
    }).length + proctorSessions.filter(s => s.status === "completed").length + companyAttempts.length;

  const trend =
    chartData.length > 1
      ? chartData[chartData.length - 1].avgScore >= chartData[0].avgScore
        ? "improving"
        : "declining"
      : "stable";

  return (
    <div className="w-full space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{avgScore.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">out of 10</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Interviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{completedInterviews}</div>
            <p className="text-xs text-muted-foreground mt-1">of {interviews.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{feedbacks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">attempted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              Trend
              {trend === "improving" && <TrendingUp className="w-4 h-4 text-emerald-500" />}
              {trend === "declining" && <TrendingDown className="w-4 h-4 text-red-500" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={trend === "improving" ? "default" : trend === "declining" ? "destructive" : "secondary"}>
              {trend === "improving" ? "Improving" : trend === "declining" ? "Declining" : "Stable"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Performance Over Time */}
        {chartData.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avgScore"
                    stroke="#3b82f6"
                    name="Average Score"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="questionsAttempted"
                    stroke="#10b981"
                    name="Questions"
                    yAxisId="right"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Performance Distribution */}
        {performanceData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={performanceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(_data: any) => `${_data.value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Questions Attempted Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Questions Attempted by Date</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="questionsAttempted" fill="#3b82f6" name="Questions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
