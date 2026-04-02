import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/config/firebase.config";
import { useAuth } from "@clerk/clerk-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
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
import { cn } from "@/lib/utils";

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
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  const [functionalityComparison, setFunctionalityComparison] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;

    let unsubscribeInterviews: () => void;
    let unsubscribeFeedbacks: () => void;
    let unsubscribeProctor: () => void;
    let unsubscribeCompany: () => void;

    let interviewList: Interview[] = [];
    let feedbackList: UserAnswer[] = [];
    let proctorList: any[] = [];
    let companyList: any[] = [];

    const updateCharts = () => {
      setInterviews(interviewList);
      setFeedbacks(feedbackList);
      setProctorSessions(proctorList);
      setCompanyAttempts(companyList);
      processChartsData(interviewList, feedbackList, proctorList, companyList);
      setLoading(false);
    };

    unsubscribeInterviews = onSnapshot(
      query(collection(db, "interviews"), where("userId", "==", userId)),
      (snap: any) => {
        interviewList = snap.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        })) as Interview[];
        updateCharts();
      }
    );

    unsubscribeFeedbacks = onSnapshot(
      query(collection(db, "userAnswers"), where("userId", "==", userId)),
      (snap: any) => {
        feedbackList = snap.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        })) as UserAnswer[];
        updateCharts();
      }
    );

    unsubscribeProctor = onSnapshot(
      query(collection(db, "proctor_sessions"), where("userId", "==", userId)),
      (snap: any) => {
        proctorList = snap.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));
        updateCharts();
      }
    );

    unsubscribeCompany = onSnapshot(
      query(collection(db, "companyQuestionAttempts"), where("userId", "==", userId)),
      (snap: any) => {
        companyList = snap.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));
        updateCharts();
      }
    );

    return () => {
      if (unsubscribeInterviews) unsubscribeInterviews();
      if (unsubscribeFeedbacks) unsubscribeFeedbacks();
      if (unsubscribeProctor) unsubscribeProctor();
      if (unsubscribeCompany) unsubscribeCompany();
    };
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

    const getDateObj = (ts: any) => {
      if (!ts) return new Date();
      if (typeof ts.toDate === "function") return ts.toDate();
      return new Date(ts);
    };

    // Regular feedbacks
    feedbacks.forEach((fb) => {
      const date = getDateObj(fb.createdAt).toLocaleDateString();
      addToPerformance(date, fb.rating);
    });

    // Proctor sessions (normalized)
    proctorSessions.forEach((session) => {
      if (session.status === "completed") {
        const date = getDateObj(session.endTime || session.createdAt).toLocaleDateString();
        addToPerformance(date, session.score / 10);
      }
    });

    // Company question attempts
    companyAttempts.forEach((attempt) => {
      const date = getDateObj(attempt.createdAt).toLocaleDateString();
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

    // Prepare Comparison Chart Data
    const mockAvg = feedbacks.length > 0 
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length) 
      : 0;
    const proctorAvg = proctorSessions.filter(s => s.status === "completed").length > 0 
      ? (proctorSessions.filter(s => s.status === "completed").reduce((sum, s) => sum + (s.score / 10), 0) / proctorSessions.filter(s => s.status === "completed").length)
      : 0;
    const companyAvg = companyAttempts.length > 0
      ? (companyAttempts.reduce((sum, a) => sum + a.rating, 0) / companyAttempts.length)
      : 0;

    const comparisonData = [
      { name: "Mock Interviews", avg: Math.round(mockAvg * 10) / 10, fill: "#6366f1" },
      { name: "Proctored Exams", avg: Math.round(proctorAvg * 10) / 10, fill: "#10b981" },
      { name: "Company Qs", avg: Math.round(companyAvg * 10) / 10, fill: "#f59e0b" },
    ].filter(d => d.avg > 0);
    setFunctionalityComparison(comparisonData);

    // Prepare History Data
    const history = [
      ...feedbacks.map(f => ({
        id: f.id,
        type: "Mock Interview",
        date: getDateObj(f.createdAt),
        score: f.rating,
        detail: f.question?.slice(0, 50) + "..."
      })),
      ...proctorSessions.filter(s => s.status === "completed").map(s => ({
        id: s.id,
        type: "Proctored Exam",
        date: getDateObj(s.endTime || s.createdAt),
        score: s.score / 10,
        detail: `Exam Score: ${s.score}%`
      })),
      ...companyAttempts.map(a => ({
        id: a.id,
        type: "Company Question",
        date: getDateObj(a.createdAt),
        score: a.rating,
        detail: a.question?.slice(0, 50) + "..."
      }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime());
    setSessionHistory(history);
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
      const totalQuestionsExpected = (i.questions?.length || 0) + (i.skillQuestions?.length || 0);
      return interviewFeedbacks.length > 0 && interviewFeedbacks.length >= totalQuestionsExpected;
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

        {/* Functionality Comparison Chart */}
        {functionalityComparison.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Functionality Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={functionalityComparison} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 10]} fontSize={10} />
                  <YAxis dataKey="name" type="category" width={100} fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="avg" radius={[0, 4, 4, 0]} name="Avg Score">
                    {functionalityComparison.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
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

      {/* Individual Functionality Analysis */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-semibold text-slate-800">Functionality Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Mock Interviews */}
          <Card className="bg-indigo-50/50 border-indigo-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-indigo-800">Mock Interviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Avg Score:</span>
                  <span className="font-bold text-indigo-700">
                    {feedbacks.length > 0 
                      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) 
                      : "0.0"} / 10
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Questions Answered:</span>
                  <span className="font-bold text-slate-700">{feedbacks.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Proctored Sessions */}
          <Card className="bg-emerald-50/50 border-emerald-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-emerald-800">Proctored Exams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Avg Score:</span>
                  <span className="font-bold text-emerald-700">
                    {proctorSessions.filter(s => s.status === "completed").length > 0 
                      ? (proctorSessions.filter(s => s.status === "completed").reduce((sum, s) => sum + (s.score / 10), 0) / proctorSessions.filter(s => s.status === "completed").length).toFixed(1) 
                      : "0.0"} / 10
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Exams Completed:</span>
                  <span className="font-bold text-slate-700">{proctorSessions.filter(s => s.status === "completed").length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Questions */}
          <Card className="bg-orange-50/50 border-orange-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Company Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Avg Score:</span>
                  <span className="font-bold text-orange-700">
                    {companyAttempts.length > 0 
                      ? (companyAttempts.reduce((sum, a) => sum + a.rating, 0) / companyAttempts.length).toFixed(1) 
                      : "0.0"} / 10
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Total Attempts:</span>
                  <span className="font-bold text-slate-700">{companyAttempts.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Activity Session History */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Activity Session History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-100 overflow-hidden">
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Details</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sessionHistory.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-slate-400 italic">
                        No individual session activity recorded yet.
                      </td>
                    </tr>
                  ) : (
                    sessionHistory.map((session) => (
                      <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[10px] border-transparent",
                              session.type === "Mock Interview" ? "bg-indigo-50 text-indigo-700" :
                              session.type === "Proctored Exam" ? "bg-emerald-50 text-emerald-700" :
                              "bg-orange-50 text-orange-700"
                            )}>
                            {session.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-slate-600 max-w-[250px] truncate">
                          {session.detail}
                        </td>
                        <td className="px-4 py-4">
                          <span className={cn(
                            "font-bold",
                            session.score >= 8 ? "text-emerald-600" : session.score >= 5 ? "text-amber-600" : "text-red-500"
                          )}>
                            {session.score.toFixed(1)}/10
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right text-slate-400 text-xs">
                          {new Date(session.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
