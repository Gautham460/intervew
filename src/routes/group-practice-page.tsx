import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { GroupSession } from "@/lib/group-practice";
import {
  createGroupSession,
  getGroupSessions,
  inviteToSession,
  calculateGroupStats,
} from "@/lib/group-practice";
import { useAuth } from "@clerk/clerk-react";

export default function GroupPracticePage() {
  const [sessions, setSessions] = useState<GroupSession[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [inviteEmails, setInviteEmails] = useState("");
  const [loading, setLoading] = useState(false);

  const { userId } = useAuth();
  
  useEffect(() => {
    if (userId) {
      loadSessions();
    }
  }, [userId]);

  const loadSessions = async () => {
    try {
      if (!userId) return;
      const data = await getGroupSessions(userId);
      setSessions(data);
    } catch (error) {
      console.error("Error loading sessions:", error);
    }
  };

  const handleCreateSession = async () => {
    if (!sessionName) return;
    setLoading(true);
    try {
      if (!userId) return;
      const newSession: GroupSession = {
        name: sessionName,
        description,
        createdBy: userId,
        members: [userId],
        invitedEmails: [],
        status: "scheduled",
        difficulty,
        questions: [],
        results: [],
        scheduledTime: new Date(),
      };

      const sessionId = await createGroupSession(newSession);

      if (inviteEmails) {
        const emails = inviteEmails.split(",").map((e) => e.trim());
        await inviteToSession(sessionId, emails);
      }

      setSessionName("");
      setDescription("");
      setInviteEmails("");
      setShowCreate(false);
      loadSessions();
    } catch (error) {
      console.error("Error creating session:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "scheduled") return "bg-blue-100 text-blue-800";
    if (status === "active") return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === "easy") return "bg-green-100 text-green-800";
    if (difficulty === "medium") return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Group Practice Sessions</h1>
            <p className="text-gray-600">Collaborate with others to prepare for interviews</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="h-fit" size="lg">
            Create Session
          </Button>
        </div>

        {/* Create Session Form */}
        {showCreate && (
          <Card className="mb-6 shadow-lg border-2 border-blue-200">
            <CardHeader>
              <CardTitle>Create New Group Session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Session Name</label>
                  <Input
                    placeholder="e.g., Google System Design Prep"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    placeholder="What will this session cover?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Invite Members (comma-separated emails)</label>
                  <Input
                    placeholder="email1@example.com, email2@example.com"
                    value={inviteEmails}
                    onChange={(e) => setInviteEmails(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateSession} disabled={loading || !sessionName} className="flex-1">
                    {loading ? "Creating..." : "Create Session"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreate(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sessions List */}
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <Alert>
              <AlertDescription>
                No sessions yet. Create one to get started with group practice!
              </AlertDescription>
            </Alert>
          ) : (
            sessions.map((session) => {
              const stats = calculateGroupStats(session);
              return (
                <Card key={session.id} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">{session.name}</h3>
                          <p className="text-gray-600 mb-3">{session.description}</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge className={getStatusColor(session.status)}>
                              {session.status}
                            </Badge>
                            <Badge className={getDifficultyColor(session.difficulty)}>
                              {session.difficulty}
                            </Badge>
                            <Badge variant="outline">{stats.totalParticipants} participants</Badge>
                          </div>
                        </div>
                        <Button>Join Session</Button>
                      </div>

                      {session.results.length > 0 && (
                        <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {stats.avgScore}
                            </div>
                            <div className="text-sm text-gray-600">Avg Score</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {stats.topScorer?.userName}
                            </div>
                            <div className="text-sm text-gray-600">Top Scorer</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {stats.totalParticipants}
                            </div>
                            <div className="text-sm text-gray-600">Participants</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {Math.round(stats.avgTime / 60)}m
                            </div>
                            <div className="text-sm text-gray-600">Avg Time</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
