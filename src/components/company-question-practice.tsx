import { useAuth } from "@clerk/clerk-react";
import {
  CircleStop,
  Loader,
  Mic,
  RefreshCw,
  Send,
} from "lucide-react";
import { useEffect, useState } from "react";
import useSpeechToText from "react-hook-speech-to-text";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { toast } from "sonner";
import { chatSession } from "@/scripts";
import type { CompanyQuestion } from "@/lib/company-questions";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";

interface CompanyQuestionPracticeProps {
  question: CompanyQuestion;
  onClose: () => void;
}

interface AIResponse {
  ratings: number;
  feedback: string;
}

export const CompanyQuestionPractice = ({
  question,
  onClose,
}: CompanyQuestionPracticeProps) => {
  const { userId } = useAuth();
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

  const [userAnswer, setUserAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    let transcriptText = results
      .map((result: any) => result.transcript)
      .join(" ");

    if (interimResult) {
      transcriptText += interimResult;
    }

    setUserAnswer(transcriptText);
  }, [results, interimResult]);

  const generateFeedback = async () => {
    if (!userAnswer.trim()) {
      toast.error("Please record an answer first");
      return;
    }

    setIsGeneratingFeedback(true);
    try {
      const prompt = `
You are an expert interview coach evaluating a candidate's response to this company interview question.

Company: ${question.company}
Role: ${question.role}
Category: ${question.category}
Question: "${question.question}"

Candidate's Answer: "${userAnswer}"

Evaluate the candidate's answer based on:
1. Relevance and clarity
2. Structure and organization
3. Technical depth (if applicable)
4. Communication style
5. Completeness

Provide feedback in this EXACT JSON format:
{
  "ratings": <number between 1-10>,
  "feedback": "<detailed feedback explaining strengths and areas for improvement>"
}

Be constructive and specific. Reference the tips provided: ${question.tips.join(", ")}

Return ONLY valid JSON, no other text.`;

      const result = await chatSession.sendMessage(prompt);
      const responseText = result.response.text();

      // Clean and parse JSON response
      let parsedResponse: AIResponse;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found");
        }
      } catch {
        parsedResponse = {
          ratings: 5,
          feedback:
            "Unable to generate feedback. Please try again or review your answer manually against the tips provided.",
        };
      }

      setRating(parsedResponse.ratings);
      setFeedback(parsedResponse.feedback);
      setShowFeedback(true);

      // Save to Firestore
      if (userId) {
        await addDoc(collection(db, "companyQuestionAttempts"), {
          userId,
          questionId: question.id,
          company: question.company,
          category: question.category,
          question: question.question,
          userAnswer,
          feedback: parsedResponse.feedback,
          rating: parsedResponse.ratings,
          createdAt: serverTimestamp(),
        });
      }

      toast.success("Feedback generated successfully!");
    } catch (error) {
      console.error("Error generating feedback:", error);
      toast.error("Failed to generate feedback");
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const handleStartRecording = () => {
    setUserAnswer("");
    setFeedback("");
    setShowFeedback(false);
    startSpeechToText();
  };

  const handleStopRecording = () => {
    stopSpeechToText();
  };

  return (
    <div className="space-y-4">
      {/* Question Display */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-sm text-gray-600">Company</h3>
              <p className="text-lg font-bold text-blue-600">{question.company}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-600">Role</h3>
              <p className="text-base">{question.role}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-600">Question</h3>
              <p className="text-base font-semibold">{question.question}</p>
            </div>
            {question.tips && question.tips.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-2">Tips</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {question.tips.map((tip, idx) => (
                    <li key={idx} className="text-gray-700">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recording Section */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Record Your Answer</h3>
            <p className="text-sm text-gray-600 mb-3">
              Click the microphone button and speak your answer clearly
            </p>

            <div className="flex gap-2 mb-4">
              <Button
                onClick={handleStartRecording}
                disabled={isRecording}
                variant={isRecording ? "destructive" : "default"}
                className="flex-1 gap-2"
              >
                <Mic size={18} />
                {isRecording ? "Recording..." : "Start Recording"}
              </Button>
              <Button
                onClick={handleStopRecording}
                disabled={!isRecording}
                variant="outline"
                className="flex-1 gap-2"
              >
                <CircleStop size={18} />
                Stop
              </Button>
              <Button
                onClick={() => {
                  setUserAnswer("");
                  setShowFeedback(false);
                }}
                variant="outline"
                size="icon"
              >
                <RefreshCw size={18} />
              </Button>
            </div>

            {/* Transcribed Answer */}
            <div>
              <label className="text-sm font-semibold block mb-2">
                Your Answer
              </label>
              <Textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Your transcribed answer will appear here..."
                className="min-h-[120px] resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                {userAnswer.length} characters
              </p>
            </div>
          </div>

          {/* Generate Feedback Button */}
          <Button
            onClick={generateFeedback}
            disabled={isGeneratingFeedback || !userAnswer.trim()}
            className="w-full gap-2"
          >
            {isGeneratingFeedback ? (
              <>
                <Loader size={18} className="animate-spin" />
                Generating Feedback...
              </>
            ) : (
              <>
                <Send size={18} />
                Get AI Feedback
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Feedback Section */}
      {showFeedback && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">AI Feedback</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{rating}</div>
                <p className="text-xs text-gray-600">out of 10</p>
              </div>
            </div>

            <Alert>
              <AlertDescription className="text-sm leading-relaxed">
                {feedback}
              </AlertDescription>
            </Alert>

            {question.exampleAnswer && (
              <div className="bg-white p-3 rounded border border-green-200">
                <h4 className="font-semibold text-sm mb-2">Example Answer</h4>
                <p className="text-sm text-gray-700">{question.exampleAnswer}</p>
              </div>
            )}

            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
