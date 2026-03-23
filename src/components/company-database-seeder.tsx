import { useState } from "react";
import { Button } from "./ui/button";
import { Loader, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { seedCompanyQuestionsDatabase } from "@/lib/seed-company-questions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

/**
 * Admin component to seed the company-specific interview questions database
 * Contains 80 questions across 8 categories
 */
export const CompanyDatabaseSeeder = () => {
  const [loading, setLoading] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const handleSeedDatabase = async () => {
    setLoading(true);
    try {
      await seedCompanyQuestionsDatabase();
      setSeeded(true);
      toast.success("Company questions database seeded!", {
        description: "80 interview questions across 8 categories have been added",
      });
    } catch (error) {
      console.error("Error seeding database:", error);
      toast.error("Error seeding database", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-amber-600" />
          Company-Specific Questions Setup
        </CardTitle>
        <CardDescription>Populate with real interview questions from tech companies</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Optional: Enhanced Interview Practice</AlertTitle>
          <AlertDescription>
            Click the button below to populate the database with 80 real interview questions
            from companies like Google, Meta, Apple, Microsoft, Amazon, and more. Organized by
            category: Behavioral, Technical, System Design, Data Structures, Algorithms,
            Problem Solving, Leadership, and Communication.
          </AlertDescription>
        </Alert>

        <Button
          onClick={handleSeedDatabase}
          disabled={loading || seeded}
          className={seeded ? "bg-green-600" : "bg-amber-600 hover:bg-amber-700"}
        >
          {loading ? (
            <>
              <Loader className="mr-2 animate-spin" size={20} />
              Seeding...
            </>
          ) : seeded ? (
            <>
              <CheckCircle2 className="mr-2" size={20} />
              Company Questions Seeded
            </>
          ) : (
            "Seed Company Interview Questions"
          )}
        </Button>

        <div className="text-sm text-gray-700 space-y-3">
          <div>
            <p className="font-semibold mb-2">Coverage:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li><strong>10 Companies:</strong> Google, Meta, Apple, Microsoft, Amazon, Netflix, Tesla, Stripe, Airbnb, LinkedIn</li>
              <li><strong>8 Categories:</strong> Behavioral (10), Technical (10), System Design (10), Data Structures (10), Algorithms (10), Problem Solving (10), Leadership (10), Communication (10)</li>
              <li><strong>Total: 80 Questions</strong> with difficulty levels and answer guidance</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold mb-2">Each Question Includes:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Company name and target role</li>
              <li>Difficulty level (easy/medium/hard)</li>
              <li>Category classification</li>
              <li>5+ Tips for answering</li>
              <li>Example answer or approach</li>
            </ul>
          </div>

          <div className="bg-white p-2 rounded text-xs">
            <p className="font-semibold mb-1">Use this for:</p>
            <p>✓ Interview preparation with real company questions</p>
            <p>✓ Practicing responses to common interview scenarios</p>
            <p>✓ Learning different question types and categories</p>
            <p>✓ Improving behavioral and technical communication</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
