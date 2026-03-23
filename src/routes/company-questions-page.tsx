import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { CompanyQuestion } from "@/lib/company-questions";
import { getCompanyQuestions, searchCompanyQuestions, popularCompanies } from "@/lib/company-questions";
import { CompanyQuestionPractice } from "@/components/company-question-practice";

export default function CompanyQuestionsPage() {
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [questions, setQuestions] = useState<CompanyQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [practiceQuestion, setPracticeQuestion] = useState<CompanyQuestion | null>(null);
  const [showPracticeModal, setShowPracticeModal] = useState(false);

  const handleCompanySelect = async (company: string) => {
    setSelectedCompany(company);
    setLoading(true);
    try {
      const results = await getCompanyQuestions(company);
      setQuestions(results);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!selectedCompany || !searchTerm) return;
    setLoading(true);
    try {
      const results = await searchCompanyQuestions(selectedCompany, searchTerm);
      setQuestions(results);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePracticeQuestion = (question: CompanyQuestion) => {
    setPracticeQuestion(question);
    setShowPracticeModal(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === "easy") return "bg-green-100 text-green-800";
    if (difficulty === "medium") return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Company-Specific Questions</h1>
          <p className="text-gray-600">Practice with real interview questions from top companies</p>
        </div>

        {/* Company Selection */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle>Select a Company</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {popularCompanies.map((company) => (
                <Button
                  key={company}
                  onClick={() => handleCompanySelect(company)}
                  variant={selectedCompany === company ? "default" : "outline"}
                  className="h-auto py-3 text-sm font-medium"
                >
                  {company}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        {selectedCompany && (
          <Card className="mb-6 shadow-lg">
            <CardHeader>
              <CardTitle>Search Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Search by topic, role, or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {loading && (
            <Alert>
              <AlertDescription>Loading questions...</AlertDescription>
            </Alert>
          )}

          {questions.length === 0 && selectedCompany && !loading && (
            <Alert>
              <AlertDescription>No questions found. Try a different search or select another company.</AlertDescription>
            </Alert>
          )}

          {questions.map((question) => (
            <Card key={question.id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-lg font-semibold mb-2">{question.question}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline">{question.company}</Badge>
                        <Badge variant="outline">{question.role}</Badge>
                        <Badge variant="outline">{question.category}</Badge>
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{question.frequency}</div>
                      <div className="text-sm text-gray-600">times asked</div>
                    </div>
                  </div>

                  {question.tips && question.tips.length > 0 && (
                    <div>
                      <p className="font-semibold text-sm mb-2">Tips:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {question.tips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {question.exampleAnswer && (
                    <div>
                      <p className="font-semibold text-sm mb-2">Example Answer:</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{question.exampleAnswer}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button 
                      className="flex-1" 
                      onClick={() => handlePracticeQuestion(question)}
                    >
                      Practice This Question
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Save
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Practice Modal */}
        <Dialog open={showPracticeModal} onOpenChange={setShowPracticeModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Practice Question</DialogTitle>
              <DialogDescription>
                Record your answer to this interview question
              </DialogDescription>
            </DialogHeader>
            {practiceQuestion && (
              <CompanyQuestionPractice 
                question={practiceQuestion}
                onClose={() => setShowPracticeModal(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
