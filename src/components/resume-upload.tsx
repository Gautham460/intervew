import { useState, useRef } from "react";
import { Upload, File, CheckCircle2, AlertCircle, Loader, Building, Target, Zap } from "lucide-react";
import { toast } from "sonner";
import { extractTextFromFile, extractSkillsFromResume, groupSkillsByCategory, SkillMatch } from "@/lib/resume-parser";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

type FunctionalityType = "mock-interview" | "company-questions" | "study-plan" | null;

interface ResumeUploadProps {
  onSkillsExtracted: (skills: SkillMatch[]) => void;
  onDifficultyChange?: (difficulty: "easy" | "medium" | "hard") => void;
  onCompanyChange?: (company: string) => void;
  onFunctionalitySelect?: (functionality: FunctionalityType) => void;
}

export const ResumeUpload = ({ 
  onSkillsExtracted, 
  onDifficultyChange,
  onCompanyChange,
  onFunctionalitySelect 
}: ResumeUploadProps) => {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [extractedSkills, setExtractedSkills] = useState<SkillMatch[]>([]);
  const [showSkills, setShowSkills] = useState(false);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [preferredCompany, setPreferredCompany] = useState("");
  const [selectedFunctionality, setSelectedFunctionality] = useState<FunctionalityType>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["text/plain", "application/pdf"];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".txt") && !file.name.endsWith(".pdf")) {
      toast.error("Invalid file type", {
        description: "Please upload a .txt or .pdf file",
      });
      return;
    }

    try {
      setLoading(true);
      setFileName(file.name);

      // Show info toast for PDF files
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        toast.info("Processing PDF", {
          description: "Extracting text from your PDF resume...",
        });
      }

      // Extract text from file (supports both .txt and .pdf)
      const extractedText = await extractTextFromFile(file);

      // Extract skills from the resume text
      const analysis = extractSkillsFromResume(extractedText);
      setExtractedSkills(analysis.skills);
      setShowSkills(true);
      onSkillsExtracted(analysis.skills);

      if (analysis.skills.length === 0) {
        toast.warning("No skills found", {
          description: "Could not extract any recognized skills from your resume.",
        });
      } else {
        toast.success("Success", {
          description: `Found ${analysis.skills.length} skill(s) in your resume!`,
        });
      }
    } catch (error) {
      console.error("Resume parsing error:", error);
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to parse resume. Please try again.",
      });
      setFileName(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDifficultyChange = (newDifficulty: "easy" | "medium" | "hard") => {
    setDifficulty(newDifficulty);
    onDifficultyChange?.(newDifficulty);
  };

  const handleCompanyChange = (company: string) => {
    setPreferredCompany(company);
    onCompanyChange?.(company);
  };

  const handleFunctionalitySelect = (functionality: FunctionalityType) => {
    setSelectedFunctionality(functionality);
    onFunctionalitySelect?.(functionality);
    toast.success("Selection saved", {
      description: `You chose: ${getFunctionalityLabel(functionality)}`,
    });
  };

  const getFunctionalityLabel = (func: FunctionalityType) => {
    switch (func) {
      case "mock-interview":
        return "Mock Interview";
      case "company-questions":
        return "Company Questions";
      case "study-plan":
        return "Study Plan";
      default:
        return "";
    }
  };

  const groupedSkills = groupSkillsByCategory(extractedSkills);

  return (
    <div className="w-full space-y-4">
      <Card className="border-2 border-dashed hover:border-blue-400 transition-colors">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Upload Your Resume</CardTitle>
          <CardDescription>Extract skills automatically from your resume</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf"
              onChange={handleFileUpload}
              className="hidden"
              disabled={loading}
            />

            <button
              onClick={handleClick}
              disabled={loading}
              className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex flex-col items-center gap-2">
                {loading ? (
                  <Loader className="w-8 h-8 animate-spin text-blue-600" />
                ) : (
                  <Upload className="w-8 h-8 text-gray-400" />
                )}
                <div className="text-sm">
                  <p className="font-medium text-gray-700">
                    {loading ? "Parsing resume..." : "Click to upload resume"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Supported formats: .txt, .pdf
                  </p>
                </div>
              </div>
            </button>

            {fileName && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <File className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700 flex-1">{fileName}</span>
                {extractedSkills.length > 0 && (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showSkills && extractedSkills.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <CardTitle className="text-lg">Extracted Skills</CardTitle>
            </div>
            <CardDescription>
              {extractedSkills.length} skill(s) found in your resume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(groupedSkills).map(([category, skills]) => (
                skills.length > 0 && (
                  <div key={category} className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">{category}</p>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="bg-green-100 text-green-800 hover:bg-green-200"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Difficulty Selection */}
      {showSkills && extractedSkills.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">Select Difficulty</CardTitle>
            </div>
            <CardDescription>
              Choose the difficulty level for skill-based questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {(["easy", "medium", "hard"] as const).map((level) => (
                <Button
                  key={level}
                  variant={difficulty === level ? "default" : "outline"}
                  onClick={() => handleDifficultyChange(level)}
                  className={`capitalize ${
                    difficulty === level
                      ? level === "easy"
                        ? "bg-green-600 hover:bg-green-700"
                        : level === "medium"
                        ? "bg-yellow-600 hover:bg-yellow-700"
                        : "bg-red-600 hover:bg-red-700"
                      : ""
                  }`}
                >
                  {level}
                </Button>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Current: <span className="font-medium capitalize">{difficulty}</span>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Preferred Company Input */}
      {showSkills && extractedSkills.length > 0 && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-purple-600" />
              <CardTitle className="text-lg">Preferred Company</CardTitle>
            </div>
            <CardDescription>
              Enter the company you're targeting (optional)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="e.g., Google, Microsoft, Amazon..."
              value={preferredCompany}
              onChange={(e) => handleCompanyChange(e.target.value)}
              className="bg-white"
            />
            {preferredCompany && (
              <p className="text-sm text-purple-700 mt-2">
                Targeting: <span className="font-medium">{preferredCompany}</span>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Functionality Selection */}
      {showSkills && extractedSkills.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-600" />
              <CardTitle className="text-lg">Choose Functionality</CardTitle>
            </div>
            <CardDescription>
              What would you like to do with your extracted skills?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                variant={selectedFunctionality === "mock-interview" ? "default" : "outline"}
                onClick={() => handleFunctionalitySelect("mock-interview")}
                className={`h-auto py-4 flex flex-col items-center gap-2 ${
                  selectedFunctionality === "mock-interview" 
                    ? "bg-blue-600 hover:bg-blue-700" 
                    : "hover:bg-orange-100"
                }`}
              >
                <Zap className="w-6 h-6" />
                <span className="font-medium">Mock Interview</span>
                <span className="text-xs opacity-80">Practice with AI</span>
              </Button>
              
              <Button
                variant={selectedFunctionality === "company-questions" ? "default" : "outline"}
                onClick={() => handleFunctionalitySelect("company-questions")}
                className={`h-auto py-4 flex flex-col items-center gap-2 ${
                  selectedFunctionality === "company-questions" 
                    ? "bg-blue-600 hover:bg-blue-700" 
                    : "hover:bg-orange-100"
                }`}
              >
                <Building className="w-6 h-6" />
                <span className="font-medium">Company Questions</span>
                <span className="text-xs opacity-80">Specific company</span>
              </Button>
              
              <Button
                variant={selectedFunctionality === "study-plan" ? "default" : "outline"}
                onClick={() => handleFunctionalitySelect("study-plan")}
                className={`h-auto py-4 flex flex-col items-center gap-2 ${
                  selectedFunctionality === "study-plan" 
                    ? "bg-blue-600 hover:bg-blue-700" 
                    : "hover:bg-orange-100"
                }`}
              >
                <Target className="w-6 h-6" />
                <span className="font-medium">Study Plan</span>
                <span className="text-xs opacity-80">Structured learning</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showSkills && extractedSkills.length > 0 && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900">Interview Questions Ready</AlertTitle>
          <AlertDescription className="text-blue-800">
            When you submit this form, interview questions will be automatically fetched from our database for each detected skill.
          </AlertDescription>
        </Alert>
      )}

      {showSkills && extractedSkills.length === 0 && fileName && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <CardTitle className="text-lg">No Skills Found</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-800">
              We couldn't extract any recognized skills from your resume. You can still create a mock interview manually.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
