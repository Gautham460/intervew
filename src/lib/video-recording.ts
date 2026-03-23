export interface VideoRecordingData {
  id: string;
  userId: string;
  questionId: string;
  videoUrl: string;
  duration: number;
  quality: "low" | "medium" | "high";
  fileSize: number;
  confidence: number;
  emotions: string[];
  eyeContact: number;
  pacingScore: number;
  clarityScore: number;
  createdAt: Date;
  transcription?: string;
}

export interface RecordingStats {
  totalRecordings: number;
  avgDuration: number;
  avgConfidence: number;
  improvementTrend: number;
}

let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];
let stream: MediaStream | null = null;

export async function startVideoRecording(): Promise<void> {
  try {
    recordedChunks = [];
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: true,
    });

    mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp8,opus",
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.start();
  } catch (error) {
    console.error("Error starting video recording:", error);
    throw error;
  }
}

export async function stopVideoRecording(): Promise<Blob | null> {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder) {
      reject(new Error("No recording in progress"));
      return;
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      stopStream();
      resolve(blob);
    };

    mediaRecorder.onerror = (error) => {
      stopStream();
      reject(error);
    };

    mediaRecorder.stop();
  });
}

export function stopStream(): void {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }
}

export async function analyzeVideoPerformance(_videoUrl: string): Promise<Partial<VideoRecordingData>> {
  try {
    // Simulate video analysis (in production, use ML model)
    const analysis = {
      confidence: Math.random() * 40 + 60,
      emotions: ["neutral", "confident", "calm"],
      eyeContact: Math.random() * 30 + 60,
      pacingScore: Math.random() * 35 + 60,
      clarityScore: Math.random() * 30 + 65,
    };
    return analysis;
  } catch (error) {
    console.error("Error analyzing video:", error);
    return {};
  }
}

export function calculateRecordingStats(recordings: VideoRecordingData[]): RecordingStats {
  if (recordings.length === 0) {
    return {
      totalRecordings: 0,
      avgDuration: 0,
      avgConfidence: 0,
      improvementTrend: 0,
    };
  }

  const avgDuration =
    recordings.reduce((sum, r) => sum + r.duration, 0) / recordings.length;
  const avgConfidence =
    recordings.reduce((sum, r) => sum + r.confidence, 0) / recordings.length;

  const improvementTrend =
    recordings.length >= 2
      ? recordings[recordings.length - 1].confidence -
        recordings[recordings.length - 2].confidence
      : 0;

  return {
    totalRecordings: recordings.length,
    avgDuration: Math.round(avgDuration),
    avgConfidence: Math.round(avgConfidence),
    improvementTrend: Math.round(improvementTrend * 10) / 10,
  };
}

export async function uploadVideoToStorage(blob: Blob): Promise<string> {
  try {
    // In production, upload to Firebase Storage
    const url = URL.createObjectURL(blob);
    return url;
  } catch (error) {
    console.error("Error uploading video:", error);
    throw error;
  }
}
