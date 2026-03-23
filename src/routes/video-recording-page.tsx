import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, PlayCircle, Pause, StopCircle } from "lucide-react";
import {
  startVideoRecording,
  stopVideoRecording,
  analyzeVideoPerformance,
  calculateRecordingStats,
  type VideoRecordingData,
} from "@/lib/video-recording";

export default function VideoRecordingPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordings, setRecordings] = useState<VideoRecordingData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleStartRecording = async () => {
    try {
      setError(null);
      await startVideoRecording();
      setIsRecording(true);
      setRecordingTime(0);

      // Timer
      const interval = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);

      return () => clearInterval(interval);
    } catch (err) {
      setError("Failed to access camera/microphone. Please check permissions.");
      console.error(err);
    }
  };

  const handleStopRecording = async () => {
    try {
      const blob = await stopVideoRecording();
      if (blob) {
        const recording: VideoRecordingData = {
          id: Date.now().toString(),
          userId: "current-user",
          questionId: "current-question",
          videoUrl: URL.createObjectURL(blob),
          duration: recordingTime,
          quality: "high",
          fileSize: blob.size,
          confidence: 75,
          emotions: ["confident", "calm"],
          eyeContact: 82,
          pacingScore: 78,
          clarityScore: 85,
          createdAt: new Date(),
        };

        const analysis = await analyzeVideoPerformance(recording.videoUrl);
        const fullRecording = { ...recording, ...analysis };
        setRecordings([...recordings, fullRecording]);
      }
      setIsRecording(false);
      setIsPaused(false);
    } catch (err) {
      setError("Failed to stop recording");
      console.error(err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const stats = calculateRecordingStats(recordings);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Video Recording Practice</h1>
          <p className="text-gray-600">Record and analyze your video answers with AI feedback</p>
        </div>

        {/* Video Recorder */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle>Record Your Answer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {error && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              {/* Sample Question */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="font-semibold mb-2">Question:</p>
                <p className="text-gray-700">
                  Tell us about a time when you had to handle a difficult situation with a colleague. How did you resolve it?
                </p>
              </div>

              {/* Recording Area */}
              <div className="bg-black rounded-lg aspect-video flex items-center justify-center overflow-hidden">
                <div className="text-center">
                  {isRecording ? (
                    <div className="text-white">
                      <div className="text-5xl font-bold mb-4 animate-pulse text-red-500">
                        {formatTime(recordingTime)}
                      </div>
                      <p className="text-lg">Recording in progress...</p>
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <p>Click "Start Recording" to begin</p>
                      <p className="text-sm mt-2">(Camera will show here)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-3 justify-center pt-4">
                <Button
                  onClick={handleStartRecording}
                  disabled={isRecording}
                  className="flex items-center gap-2"
                  size="lg"
                >
                  <PlayCircle className="h-5 w-5" />
                  Start Recording
                </Button>
                <Button
                  onClick={() => setIsPaused(!isPaused)}
                  disabled={!isRecording}
                  variant="outline"
                  className="flex items-center gap-2"
                  size="lg"
                >
                  <Pause className="h-5 w-5" />
                  {isPaused ? "Resume" : "Pause"}
                </Button>
                <Button
                  onClick={handleStopRecording}
                  disabled={!isRecording}
                  variant="destructive"
                  className="flex items-center gap-2"
                  size="lg"
                >
                  <StopCircle className="h-5 w-5" />
                  Stop & Analyze
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recording Stats */}
        {recordings.length > 0 && (
          <Card className="mb-6 shadow-lg">
            <CardHeader>
              <CardTitle>Your Recording Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalRecordings}</div>
                  <div className="text-sm text-gray-600">Total Recordings</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.avgDuration}s</div>
                  <div className="text-sm text-gray-600">Avg Duration</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stats.avgConfidence}%</div>
                  <div className="text-sm text-gray-600">Avg Confidence</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{stats.improvementTrend > 0 ? "+" : ""}{stats.improvementTrend}%</div>
                  <div className="text-sm text-gray-600">Improvement Trend</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recordings History */}
        {recordings.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Your Recordings</h2>
            {recordings.map((recording) => (
              <Card key={recording.id} className="shadow-md">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="text-lg font-semibold">{formatTime(recording.duration)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Confidence</p>
                      <p className="text-lg font-semibold text-blue-600">{Math.round(recording.confidence)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Eye Contact</p>
                      <p className="text-lg font-semibold text-green-600">{Math.round(recording.eyeContact)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pacing</p>
                      <p className="text-lg font-semibold text-purple-600">{Math.round(recording.pacingScore)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Clarity</p>
                      <p className="text-lg font-semibold text-orange-600">{Math.round(recording.clarityScore)}%</p>
                    </div>
                    <div className="flex items-end">
                      <Button variant="outline" size="sm" className="w-full">
                        Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
