import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { AlertTriangle } from "lucide-react";
import {
  startProctorSession,
  recordAnswer,
  flagViolation,
  completeProctorSession,
  type ProctorAnswer,
} from "@/lib/proctored-mode";

export default function ProctorModeDemo() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [userAnswer, setUserAnswer] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [violations, setViolations] = useState<string[]>([]);
  const { userId } = useAuth();
  const navigate = useNavigate();

  const sampleQuestions = [
    "Describe a system design for a URL shortener like bit.ly",
    "What is the difference between SQL and NoSQL databases?",
    "Explain the concept of microservices architecture",
    "How would you approach debugging a production issue?",
    "What is your experience with cloud platforms?",
  ];

  useEffect(() => {
    if (timeLeft > 0 && isStarted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isStarted]);

  const handleStartSession = async () => {
    try {
      if (!userId) {
        toast.error("Please sign in to start a proctored session.");
        return;
      }
      const difficulty = "medium" as const;
      const id = await startProctorSession(userId, difficulty);
      setSessionId(id);
      setIsStarted(true);
      // In real implementation, start monitoring
      // await monitorEnvironment(id);
    } catch (error) {
      console.error("Error starting session:", error);
    }
  };

  const handleRecordAnswer = async () => {
    if (!sessionId || !userAnswer) return;

    try {
      const answer: ProctorAnswer = {
        questionIndex: currentQuestion,
        answer: userAnswer,
        timeSpent: 600 - timeLeft,
        confidence: Math.random() * 40 + 60,
        flagged: false,
      };

      await recordAnswer(sessionId, answer);

      if (currentQuestion < sampleQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setUserAnswer("");
        setTimeLeft(600);
      } else {
        handleCompleteSession();
      }
    } catch (error) {
      console.error("Error recording answer:", error);
    }
  };

  const handleCompleteSession = async () => {
    if (!sessionId) return;

    try {
      const finalScore = await completeProctorSession(sessionId, sampleQuestions);
      toast.success(`Interview complete! Final Score: ${finalScore}%`);
      setIsStarted(false);
      
      // Redirect to analytics after a short delay
      setTimeout(() => {
        navigate("/analytics");
      }, 2000);
    } catch (error) {
      console.error("Error completing session:", error);
      toast.error("Failed to save session results.");
    }
  };

  const handleFlagViolation = async (type: string) => {
    if (!sessionId) return;

    try {
      await flagViolation(sessionId, {
        type: type as any,
        timestamp: new Date(),
        severity: type === "tab-switch" || type === "copy-paste" ? "critical" : "warning",
        description: `Violation detected: ${type}`,
      });

      setViolations([...violations, type]);
    } catch (error) {
      console.error("Error flagging violation:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeColor = () => {
    if (timeLeft < 60) return "text-red-600";
    if (timeLeft < 180) return "text-orange-600";
    return "text-green-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Proctored Interview Mode</h1>
          <p className="text-gray-600">Simulate real interview conditions with proctoring</p>
        </div>

        {!isStarted ? (
          <Card className="mb-6 shadow-lg">
            <CardHeader>
              <CardTitle>Start Proctored Session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                  <AlertTitle>Important Guidelines</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      <li>Stay on the interview page at all times</li>
                      <li>No copy-pasting or external resources allowed</li>
                      <li>Camera and microphone must remain active</li>
                      <li>Multiple violations may result in disqualification</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-3 gap-4 py-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-2xl font-bold">{sampleQuestions.length}</p>
                    <p className="text-sm text-gray-600">Questions</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-2xl font-bold">10m</p>
                    <p className="text-sm text-gray-600">Per Question</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-2xl font-bold">Medium</p>
                    <p className="text-sm text-gray-600">Difficulty</p>
                  </div>
                </div>

                <Button onClick={handleStartSession} className="w-full py-6 text-lg">
                  Start Proctored Interview
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Timer & Status */}
            <Card className="mb-6 shadow-lg border-2 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Question {currentQuestion + 1} of {sampleQuestions.length}</p>
                    <p className="text-lg font-semibold">Progress</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-4xl font-bold ${getTimeColor()}`}>
                      {formatTime(timeLeft)}
                    </p>
                    <p className="text-sm text-gray-600">Time Remaining</p>
                  </div>
                  {violations.length > 0 && (
                    <div className="text-right">
                      <p className="text-lg font-semibold text-red-600">{violations.length}</p>
                      <p className="text-sm text-gray-600">Violations</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Violations Alert */}
            {violations.length > 0 && (
              <Alert className="mb-6 bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertTitle>Violations Detected</AlertTitle>
                <AlertDescription>
                  {violations.length > 1 ? "Multiple violations detected. Continue and you may be disqualified." : "One violation detected. Be careful."}
                </AlertDescription>
              </Alert>
            )}

            {/* Question */}
            <Card className="mb-6 shadow-lg">
              <CardHeader>
                <CardTitle>Question {currentQuestion + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
                  <p className="text-lg text-gray-800">{sampleQuestions[currentQuestion]}</p>
                </div>

                <label className="block text-sm font-medium mb-2">Your Answer:</label>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here... (No copy-pasting allowed)"
                  className="w-full px-3 py-2 border rounded-md font-mono text-sm h-32 resize-none"
                />

                <div className="mt-4 p-4 bg-gray-50 rounded text-sm text-gray-600">
                  <p>Character count: {userAnswer.length}</p>
                </div>
              </CardContent>
            </Card>

            {/* Test Violation Buttons (for demo) */}
            <Card className="mb-6 shadow-lg bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-sm">Demo: Simulate Violations (for testing only)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => handleFlagViolation("tab-switch")}
                    variant="outline"
                    size="sm"
                  >
                    Tab Switch
                  </Button>
                  <Button
                    onClick={() => handleFlagViolation("copy-paste")}
                    variant="outline"
                    size="sm"
                  >
                    Copy-Paste
                  </Button>
                  <Button
                    onClick={() => handleFlagViolation("audio-off")}
                    variant="outline"
                    size="sm"
                  >
                    Audio Off
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Controls */}
            <div className="flex gap-3">
              <Button
                onClick={handleRecordAnswer}
                disabled={!userAnswer}
                className="flex-1 py-6 text-lg"
              >
                {currentQuestion < sampleQuestions.length - 1 ? "Next Question" : "Finish Interview"}
              </Button>
              <Button
                onClick={handleCompleteSession}
                variant="outline"
                className="flex-1 py-6 text-lg"
              >
                End Session
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
