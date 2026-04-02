import { SignIn } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export const SignInPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role as "candidate" | "enterprise" | undefined;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6"
    >
      <div className="w-full flex justify-start">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/select-role")}
          className="text-slate-400 hover:text-white hover:bg-slate-800 gap-2 mb-4"
        >
          <ChevronLeft size={18} /> Back to selection
        </Button>
      </div>

      <div className="relative">
        {role === "enterprise" && (
          <div className="absolute -top-12 left-0 right-0 text-center">
            <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30 px-3 py-1">
              Enterprise Portal
            </Badge>
          </div>
        )}
        <SignIn 
          routing="path"
          path="/signin" 
          forceRedirectUrl={role === "enterprise" ? "/enterprise" : "/generate"}
          signUpUrl="/signup"
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: role === "enterprise" ? "#3b82f6" : "#017373",
            },
            elements: {
              card: "bg-slate-900/60 backdrop-blur-xl border border-slate-800 shadow-2xl",
              headerTitle: "text-white",
              headerSubtitle: "text-slate-400",
              socialButtonsBlockButton: "bg-slate-800 border-slate-700 text-white hover:bg-slate-700",
              formFieldLabel: "text-slate-300",
              formFieldInput: "bg-slate-800 border-slate-700 text-white focus:ring-emerald-500/50",
              footerActionText: "text-slate-400",
              footerActionLink: role === "enterprise" ? "text-blue-400 hover:text-blue-300" : "text-emerald-400 hover:text-emerald-300"
            }
          }}
        />
      </div>
    </motion.div>
  );
};
