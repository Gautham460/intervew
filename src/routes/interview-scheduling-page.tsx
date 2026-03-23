import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, TrendingUp } from "lucide-react";
import type { InterviewSchedule, InterviewCalendar } from "@/lib/interview-scheduling";
import {
  createInterviewSchedule,
  getInterviewCalendar,
  calculateTimeUntilInterview,
} from "@/lib/interview-scheduling";

export default function InterviewSchedulingPage() {
  const [calendar, setCalendar] = useState<InterviewCalendar | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    role: "",
    difficulty: "medium",
    date: "",
    time: "",
    duration: "60",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCalendar();
  }, []);

  const loadCalendar = async () => {
    try {
      const data = await getInterviewCalendar("current-user");
      setCalendar(data);
    } catch (error) {
      console.error("Error loading calendar:", error);
    }
  };

  const handleCreateSchedule = async () => {
    if (!formData.title || !formData.date) return;

    setLoading(true);
    try {
      const scheduledDate = new Date(`${formData.date}T${formData.time || "10:00"}`);
      const schedule: InterviewSchedule = {
        userId: "current-user",
        title: formData.title,
        description: formData.role ? `Interview for ${formData.role} at ${formData.company}` : "",
        scheduledDate,
        estimatedDuration: parseInt(formData.duration),
        difficulty: formData.difficulty as any,
        company: formData.company,
        role: formData.role,
        topicsFocus: ["algorithms", "system-design", "behavioral"],
        reminders: true,
        status: "scheduled",
      };

      await createInterviewSchedule(schedule);
      setFormData({
        title: "",
        company: "",
        role: "",
        difficulty: "medium",
        date: "",
        time: "",
        duration: "60",
      });
      setShowCreate(false);
      loadCalendar();
    } catch (error) {
      console.error("Error creating schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Interview Scheduling</h1>
            <p className="text-gray-600">Manage and track your interview practice sessions</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="h-fit" size="lg">
            Schedule Interview
          </Button>
        </div>

        {/* Stats */}
        {calendar && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="shadow-md">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{calendar.upcomingCount}</div>
                  <p className="text-sm text-gray-600">Upcoming Sessions</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">{calendar.completedCount}</div>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">{calendar.averageScore}</div>
                  <p className="text-sm text-gray-600">Average Score</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-1">{calendar.schedules.length}</div>
                  <p className="text-sm text-gray-600">Total Scheduled</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Schedule Form */}
        {showCreate && (
          <Card className="mb-6 shadow-lg border-2 border-blue-200">
            <CardHeader>
              <CardTitle>Schedule New Interview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Interview Title</label>
                  <Input
                    placeholder="e.g., Google System Design"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Company</label>
                  <Input
                    placeholder="e.g., Google"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <Input
                    placeholder="e.g., Senior Engineer"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time</label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                  <Input
                    type="number"
                    placeholder="60"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button onClick={handleCreateSchedule} disabled={loading} className="flex-1">
                  {loading ? "Creating..." : "Schedule Interview"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreate(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scheduled Interviews */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Upcoming Interviews</h2>
          {calendar?.schedules.length === 0 ? (
            <Card className="shadow-md">
              <CardContent className="pt-6 text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No interviews scheduled yet</p>
              </CardContent>
            </Card>
          ) : (
            calendar?.schedules.map((schedule) => (
              <Card key={schedule.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{schedule.title}</h3>
                      {schedule.company && (
                        <p className="text-gray-600 mb-3">
                          {schedule.company} • {schedule.role}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {new Date(schedule.scheduledDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock className="h-4 w-4" />
                          {schedule.estimatedDuration} minutes
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <TrendingUp className="h-4 w-4" />
                          {schedule.difficulty}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-blue-600 mb-2">
                        {calculateTimeUntilInterview(schedule.scheduledDate)}
                      </div>
                      <Button size="sm">Start Practice</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
