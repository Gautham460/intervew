/* eslint-disable @typescript-eslint/no-unused-vars */
import { Interview } from "@/types";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LoaderPage } from "./loader-page";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { CustomBreadCrumb } from "@/components/custom-bread-crumb";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb } from "lucide-react";
import { QuestionSection } from "@/components/question-section";
import { RecordSkillAnswer } from "@/components/record-skill-answer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const MockInterviewPage = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isWebCam, setIsWebCam] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    const fetchInterview = async () => {
      if (interviewId) {
        try {
          const interviewDoc = await getDoc(doc(db, "interviews", interviewId));
          if (interviewDoc.exists()) {
            setInterview({
              id: interviewDoc.id,
              ...interviewDoc.data(),
            } as Interview);
          }
        } catch (error) {
          console.log(error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchInterview();
  }, [interviewId, navigate]);

  if (isLoading) {
    return <LoaderPage className="w-full h-[70vh]" />;
  }

  if (!interviewId) {
    navigate("/generate", { replace: true });
  }

  if (!interview) {
    navigate("/generate", { replace: true });
  }

  const hasSkillQuestions = interview?.skillQuestions && interview.skillQuestions.length > 0;

  return (
    <div className="flex flex-col w-full gap-8 py-5">
      <CustomBreadCrumb
        breadCrumbPage="Start"
        breadCrumpItems={[
          { label: "Mock Interviews", link: "/generate" },
          {
            label: interview?.position || "",
            link: `/generate/interview/${interview?.id}`,
          },
        ]}
      />

      <div className="w-full">
        <Alert className="bg-sky-100 border border-sky-200 p-4 rounded-lg flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-sky-600" />
          <div>
            <AlertTitle className="text-sky-800 font-semibold">
              Important Note
            </AlertTitle>
            <AlertDescription className="text-sm text-sky-700 mt-1 leading-relaxed">
              Press "Record Answer" to begin answering the question. Once you
              finish the interview, you&apos;ll receive feedback comparing your
              responses with the ideal answers.
              <br />
              <br />
              <strong>Note:</strong>{" "}
              <span className="font-medium">Your video is never recorded.</span>{" "}
              You can disable the webcam anytime if preferred.
            </AlertDescription>
          </div>
        </Alert>
      </div>

      {/* Tabs for different question types */}
      {hasSkillQuestions && interview?.questions && interview.questions.length > 0 ? (
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="general">General Questions</TabsTrigger>
            <TabsTrigger value="skills">Skill-Based Questions</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            {interview?.questions && interview?.questions.length > 0 && (
              <div className="mt-4 w-full flex flex-col items-start gap-4">
                <QuestionSection questions={interview?.questions} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="skills" className="mt-6">
            {interview?.skillQuestions && interview?.skillQuestions.length > 0 && (
              <RecordSkillAnswer
                questions={interview.skillQuestions.map((q) => ({
                  skill: q.skill,
                  question: q.question,
                  expectedAnswer: q.expectedAnswer,
                }))}
                isWebCam={isWebCam}
                setIsWebCam={setIsWebCam}
              />
            )}
          </TabsContent>
        </Tabs>
      ) : interview?.questions && interview?.questions.length > 0 ? (
        <div className="mt-4 w-full flex flex-col items-start gap-4">
          <QuestionSection questions={interview?.questions} />
        </div>
      ) : null}
    </div>
  );
};
