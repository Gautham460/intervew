import { useState } from "react";
import { Button } from "./ui/button";
import { Loader, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { seedSkillQuestionsDatabase } from "@/lib/seed-questions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

/**
 * Admin component to seed the skill questions database
 * This should only be visible to admins or on first-time setup
 */
export const DatabaseSeeder = () => {
  const [loading, setLoading] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const handleSeedDatabase = async () => {
    setLoading(true);
    try {
      await seedSkillQuestionsDatabase();
      setSeeded(true);
      toast.success("Database seeded!", {
        description: "20 skills with questions have been added to the database",
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
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
          Database Setup
        </CardTitle>
        <CardDescription>Initialize skill questions database</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>First-Time Setup Required</AlertTitle>
          <AlertDescription>
            Click the button below to populate the database with 20 skills and 40+ interview
            questions. This only needs to be done once.
          </AlertDescription>
        </Alert>

        <Button
          onClick={handleSeedDatabase}
          disabled={loading || seeded}
          className={seeded ? "bg-green-600" : ""}
        >
          {loading ? (
            <>
              <Loader className="mr-2 animate-spin" size={20} />
              Seeding...
            </>
          ) : seeded ? (
            <>
              <CheckCircle2 className="mr-2" size={20} />
              Database Seeded
            </>
          ) : (
            "Seed Database with Questions"
          )}
        </Button>

        <div className="text-sm text-gray-600">
          <p className="font-semibold mb-2">Includes:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>React (2 questions)</li>
            <li>TypeScript (2 questions)</li>
            <li>Node.js (2 questions)</li>
            <li>Python (2 questions)</li>
            <li>JavaScript (2 questions)</li>
            <li>AWS (2 questions)</li>
            <li>Docker (2 questions)</li>
            <li>MongoDB (2 questions)</li>
            <li>SQL (2 questions)</li>
            <li>Vue, Angular, Kubernetes, Git, Firebase, HTML, CSS, Tailwind CSS, C#, Java,
              REST API and more...
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
