import { 
  Building2, 
  User as UserIcon, 
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Lock,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { db } from "@/config/firebase.config";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";

import { useAuth } from "@clerk/clerk-react";

export default function SelectRolePage() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [secretCode, setSecretCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSelect = (role: "candidate" | "enterprise") => {
    if (role === "enterprise") {
      setIsModalOpen(true);
    } else {
      if (isSignedIn) {
        navigate("/generate");
      } else {
        navigate("/signin", { state: { role } });
      }
    }
  };

  const verifyCode = async () => {
    if (!secretCode) {
      toast.error("Please enter the secret code.");
      return;
    }

    setIsVerifying(true);
    try {
      const docRef = doc(db, "admin_codes", "admin1");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().code === secretCode) {
        toast.success("Verification successful!");
        sessionStorage.setItem("admin_preauth", "true");
        setIsModalOpen(false);
        
        if (isSignedIn) {
          navigate("/enterprise");
        } else {
          navigate("/signin", { state: { role: "enterprise" } });
        }
      } else {
        toast.error("Invalid secret code. Please try again.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Connection error. Please try again later.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] w-full max-w-[800px] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex flex-col items-center gap-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white tracking-tight">Welcome to Intervue</h1>
          <p className="text-slate-400 text-lg">Please select your role to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Candidate Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect("candidate")}
            className="group cursor-pointer p-8 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl hover:border-emerald-500/50 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles size={80} className="text-emerald-400" />
            </div>
            <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
              <UserIcon size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Candidate</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Practice mock interviews, get AI feedback, and improve your technical skills.
              </p>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-medium mt-2">
              Sign In <ArrowRight size={16} />
            </div>
          </motion.div>

          {/* Enterprise Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect("enterprise")}
            className="group cursor-pointer p-8 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl hover:border-blue-500/50 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck size={80} className="text-blue-400" />
            </div>
            <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <Building2 size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                Enterprise <Lock size={18} className="text-slate-500" />
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Manage candidates, analyze team performance, and set up interview workflows.
              </p>
            </div>
            <div className="flex items-center gap-2 text-blue-400 font-medium mt-2">
              Admin Portal <ArrowRight size={16} />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Secret Code Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="text-blue-400" size={20} />
              Enterprise Verification
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Please enter the administrator secret code to access the Enterprise Portal.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="code"
                type="password"
                placeholder="Enter 6-digit code"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && verifyCode()}
                className="bg-slate-800 border-slate-700 text-white focus:ring-blue-500/50 h-12 text-center text-2xl tracking-widest font-mono"
                maxLength={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={verifyCode}
              disabled={isVerifying}
              className="w-full bg-blue-600 hover:bg-blue-700 h-11"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify and Continue"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
