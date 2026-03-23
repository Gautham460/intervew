import { useUser } from "@clerk/clerk-react";
import { Navigate, useLocation } from "react-router-dom";
import { LoaderPage } from "@/routes/loader-page";
import { toast } from "sonner";
import { useEffect } from "react";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded, user } = useUser();
  const location = useLocation();

  // Also check session storage for temporary pre-auth from the secret code flow
  const isPreAuth = sessionStorage.getItem("admin_preauth") === "true";

  useEffect(() => {
    if (isLoaded && user && user.publicMetadata.role !== "admin" && !isPreAuth) {
      toast.error("Access Denied: Admin privileges required.");
    }
  }, [isLoaded, user, isPreAuth]);

  if (!isLoaded) {
    return <LoaderPage />;
  }

  const isAdmin = user?.publicMetadata.role === "admin" || isPreAuth;

  if (!isAdmin) {
    return <Navigate to="/select-role" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
