import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, CheckCircle2 } from "lucide-react";
import type { ResumeAnalysis } from "@/lib/resume-analysis";
import {
  analyzeResume,
  generateResumeImprovements,
  generateATSOptimizedResume,
} from "@/lib/resume-analysis";

export default function ResumeAnalysisPage() {
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [improvements, setImprovements] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("analysis");

  const handleAnalyzeResume = async () => {
    if (!resumeText) return;

    setLoading(true);
    try {
      const result = await analyzeResume(resumeText);
      setAnalysis(result);
      setActiveTab("analysis");
    } catch (error) {
      console.error("Error analyzing resume:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImprovements = async () => {
    if (!resumeText || !targetRole) return;

    setLoading(true);
    try {
      const result = await generateResumeImprovements(resumeText, targetRole);
      setImprovements(result);
      setActiveTab("improvements");
    } catch (error) {
      console.error("Error generating improvements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateATS = async () => {
    if (!resumeText) return;

    setLoading(true);
    try {
      const result = await generateATSOptimizedResume(resumeText);
      setResumeText(result);
    } catch (error) {
      console.error("Error generating ATS resume:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Resume Analysis</h1>
          <p className="text-gray-600">Get AI-powered feedback and optimization for your resume</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Resume Text */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Your Resume</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here..."
                  rows={12}
                  className="font-mono text-sm"
                />
                <div className="mt-2 text-sm text-gray-600">
                  {resumeText.length} characters
                </div>
              </CardContent>
            </Card>

            {/* Target Role */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Target Role (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="e.g., Senior Full-Stack Engineer at a startup"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Controls */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={handleAnalyzeResume}
                disabled={loading || !resumeText}
                className="py-6"
              >
                {loading ? "Analyzing..." : "Analyze"}
              </Button>
              <Button
                onClick={handleGenerateImprovements}
                disabled={loading || !resumeText || !targetRole}
                variant="outline"
                className="py-6"
              >
                Get Suggestions
              </Button>
              <Button
                onClick={handleGenerateATS}
                disabled={loading || !resumeText}
                variant="outline"
                className="py-6"
              >
                Optimize for ATS
              </Button>
            </div>

            {/* Improvements */}
            {improvements && activeTab === "improvements" && (
              <Card className="shadow-lg bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle>Suggested Improvements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-sm">{improvements}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Analysis Section */}
          {analysis && activeTab === "analysis" && (
            <div className="space-y-4">
              {/* Overall Score */}
              <Card className="shadow-lg border-2 border-blue-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className={`text-5xl font-bold ${getScoreColor(analysis.overallScore)} px-4 py-3 rounded-lg inline-block`}>
                      {analysis.overallScore}
                    </div>
                    <p className="text-gray-600 mt-2">Overall Score</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className={`p-3 rounded text-center ${getScoreColor(analysis.formatScore)}`}>
                      <p className="text-xs font-medium mb-1">Format</p>
                      <p className="text-lg font-bold">{analysis.formatScore}</p>
                    </div>
                    <div className={`p-3 rounded text-center ${getScoreColor(analysis.contentScore)}`}>
                      <p className="text-xs font-medium mb-1">Content</p>
                      <p className="text-lg font-bold">{analysis.contentScore}</p>
                    </div>
                    <div className={`p-3 rounded text-center ${getScoreColor(analysis.keywordScore)}`}>
                      <p className="text-xs font-medium mb-1">Keywords</p>
                      <p className="text-lg font-bold">{analysis.keywordScore}</p>
                    </div>
                    <div className={`p-3 rounded text-center ${getScoreColor(analysis.atsScore)}`}>
                      <p className="text-xs font-medium mb-1">ATS</p>
                      <p className="text-lg font-bold">{analysis.atsScore}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Strengths */}
              {analysis.strengths.length > 0 && (
                <Card className="shadow-lg bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {analysis.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-gray-700">✓ {s}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Improvements */}
              {analysis.improvements.length > 0 && (
                <Card className="shadow-lg bg-red-50 border-red-200">
                  <CardHeader>
                    <CardTitle className="text-sm">Areas to Improve</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {analysis.improvements.map((i, idx) => (
                        <li key={idx} className="text-sm text-gray-700">⚠ {i}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Missing Keywords */}
              {analysis.missingKeywords.length > 0 && (
                <Card className="shadow-lg bg-purple-50 border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-sm">Missing Keywords</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analysis.missingKeywords.map((keyword, i) => (
                        <span
                          key={i}
                          className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded"
                        >
                          +{keyword}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Industry Comparison */}
              <Card className="shadow-lg bg-orange-50 border-orange-200">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Industry Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {Math.round(analysis.industryComparison.percentile)}%
                      </p>
                      <p className="text-xs text-gray-600">Percentile</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {analysis.industryComparison.averageScore}
                      </p>
                      <p className="text-xs text-gray-600">Avg Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
