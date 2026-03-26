import { LoaderPage } from "@/routes/loader-page";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectRoutes = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const location = useLocation();

  if (!isLoaded) {
    return <LoaderPage />;
  }

  if (!isSignedIn) {
    return <Navigate to={"/signin"} replace />;
  }

  // Redirect admin users to enterprise dashboard if they land on the root dashboard page
  // Only redirect if they haven't explicitly chosen to be a candidate this session
  const isAdmin = user?.publicMetadata.role === "admin" || sessionStorage.getItem("admin_preauth") === "true";
  const explicitRole = sessionStorage.getItem("current_session_role");
  
  if (isAdmin && explicitRole !== "candidate" && location.pathname === "/") {
    return <Navigate to="/enterprise" replace />;
  }

  return children;
};

export default ProtectRoutes;
