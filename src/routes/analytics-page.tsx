import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useSearchParams } from "react-router-dom";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { UserAnswer } from "@/types";
import { LoaderPage } from "./loader-page";
import { CustomBreadCrumb } from "@/components/custom-bread-crumb";
import { Headings } from "@/components/headings";
import { Separator } from "@/components/ui/separator";
import {
  calculatePerformanceMetrics,
  calculateSkillPerformance,
  getStrongAndWeakSkills,
} from "@/lib/analytics";
import { PerformanceCard } from "@/components/performance-card";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Target, Zap, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const AnalyticsPage = () => {
  const { userId: currentUserId } = useAuth();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get("u") || currentUserId;
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState<UserAnswer[]>([]);
  const [proctorSessions, setProctorSessions] = useState<any[]>([]);
  const [companyAttempts, setCompanyAttempts] = useState<any[]>([]);

  useEffect(() => {
    if (!targetUserId) return;

    let unsubscribeFeedbacks: () => void;
    let unsubscribeProctor: () => void;
    let unsubscribeCompany: () => void;

    let feedbackList: UserAnswer[] = [];
    let proctorList: any[] = [];
    let companyList: any[] = [];

    const updateMetrics = () => {
      setFeedbacks(feedbackList);
      setProctorSessions(proctorList);
      setCompanyAttempts(companyList);
      setLoading(false);
    };

    unsubscribeFeedbacks = onSnapshot(
      query(collection(db, "userAnswers"), where("userId", "==", targetUserId)),
      (snap: any) => {
        feedbackList = snap.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        })) as UserAnswer[];
        updateMetrics();
      }
    );

    unsubscribeProctor = onSnapshot(
      query(collection(db, "proctor_sessions"), where("userId", "==", targetUserId)),
      (snap: any) => {
        proctorList = snap.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));
        updateMetrics();
      }
    );

    unsubscribeCompany = onSnapshot(
      query(collection(db, "companyQuestionAttempts"), where("userId", "==", targetUserId)),
      (snap: any) => {
        companyList = snap.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));
        updateMetrics();
      }
    );

    return () => {
      if (unsubscribeFeedbacks) unsubscribeFeedbacks();
      if (unsubscribeProctor) unsubscribeProctor();
      if (unsubscribeCompany) unsubscribeCompany();
    };
  }, [targetUserId]);

  const metrics = useMemo(
    () => calculatePerformanceMetrics(feedbacks, proctorSessions, companyAttempts),
    [feedbacks, proctorSessions, companyAttempts]
  );

  const skillPerformances = useMemo(
    () => calculateSkillPerformance(feedbacks, proctorSessions, companyAttempts),
    [feedbacks, proctorSessions, companyAttempts]
  );

  const { strongSkills, weakSkills } = useMemo(
    () => getStrongAndWeakSkills(skillPerformances),
    [skillPerformances]
  );

  if (loading) {
    return <LoaderPage className="w-full h-[70vh]" />;
  }

  return (
    <div className="flex flex-col w-full gap-8 py-5">
      {/* Header */}
      <div className="flex items-center justify-between w-full gap-2">
        <CustomBreadCrumb
          breadCrumbPage="Analytics"
          breadCrumpItems={[{ label: "Mock Interviews", link: "/generate" }]}
        />
      </div>

      <div className="space-y-2">
        <Headings
          title="Your Performance Analytics"
          description="Track your progress and identify improvement areas"
        />
      </div>

      <Separator />

      {/* Main Analytics Dashboard */}
      <AnalyticsDashboard userId={targetUserId || undefined} />

      <Separator />

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Metrics Card */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Overall Rating</p>
                <p className="text-3xl font-bold text-blue-600">
                  {metrics.averageRating.toFixed(1)}/10
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Questions</p>
                <p className="text-3xl font-bold text-purple-600">
                  {metrics.totalQuestions}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trend</p>
                <div className="flex items-center gap-2">
                  {metrics.improvementTrend === "improving" && (
                    <>
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                      <span className="font-semibold text-emerald-600">Improving</span>
                    </>
                  )}
                  {metrics.improvementTrend === "declining" && (
                    <>
                      <TrendingDown className="w-5 h-5 text-red-500" />
                      <span className="font-semibold text-red-600">Declining</span>
                    </>
                  )}
                  {metrics.improvementTrend === "stable" && (
                    <>
                      <Zap className="w-5 h-5 text-gray-500" />
                      <span className="font-semibold text-gray-600">Stable</span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time to Improve</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {metrics.timeToImprove}d
                </p>
              </div>
            </div>

            {/* Performance Distribution */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t">
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <p className="text-2xl font-bold text-emerald-600">
                  {metrics.questionsPerformance.excellent}
                </p>
                <p className="text-xs text-muted-foreground">Excellent (8-10)</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {metrics.questionsPerformance.good}
                </p>
                <p className="text-xs text-muted-foreground">Good (6-7.9)</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {metrics.questionsPerformance.average}
                </p>
                <p className="text-xs text-muted-foreground">Fair (4-5.9)</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {metrics.questionsPerformance.poor}
                </p>
                <p className="text-xs text-muted-foreground">Poor (&lt;4)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Recommendations */}
      <div className="space-y-3">
        {weakSkills.length > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-900">Focus Areas</AlertTitle>
            <AlertDescription className="text-yellow-800">
              Consider practicing: <strong>{weakSkills.join(", ")}</strong>
            </AlertDescription>
          </Alert>
        )}

        {metrics.improvementTrend === "declining" && (
          <Alert className="border-red-200 bg-red-50">
            <TrendingDown className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-900">Performance Declining</AlertTitle>
            <AlertDescription className="text-red-800">
              Your recent scores are lower. Review previous feedback and practice more.
            </AlertDescription>
          </Alert>
        )}

        {metrics.improvementTrend === "improving" && (
          <Alert className="border-emerald-200 bg-emerald-50">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <AlertTitle className="text-emerald-900">Great Progress!</AlertTitle>
            <AlertDescription className="text-emerald-800">
              Your performance is improving. Keep up the good work!
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Skills Performance */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Skill Performance
          </h3>
          <p className="text-sm text-muted-foreground">
            Detailed breakdown of your performance by skill
          </p>
        </div>

        {skillPerformances.length === 0 ? (
          <p className="text-muted-foreground">
            No skill data available. Complete more interviews to see analytics.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillPerformances.map((skill) => (
              <PerformanceCard key={skill.skill} skill={skill} variant="detailed" />
            ))}
          </div>
        )}
      </div>

      {/* Strongest and Weakest Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strongSkills.length > 0 && (
          <Card className="border-emerald-200 bg-emerald-50">
            <CardHeader>
              <CardTitle className="text-emerald-900">Strongest Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {strongSkills.map((skill) => {
                const skillData = skillPerformances.find((s) => s.skill === skill);
                return (
                  <div key={skill} className="flex items-center justify-between">
                    <span className="font-medium">{skill}</span>
                    <Badge className="bg-emerald-600">
                      {skillData?.averageRating.toFixed(1)}/10
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {weakSkills.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">Areas to Improve</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {weakSkills.map((skill) => {
                const skillData = skillPerformances.find((s) => s.skill === skill);
                return (
                  <div key={skill} className="flex items-center justify-between">
                    <span className="font-medium">{skill}</span>
                    <Badge variant="destructive">
                      {skillData?.averageRating.toFixed(1)}/10
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
