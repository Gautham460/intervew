import { db } from "@/config/firebase.config";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const initializeAdminCode = async () => {
  try {
    const docRef = doc(db, "admin_codes", "admin1");
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      await setDoc(docRef, {
        code: "123456",
        updatedAt: new Date()
      });
      console.log("Admin secret code initialized successfully.");
    }
  } catch (error) {
    console.error("Error initializing admin code:", error);
  }
};
