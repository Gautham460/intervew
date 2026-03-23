import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { db } from "@/config/firebase.config";
import { collection, getDocs, query } from "firebase/firestore";
import { Headings } from "@/components/headings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DatabaseSeeder } from "@/components/database-seeder";
import { CompanyDatabaseSeeder } from "@/components/company-database-seeder";
import { LoaderPage } from "./loader-page";
import { AlertCircle, CheckCircle2, Database } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const SetupPage = () => {
  const { userId, isLoaded } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [databaseStatus, setDatabaseStatus] = useState<{
    isSeeded: boolean;
    skillCount: number;
    questionCount: number;
  }>({ isSeeded: false, skillCount: 0, questionCount: 0 });

  useEffect(() => {
    const checkDatabaseStatus = async () => {
      try {
        const skillQuestionsRef = collection(db, "skillQuestions");
        const snapshot = await getDocs(query(skillQuestionsRef));

        let totalQuestions = 0;
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.questions && Array.isArray(data.questions)) {
            totalQuestions += data.questions.length;
          }
        });

        setDatabaseStatus({
          isSeeded: snapshot.size > 0,
          skillCount: snapshot.size,
          questionCount: totalQuestions,
        });
      } catch (error) {
        console.error("Error checking database:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoaded) {
      checkDatabaseStatus();
    }
  }, [isLoaded]);

  if (!isLoaded || isLoading) {
    return <LoaderPage className="w-full h-[70vh]" />;
  }

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">
          Please sign in to access setup
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-8 py-5">
      <div className="space-y-2">
        <Headings
          title="Database Setup"
          description="Manage your skill questions database"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Database Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {databaseStatus.isSeeded ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              )}
              <span className="font-semibold">
                {databaseStatus.isSeeded ? "✓ Seeded" : "Not Seeded"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Skills Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {databaseStatus.skillCount}
            </div>
            <p className="text-xs text-muted-foreground">skills in database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {databaseStatus.questionCount}
            </div>
            <p className="text-xs text-muted-foreground">questions available</p>
          </CardContent>
        </Card>
      </div>

      {!databaseStatus.isSeeded && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Database className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-900">
            Database Not Seeded
          </AlertTitle>
          <AlertDescription className="text-yellow-800">
            Click the button below to populate the database with skill questions.
            This is a one-time setup.
          </AlertDescription>
        </Alert>
      )}

      {databaseStatus.isSeeded && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900">
            Database Ready
          </AlertTitle>
          <AlertDescription className="text-green-800">
            Your skill questions database is set up and ready to use!
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Setup Database</CardTitle>
        </CardHeader>
        <CardContent>
          <DatabaseSeeder />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Setup Company Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyDatabaseSeeder />
        </CardContent>
      </Card>

      {databaseStatus.isSeeded && (
        <Card>
          <CardHeader>
            <CardTitle>Available Skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              The following skills are available in your database:
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "React",
                "TypeScript",
                "Node.js",
                "Python",
                "Java",
                "C#",
                "JavaScript",
                "HTML",
                "CSS",
                "Vue",
                "Angular",
                "Docker",
                "Kubernetes",
                "Git",
                "AWS",
                "SQL",
                "MongoDB",
                "Firebase",
                "Tailwind CSS",
                "REST API",
              ].map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">1. Seed Database</h4>
            <p className="text-sm text-muted-foreground">
              Click "Seed Database with Questions" to populate Firestore with
              pre-written questions for 20 different skills.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">2. Interview Creation</h4>
            <p className="text-sm text-muted-foreground">
              When users create interviews and upload resumes, the system
              automatically detects their skills and fetches matching questions
              from this database.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">3. Customization</h4>
            <p className="text-sm text-muted-foreground">
              You can add more questions directly in Firebase Console or through
              code. Questions will be automatically available to users.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
