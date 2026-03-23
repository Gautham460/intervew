/* eslint-disable @typescript-eslint/no-unused-vars */
import { useAuth } from "@clerk/clerk-react";
import {
  CircleStop,
  Loader,
  Mic,
  Save,
  Video,
  VideoOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import useSpeechToText from "react-hook-speech-to-text";
import { useParams } from "react-router-dom";
import WebCam from "react-webcam";
import { TooltipButton } from "./tooltip-button";
import { toast } from "sonner";
import { chatSession } from "@/scripts";
import { SaveModal } from "./save-modal";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface SkillQuestion {
  skill: string;
  question: string;
  expectedAnswer: string;
}

interface RecordSkillAnswerProps {
  questions: SkillQuestion[];
  isWebCam: boolean;
  setIsWebCam: (value: boolean) => void;
}

interface AIResponse {
  ratings: number;
  feedback: string;
}

export const RecordSkillAnswer = ({
  questions,
  isWebCam,
  setIsWebCam,
}: RecordSkillAnswerProps) => {
  const {
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>(
    new Array(questions.length).fill("")
  );
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiResults, setAiResults] = useState<AIResponse[]>(
    new Array(questions.length).fill(null)
  );
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completedAnswers, setCompletedAnswers] = useState<boolean[]>(
    new Array(questions.length).fill(false)
  );

  const { userId } = useAuth();
  const { interviewId } = useParams();
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    // Update user answer with speech-to-text results
    if (results.length > 0) {
      const transcript = results
        .map((result) => {
          if (typeof result === "string") {
            return result;
          }
          return result.transcript || "";
        })
        .join(" ");
      const updatedAnswers = [...userAnswers];
      updatedAnswers[currentQuestionIndex] = transcript;
      setUserAnswers(updatedAnswers);
    }
  }, [results]);

  const recordUserAnswer = async () => {
    if (isRecording) {
      stopSpeechToText();

      const answer = userAnswers[currentQuestionIndex];
      if (answer?.length < 20) {
        toast.error("Error", {
          description: "Your answer should be more than 20 characters",
        });
        return;
      }

      // Generate AI feedback
      const aiResult = await generateResult(
        currentQuestion.question,
        currentQuestion.expectedAnswer,
        answer
      );

      const updatedResults = [...aiResults];
      updatedResults[currentQuestionIndex] = aiResult;
      setAiResults(updatedResults);

      const updatedCompleted = [...completedAnswers];
      updatedCompleted[currentQuestionIndex] = true;
      setCompletedAnswers(updatedCompleted);
    } else {
      startSpeechToText();
    }
  };

  const generateResult = async (
    question: string,
    correctAnswer: string,
    userAnswer: string
  ): Promise<AIResponse> => {
    setIsAiGenerating(true);
    const prompt = `
    Evaluate the following technical interview answer:
    
    Question: ${question}
    Expected Answer: ${correctAnswer}
    User's Answer: ${userAnswer}
    
    Provide:
    1. A rating from 1-10
    2. Brief feedback (2-3 sentences) on the answer quality
    
    Return as JSON: { "ratings": <number>, "feedback": "<string>" }
    `;

    try {
      const response = await chatSession.sendMessage(prompt);
      const cleanedResponse = cleanJsonResponse(response.response.text());
      setIsAiGenerating(false);
      return cleanedResponse;
    } catch (error) {
      setIsAiGenerating(false);
      toast.error("Error", { description: "Failed to generate feedback" });
      return { ratings: 0, feedback: "Unable to generate feedback" };
    }
  };

  const cleanJsonResponse = (responseText: string) => {
    let cleanText = responseText.trim();
    cleanText = cleanText.replace(/(json|```|`)/g, "");

    try {
      const jsonMatch = cleanText.match(/\{.*\}/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { ratings: 0, feedback: "Unable to parse response" };
    } catch (error) {
      console.error("Error parsing AI response:", error);
      return { ratings: 0, feedback: "Error parsing response" };
    }
  };

  const saveAnswers = async () => {
    if (!userId || !interviewId) return;

    setLoading(true);
    try {
      for (let i = 0; i < questions.length; i++) {
        if (userAnswers[i] && aiResults[i]) {
          await addDoc(collection(db, "userAnswers"), {
            mockIdRef: interviewId,
            question: questions[i].question,
            correct_ans: questions[i].expectedAnswer,
            user_ans: userAnswers[i],
            feedback: aiResults[i].feedback,
            rating: aiResults[i].ratings,
            userId,
            createdAt: serverTimestamp(),
          });
        }
      }
      toast.success("Success", { description: "Answers saved successfully!" });
    } catch (error) {
      toast.error("Error", { description: "Failed to save answers" });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (!currentQuestion) {
    return <div>No questions available</div>;
  }

  const currentResult = aiResults[currentQuestionIndex];

  return (
    <div className="w-full space-y-6">
      {/* Webcam */}
      {isWebCam && (
        <div className="relative rounded-lg overflow-hidden bg-black h-96">
          <WebCam mirrored={true} />
          <div className="absolute top-4 right-4">
            <TooltipButton
              icon={isWebCam ? <Video size={20} /> : <VideoOff size={20} />}
              onClick={() => setIsWebCam(!isWebCam)}
              content={isWebCam ? "Turn off webcam" : "Turn on webcam"}
            />
          </div>
        </div>
      )}

      {/* Question Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                Question {currentQuestionIndex + 1} of {questions.length}
              </CardTitle>
              <CardDescription className="mt-2">
                Skill: <Badge>{currentQuestion.skill}</Badge>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Question Display */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <p className="text-lg font-medium text-gray-800">
            {currentQuestion.question}
          </p>
        </CardContent>
      </Card>

      {/* Expected Answer Reference */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Expected Answer</AlertTitle>
        <AlertDescription>{currentQuestion.expectedAnswer}</AlertDescription>
      </Alert>

      {/* Speech-to-Text Display */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Answer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="min-h-24 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-800">
              {userAnswers[currentQuestionIndex] || "Start speaking..."}
            </p>
            {interimResult && (
              <p className="text-sm text-gray-500 italic mt-2">{interimResult}</p>
            )}
          </div>

          {/* Record Button */}
          <button
            onClick={recordUserAnswer}
            disabled={isAiGenerating}
            className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              isRecording
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isAiGenerating ? (
              <>
                <Loader className="animate-spin" size={20} />
                Generating Feedback...
              </>
            ) : isRecording ? (
              <>
                <CircleStop size={20} />
                Stop Recording
              </>
            ) : (
              <>
                <Mic size={20} />
                Start Recording
              </>
            )}
          </button>
        </CardContent>
      </Card>

      {/* AI Feedback */}
      {currentResult && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-green-600" />
              <CardTitle className="text-base">Feedback</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Rating</p>
              <p className="text-2xl font-bold text-green-600">
                {currentResult.ratings}/10
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Feedback</p>
              <p className="text-sm text-gray-700 mt-1">{currentResult.feedback}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-4 justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        <div className="flex gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                index === currentQuestionIndex
                  ? "bg-blue-600 text-white"
                  : completedAnswers[index]
                  ? "bg-green-600 text-white"
                  : "bg-gray-300 text-gray-700"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentQuestionIndex === questions.length - 1}
          className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>

      {/* Save Button */}
      {completedAnswers.every((completed) => completed) && (
        <button
          onClick={() => setOpen(true)}
          disabled={loading}
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={20} />
          {loading ? "Saving..." : "Save All Answers"}
        </button>
      )}

      {/* Save Modal */}
      <SaveModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={saveAnswers}
        loading={loading}
      />
    </div>
  );
};
