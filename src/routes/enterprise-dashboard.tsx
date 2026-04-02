import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { db } from "@/config/firebase.config";
import { collection, onSnapshot } from "firebase/firestore";
import { UserAnswer } from "@/types";
import { Headings } from "@/components/headings";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Target, Award, Settings, ExternalLink, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const EnterpriseDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState<UserAnswer[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [dbStatus, setDbStatus] = useState({ questions: 0, companies: 0 });

  useEffect(() => {
    let unsubscribeUsers: () => void;
    let unsubscribeInterviews: () => void;
    let unsubscribeFeedbacks: () => void;
    let unsubscribeProctor: () => void;
    let unsubscribeCompany: () => void;
    let unsubscribeQuestions: () => void;

    const setupLiveSync = () => {
      let userList: any[] = [];
      let interviewList: any[] = [];
      let feedbackList: any[] = [];
      let proctorList: any[] = [];
      let companyList: any[] = [];
      let questionsList: any[] = [];

      const updateDashboard = () => {
        let totalQuestions = 0;
        questionsList.forEach(data => {
          totalQuestions += (data.questions?.length || 0);
        });
        setDbStatus({ 
          questions: totalQuestions, 
          companies: new Set(companyList.map((c: any) => c.company)).size 
        });

        const allFeedbacks = [
          ...feedbackList,
          ...proctorList.filter(s => s.status === "completed").map(s => ({ ...s, rating: s.score / 10 })),
          ...companyList.map(c => ({ ...c, rating: c.rating }))
        ];
        setFeedbacks(allFeedbacks as any);

        const studentMap = new Map<string, any>();
        
        // Pre-fill with all registered real users (this ensures Huzzain and others show up even with 0 activities)
        // This also acts as our filter against legacy mock data.
        userList.forEach(u => {
          studentMap.set(u.id, {
            id: u.id,
            email: u.email || `${u.id.slice(0, 8)}...`,
            name: u.name || "Anonymous User",
            sessions: 0,
            functions: new Set<string>(),
            lastActive: u.updateAt || u.createdAt || new Date()
          });
        });
        
        const processUser = (userId: string, activity: any, functionName: string) => {
          if (!userId) return;
          // If the userId from the activity doesn't exist in our actual userList, it's mock/legacy data. Ignore it.
          if (!studentMap.has(userId)) return;
          
          const activityDate = activity.endTime || activity.createdAt;
          
          const entry = studentMap.get(userId);
          entry.sessions++;
          entry.functions.add(functionName);
          
          const currentLast = entry.lastActive?.toDate?.() || new Date(entry.lastActive || 0);
          const activeDate = activityDate?.toDate?.() || new Date(activityDate || 0);
          
          if (activeDate > currentLast) {
            entry.lastActive = activityDate;
          }
        };

        interviewList.forEach(i => processUser(i.userId, i, "Mock Interview"));
        proctorList.forEach(s => processUser(s.userId, s, "Proctored Interview"));
        companyList.forEach(c => processUser(c.userId, c, "Company Question"));

        const studentList = Array.from(studentMap.values()).sort((a, b) => {
          const dateA = a.lastActive?.toDate?.() || new Date(a.lastActive || 0);
          const dateB = b.lastActive?.toDate?.() || new Date(b.lastActive || 0);
          return dateB.getTime() - dateA.getTime();
        });

        // Convert Set to Array for rendering
        setStudents(studentList.map(s => ({...s, functions: Array.from(s.functions)})));
        setLoading(false);
      };

      unsubscribeUsers = onSnapshot(collection(db, "users"), (snap: any) => {
        userList = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        updateDashboard();
      });

      unsubscribeInterviews = onSnapshot(collection(db, "interviews"), (snap: any) => {
        interviewList = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        updateDashboard();
      });

      unsubscribeFeedbacks = onSnapshot(collection(db, "userAnswers"), (snap: any) => {
        feedbackList = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        updateDashboard();
      });

      unsubscribeProctor = onSnapshot(collection(db, "proctor_sessions"), (snap: any) => {
        proctorList = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        updateDashboard();
      });

      unsubscribeCompany = onSnapshot(collection(db, "companyQuestionAttempts"), (snap: any) => {
        companyList = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        updateDashboard();
      });

      unsubscribeQuestions = onSnapshot(collection(db, "skillQuestions"), (snap: any) => {
        questionsList = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        updateDashboard();
      });
    };

    setupLiveSync();

    return () => {
      // @ts-ignore
      if (typeof unsubscribeUsers === "function") unsubscribeUsers();
      if (unsubscribeInterviews) unsubscribeInterviews();
      if (unsubscribeFeedbacks) unsubscribeFeedbacks();
      if (unsubscribeProctor) unsubscribeProctor();
      if (unsubscribeCompany) unsubscribeCompany();
      if (unsubscribeQuestions) unsubscribeQuestions();
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const avgOrgScore = feedbacks.length > 0 
    ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
    : "0.0";

  return (
    <div className="w-full space-y-8 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Headings 
          title="Enterprise Admin Portal" 
          description="Real-time organizational performance synced with student portal data." 
        />
        <div className="flex gap-3">
          <Link to="/setup">
            <Button variant="outline" className="flex items-center gap-2 border-slate-200">
              <Settings className="w-4 h-4" />
              Configure System
            </Button>
          </Link>
        </div>
      </div>
      
      <Separator />

      {/* Main Functions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Function 1: Analytics Dashboard */}
        <Card className="flex flex-col h-full bg-slate-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600 rounded-lg shadow-blue-200 shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Student Talent Analytics</CardTitle>
                <CardDescription>Synced organizational performance metrics</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-xl border border-blue-100 shadow-sm flex flex-col items-center text-center">
                <div className="text-sm text-slate-500 mb-1">Total Active Students</div>
                <div className="text-3xl font-black text-blue-600 font-mono">{students.length}</div>
              </div>
              <div className="p-4 bg-white rounded-xl border border-blue-100 shadow-sm flex flex-col items-center text-center">
                <div className="text-sm text-slate-500 mb-1">Average Organization Score</div>
                <div className="text-3xl font-black text-emerald-600 font-mono">{avgOrgScore}</div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" />
                Active Student List
              </h4>
              <div className="border rounded-lg overflow-hidden bg-white">
                <div className="max-h-[400px] overflow-y-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b font-medium sticky top-0">
                      <tr>
                        <th className="px-4 py-3">Student ID</th>
                        <th className="px-4 py-3">Recorded Sessions</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {students.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-slate-400 italic">
                             No student activity recorded yet. Syncing with portal...
                          </td>
                        </tr>
                      ) : (
                        students.map((student) => {
                          const userScores = feedbacks.filter((f: any) => f.userId === student.id);
                          const avgRating = userScores.length > 0 
                            ? (userScores.reduce((s, f) => s + (f.rating || 0), 0) / userScores.length).toFixed(1)
                            : "N/A";
                          
                          return (
                            <tr key={student.id} className="hover:bg-blue-50/50 transition-colors border-b last:border-0">
                              <td className="px-4 py-6">
                                <div className="font-semibold text-slate-900 mb-1">
                                  {student.name}
                                </div>
                                <div className="text-xs text-slate-500 mb-1">
                                  {student.email}
                                </div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                                  <Activity className="w-3 h-3" /> Latest: {(student.lastActive as any)?.toDate ? (student.lastActive as any).toDate().toLocaleDateString() : "Recent"} 
                                </div>
                              </td>
                              <td className="px-4 py-6">
                                <div className="flex items-center gap-4">
                                  <div className="flex flex-col gap-2">
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 w-fit">
                                      {student.sessions} Activities Total
                                    </Badge>
                                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                                      {(student.functions || []).map((func: string) => (
                                        <Badge key={func} variant="secondary" className="text-[10px] px-1.5 py-0 border-slate-200">
                                          {func}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex flex-col border-l pl-4 border-slate-200">
                                    <span className="text-[10px] text-slate-400 uppercase">Avg Result</span>
                                    <span className={cn(
                                      "text-sm font-bold",
                                      Number(avgRating) >= 7 ? "text-emerald-600" : Number(avgRating) >= 4 ? "text-amber-600" : "text-slate-600"
                                    )}>
                                      {avgRating}/10
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-6 text-right">
                                <Link to={`/analytics?u=${student.id}`}>
                                  <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-600 hover:text-white transition-all">
                                    Analysis <ExternalLink className="ml-2 w-3 h-3" />
                                  </Button>
                                </Link>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Function 2: Enterprise Setup */}
        <Card className="flex flex-col h-full bg-slate-50 border-purple-200">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-600 rounded-lg shadow-purple-200 shadow-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">System Configuration</CardTitle>
                <CardDescription>Operational parameters & asset management</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-xl border border-purple-100 shadow-sm flex items-start gap-4">
                <div className="p-3 bg-purple-50 rounded-xl">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900">Database Status</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-2 py-0">
                      {dbStatus.questions} Questions
                    </Badge>
                    <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 px-2 py-0">
                       Live
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-purple-100 shadow-sm flex items-start gap-4">
                <div className="p-3 bg-amber-50 rounded-xl">
                   <Award className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900">Enterprise Content</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-slate-500">
                      {dbStatus.companies} Company Hubs
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6">
              <Link to="/setup" className="block w-full">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 py-6 text-lg shadow-lg shadow-purple-200">
                  Enter Setup Console
                </Button>
              </Link>
              <p className="text-center text-xs text-slate-400 mt-4 italic">
                * All changes here are reflected immediately in the student portal
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
