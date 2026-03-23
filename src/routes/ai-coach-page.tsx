import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateCoachFeedback, generateRealTimeHints, getCoachContextResponse, type CoachFeedback } from "@/lib/ai-coach";
import { useAuth } from "@clerk/clerk-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { UserAnswer } from "@/types";
import { MessageSquare, Send, Bot, User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AiCoachPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("behavioral");
  const [feedback, setFeedback] = useState<CoachFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [hints, setHints] = useState<string[]>([]);
  const [chatQuery, setChatQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "bot"; content: string }[]>([]);
  const [userPerformance, setUserPerformance] = useState<UserAnswer[]>([]);
  const { userId } = useAuth();

  useEffect(() => {
    const fetchUserPerformance = async () => {
      if (!userId) return;
      const q = query(collection(db, "userAnswers"), where("userId", "==", userId));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserAnswer[];
      setUserPerformance(data);
    };
    fetchUserPerformance();
  }, [userId]);

  const sampleQuestions = [
    {
      text: "Tell us about a time when you had to handle a difficult situation with a colleague.",
      category: "behavioral",
    },
    {
      text: "Explain how you would design a distributed cache system.",
      category: "system-design",
    },
    {
      text: "What is your experience with microservices architecture?",
      category: "technical",
    },
  ];

  const handleGetFeedback = async () => {
    if (!question || !answer) return;

    setLoading(true);
    try {
      const coachFeedback = await generateCoachFeedback(question, answer, category);
      setFeedback(coachFeedback);
      setHints([]);
    } catch (error) {
      console.error("Error getting feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetHints = async () => {
    if (!question || !answer) return;

    setLoading(true);
    try {
      const realTimeHints = await generateRealTimeHints(question, answer);
      setHints(realTimeHints);
    } catch (error) {
      console.error("Error getting hints:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    if (!chatQuery.trim()) return;

    const newUserMsg = { role: "user" as const, content: chatQuery };
    setChatHistory((prev) => [...prev, newUserMsg]);
    setChatQuery("");
    setLoading(true);

    try {
      const response = await getCoachContextResponse(chatQuery, userPerformance);
      setChatHistory((prev) => [...prev, { role: "bot", content: response }]);
    } catch (error) {
      console.error("Error in chat:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const handleSelectSample = (sample: typeof sampleQuestions[0]) => {
    setQuestion(sample.text);
    setCategory(sample.category);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Interview Coach</h1>
          <p className="text-gray-600">Get real-time feedback and personalized coaching on your interview answers</p>
        </div>

        {/* Sample Questions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {sampleQuestions.map((sample, idx) => (
            <Button
              key={idx}
              onClick={() => handleSelectSample(sample)}
              variant="outline"
              className="h-auto py-3 text-left justify-start"
            >
              <div>
                <p className="text-xs text-gray-600 mb-1">{sample.category}</p>
                <p className="text-sm font-medium line-clamp-2">{sample.text}</p>
              </div>
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Question */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Interview Question</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="behavioral">Behavioral</option>
                      <option value="technical">Technical</option>
                      <option value="system-design">System Design</option>
                      <option value="problem-solving">Problem Solving</option>
                    </select>
                  </div>
                  <Textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Enter the interview question..."
                    rows={3}
                    className="font-medium"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Answer */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Your Answer</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={6}
                />
              </CardContent>
            </Card>

            {/* Controls */}
            <div className="flex gap-3">
              <Button
                onClick={handleGetHints}
                disabled={loading || !question || !answer}
                variant="outline"
                className="flex-1 py-6"
              >
                Get Real-Time Hints
              </Button>
              <Button
                onClick={handleGetFeedback}
                disabled={loading || !question || !answer}
                className="flex-1 py-6"
              >
                {loading ? "Analyzing..." : "Get Full Feedback"}
              </Button>
            </div>

            {/* Real-Time Hints */}
            {hints.length > 0 && (
              <Card className="shadow-lg border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg">Real-Time Hints</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {hints.map((hint, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">💡</span>
                        <p className="text-gray-800">{hint}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Feedback Section */}
          {feedback && (
            <div className="space-y-4">
              {/* Overall Score */}
              <Card className="shadow-lg border-2 border-blue-200">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <div className={`text-5xl font-bold ${getScoreColor(feedback.overallScore)} mb-2`}>
                      {feedback.overallScore}
                    </div>
                    <p className="text-gray-600">Overall Score</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-600">Percentile</p>
                      <p className="font-bold">{Math.round(feedback.communityBenchmark.percentile)}%</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-600">Avg Score</p>
                      <p className="font-bold">{feedback.communityBenchmark.avgScore}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Strengths */}
              {feedback.strengths.length > 0 && (
                <Card className="shadow-lg bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-sm">✓ Strengths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {feedback.strengths.map((strength, idx) => (
                        <li key={idx} className="text-sm text-gray-700">• {strength}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Weaknesses */}
              {feedback.weaknesses.length > 0 && (
                <Card className="shadow-lg bg-red-50 border-red-200">
                  <CardHeader>
                    <CardTitle className="text-sm">⚠ Areas to Improve</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {feedback.weaknesses.map((weakness, idx) => (
                        <li key={idx} className="text-sm text-gray-700">• {weakness}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Sentiment Analysis */}
              {feedback.sentimentAnalysis && (
                <Card className="shadow-lg bg-orange-50 border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-sm">🗣 Performance Delivery</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Confidence:</span>
                        <Badge variant="outline" className="border-orange-500">
                          {feedback.sentimentAnalysis.confidence}%
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Pacing:</span>
                        <Badge variant="outline" className="capitalize">
                          {feedback.sentimentAnalysis.pacing.replace("-", " ")}
                        </Badge>
                      </div>
                      {feedback.sentimentAnalysis.fillerWords.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Filler Words Detected:</p>
                          <div className="flex flex-wrap gap-1">
                            {feedback.sentimentAnalysis.fillerWords.map((word, idx) => (
                              <Badge key={idx} variant="secondary" className="text-[10px]">
                                {word}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Practice Recommendation */}
              {feedback.recommendedPractice && (
                <Card className="shadow-lg bg-purple-50 border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-sm">📚 Next Steps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">{feedback.recommendedPractice}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* AI Career Coach Chat Interface */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="shadow-2xl border-2 border-blue-500 overflow-hidden">
            <CardHeader className="bg-blue-500 text-white flex flex-row items-center gap-2">
              <Bot className="w-6 h-6" />
              <CardTitle>AI Career Coach (Contextual Chat)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[400px] overflow-y-auto p-6 space-y-4 bg-gray-50">
                {chatHistory.length === 0 && (
                  <div className="text-center text-gray-500 mt-10">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>Ask me anything about your performance trends!</p>
                    <p className="text-xs italic">(e.g., "How can I improve my technical score based on my history?")</p>
                  </div>
                )}
                {chatHistory.map((chat, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex gap-3 max-w-[80%]",
                      chat.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      chat.role === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                    )}>
                      {chat.role === "user" ? <UserIcon size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={cn(
                      "p-3 rounded-lg text-sm",
                      chat.role === "user" ? "bg-blue-600 text-white" : "bg-white border shadow-sm text-gray-800"
                    )}>
                      {chat.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                    <div className="p-3 bg-gray-100 rounded-lg w-32 h-8" />
                  </div>
                )}
              </div>
              <div className="p-4 border-t bg-white flex gap-2">
                <Textarea
                  value={chatQuery}
                  onChange={(e) => setChatQuery(e.target.value)}
                  placeholder="Ask your AI coach..."
                  className="min-h-0 h-10 py-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleChat();
                    }
                  }}
                />
                <Button onClick={handleChat} disabled={loading || !chatQuery.trim()} className="bg-blue-500 hover:bg-blue-600">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
