import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Trophy, CheckCircle2 } from "lucide-react";
import type { StudyPlan } from "@/lib/study-plans";
import {
  generatePersonalizedStudyPlan,
  updateStudyPlanProgress,
  calculateStudyStats,
} from "@/lib/study-plans";

export default function StudyPlansPage() {
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [showGenerator, setShowGenerator] = useState(true);
  const [formData, setFormData] = useState({
    targetRole: "Software Engineer",
    currentLevel: "intermediate",
    daysAvailable: "30",
  });
  const [loading, setLoading] = useState(false);

  const handleGeneratePlan = async () => {
    if (!formData.targetRole || !formData.daysAvailable) return;

    setLoading(true);
    try {
      const plan = await generatePersonalizedStudyPlan(
        "current-user",
        formData.targetRole,
        formData.currentLevel as any,
        parseInt(formData.daysAvailable)
      );
      setStudyPlan(plan);
      setShowGenerator(false);
    } catch (error) {
      console.error("Error generating plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTopic = async (topicId: string) => {
    if (!studyPlan?.id) return;

    try {
      await updateStudyPlanProgress(studyPlan.id, topicId, true, 85);
      setStudyPlan({
        ...studyPlan,
        topics: studyPlan.topics.map((t) =>
          t.id === topicId ? { ...t, completed: true } : t
        ),
        progress: Math.round(
          (studyPlan.topics.filter((t) => t.completed || t.id === topicId).length /
            studyPlan.topics.length) *
            100
        ),
      });
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const stats = studyPlan ? calculateStudyStats(studyPlan) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Personalized Study Plans</h1>
          <p className="text-gray-600">Create a structured learning path tailored to your goals</p>
        </div>

        {showGenerator ? (
          <Card className="shadow-lg max-w-2xl">
            <CardHeader>
              <CardTitle>Create Your Study Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Target Role</label>
                  <input
                    type="text"
                    value={formData.targetRole}
                    onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Current Level</label>
                  <select
                    value={formData.currentLevel}
                    onChange={(e) => setFormData({ ...formData, currentLevel: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Days Available</label>
                  <input
                    type="number"
                    min="7"
                    max="180"
                    value={formData.daysAvailable}
                    onChange={(e) => setFormData({ ...formData, daysAvailable: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <p className="text-xs text-gray-600 mt-1">Recommended: 30-60 days</p>
                </div>

                <Button onClick={handleGeneratePlan} disabled={loading} className="w-full py-6">
                  {loading ? "Generating Your Plan..." : "Generate Study Plan"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : studyPlan ? (
          <>
            {/* Plan Header */}
            <Card className="mb-6 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">{studyPlan.title}</CardTitle>
                    <p className="text-gray-600">{studyPlan.goal}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowGenerator(true)}
                  >
                    Create New Plan
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="shadow-md">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {studyPlan.progress}%
                      </div>
                      <p className="text-sm text-gray-600">Progress</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-md">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        {stats.totalTopicsCompleted}/{studyPlan.topics.length}
                      </div>
                      <p className="text-sm text-gray-600">Topics Completed</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-md">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-1">
                        {stats.milestonesCompleted}/{studyPlan.milestones.length}
                      </div>
                      <p className="text-sm text-gray-600">Milestones</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-md">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600 mb-1">
                        {stats.consistencyScore}%
                      </div>
                      <p className="text-sm text-gray-600">Consistency</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Topics */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Topics to Cover</h2>
              <div className="space-y-3">
                {studyPlan.topics.map((topic) => (
                  <Card key={topic.id} className="shadow-md">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg">{topic.name}</h3>
                            {topic.completed && (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{topic.description}</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="outline">{topic.estimatedHours} hours</Badge>
                            <Badge variant="outline">{topic.practiceQuestions} questions</Badge>
                            {topic.score && (
                              <Badge className="bg-green-100 text-green-800">
                                Score: {topic.score}%
                              </Badge>
                            )}
                          </div>

                          {/* Resources */}
                          <div className="space-y-1 mb-3">
                            {topic.resources.map((resource, idx) => (
                              <div
                                key={idx}
                                className="text-sm flex items-center gap-2 text-gray-700"
                              >
                                <BookOpen className="h-4 w-4" />
                                {resource.title}
                              </div>
                            ))}
                          </div>
                        </div>

                        {!topic.completed && (
                          <Button
                            onClick={() => handleCompleteTopic(topic.id)}
                            className="ml-4"
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Milestones */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Trophy className="h-6 w-6" /> Milestones
              </h2>
              <div className="space-y-3">
                {studyPlan.milestones.map((milestone) => (
                  <Card key={milestone.id} className="shadow-md">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold">{milestone.title}</h3>
                            {milestone.completed && (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{milestone.description}</p>
                          <p className="text-xs text-gray-600">
                            Target: {new Date(milestone.targetDate).toLocaleDateString()}
                          </p>
                        </div>
                        {milestone.reward && (
                          <Badge className="bg-yellow-100 text-yellow-800 ml-4">
                            {milestone.reward}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
