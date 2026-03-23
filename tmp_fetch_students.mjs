
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import * as dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const fetchStudents = async () => {
  const interviewSnap = await getDocs(collection(db, "interviews"));
  const proctorSnap = await getDocs(collection(db, "proctor_sessions"));
  const companySnap = await getDocs(collection(db, "companyQuestionAttempts"));
  const feedbackSnap = await getDocs(collection(db, "userAnswers"));

  const students = new Map();

  const processDoc = (doc, source) => {
    const d = doc.data();
    if (!d.userId) return;
    if (!students.has(d.userId)) {
      students.set(d.userId, {
        id: d.userId,
        activities: [],
        totalScore: 0,
        scoreCount: 0
      });
    }
    const student = students.get(d.userId);
    student.activities.push({
      source,
      date: d.createdAt?.toDate?.()?.toLocaleDateString() || "N/A",
      type: d.position || d.category || source
    });
  };

  interviewSnap.forEach(d => processDoc(d, "Mock Interview"));
  proctorSnap.forEach(d => processDoc(d, "Proctored Exam"));
  companySnap.forEach(d => processDoc(d, "Company Practice"));
  
  feedbackSnap.forEach(d => {
      const data = d.data();
      if(students.has(data.userId)) {
          const s = students.get(data.userId);
          s.totalScore += data.rating;
          s.scoreCount++;
      }
  });

  console.log("# ENTERPRISE STUDENT DATA REPORT\n");
  console.log(`Total Students Found: ${students.size}\n`);
  
  students.forEach((s, id) => {
    const avg = s.scoreCount > 0 ? (s.totalScore / s.scoreCount).toFixed(1) : "N/A";
    console.log(`## Student: ${id}`);
    console.log(`- **Avg Score**: ${avg}/10`);
    console.log(`- **Recent Activity**:`);
    s.activities.slice(0, 5).forEach(a => {
      console.log(`  - [${a.date}] ${a.source} (${a.type})`);
    });
    console.log();
  });
};

fetchStudents().catch(console.error);
