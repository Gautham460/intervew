import { HashRouter as Router, Routes, Route } from "react-router-dom";

import { PublicLayout } from "@/layouts/public-layout";
import AuthenticationLayout from "@/layouts/auth-layout";
import ProtectRoutes from "@/layouts/protected-routes";
import AdminRoute from "@/layouts/admin-route";
import { MainLayout } from "@/layouts/main-layout";

import HomePage from "@/routes/home";
import { SignInPage } from "./routes/sign-in";
import { SignUpPage } from "./routes/sign-up";
import { Generate } from "./components/generate";
import { Dashboard } from "./routes/dashboard";
import { CreateEditPage } from "./routes/create-edit-page";
import { MockLoadPage } from "./routes/mock-load-page";
import { MockInterviewPage } from "./routes/mock-interview-page";
import { Feedback } from "./routes/feedback";
import { EnterpriseDashboard } from "./routes/enterprise-dashboard";
import CollaborationPage from "./routes/collaboration-page";
import ResumeBuilderPage from "./routes/resume-builder-page";
import { SetupPage } from "./routes/setup-page";
import { AnalyticsPage } from "./routes/analytics-page";
import CompanyQuestionsPage from "@/routes/company-questions-page";
import GroupPracticePage from "@/routes/group-practice-page";
import VideoRecordingPage from "@/routes/video-recording-page";
import ProctorModeDemo from "@/routes/proctored-mode-page";
import AiCoachPage from "@/routes/ai-coach-page";
import InterviewSchedulingPage from "@/routes/interview-scheduling-page";
import ResumeAnalysisPage from "@/routes/resume-analysis-page";
import StudyPlansPage from "@/routes/study-plans-page";
import SocialFeaturesPage from "@/routes/social-features-page";
import SelectRolePage from "./routes/select-role";
import { useEffect } from "react";
import { initializeAdminCode } from "./lib/admin-init";

const App = () => {
  useEffect(() => {
    initializeAdminCode();
  }, []);

  return (
    <Router>
      <Routes>
        {/* public routes */}
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
        </Route>

        {/* authentication layout */}
        <Route element={<AuthenticationLayout />}>
          <Route path="/signin/*" element={<SignInPage />} />
          <Route path="/signup/*" element={<SignUpPage />} />
          <Route path="/select-role" element={<SelectRolePage />} />
        </Route>

        {/* protected routes */}
        <Route
          element={
            <ProtectRoutes>
              <MainLayout />
            </ProtectRoutes>
          }
        >
          {/* add all the protect routes */}
          <Route element={<Generate />} path="/generate">
            <Route index element={<Dashboard />} />
            <Route path=":interviewId" element={<CreateEditPage />} />
            <Route path="interview/:interviewId" element={<MockLoadPage />} />
            <Route
              path="interview/:interviewId/start"
              element={<MockInterviewPage />}
            />
            <Route path="feedback/:interviewId" element={<Feedback />} />
          </Route>
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route 
            path="/setup" 
            element={
              <AdminRoute>
                <SetupPage />
              </AdminRoute>
            } 
          />
          <Route 
            path="/enterprise" 
            element={
              <AdminRoute>
                <EnterpriseDashboard />
              </AdminRoute>
            } 
          />
          <Route path="/collab" element={<CollaborationPage />} />
          <Route path="/collab/:roomId" element={<CollaborationPage />} />
          {/* Tier 3 Features */}
          <Route path="/company-questions" element={<CompanyQuestionsPage />} />
          <Route path="/group-practice" element={<GroupPracticePage />} />
          <Route path="/video-recording" element={<VideoRecordingPage />} />
          <Route path="/proctored-mode" element={<ProctorModeDemo />} />
          {/* Tier 4 Features */}
          <Route path="/ai-coach" element={<AiCoachPage />} />
          <Route path="/interview-scheduling" element={<InterviewSchedulingPage />} />
          <Route path="/resume-analysis" element={<ResumeAnalysisPage />} />
          <Route path="/resume-builder" element={<ResumeBuilderPage />} />
          <Route path="/study-plans" element={<StudyPlansPage />} />
          <Route path="/community" element={<SocialFeaturesPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
