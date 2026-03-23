import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Building2, Settings2 } from "lucide-react";
import { NavigationRoutes } from "./navigation-routes";
import { useAuth, useUser } from "@clerk/clerk-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const ToggleContainer = () => {
  const { userId } = useAuth();
  const { user } = useUser();
  const location = useLocation();
  const isAdmin = user?.publicMetadata.role === "admin" || sessionStorage.getItem("admin_preauth") === "true";
  const isInsideAdminPortal = (location.pathname.startsWith("/enterprise") || 
                              location.pathname.startsWith("/setup") || 
                              (location.pathname.startsWith("/analytics") && location.search.includes("u="))) ||
                              (isAdmin && location.pathname !== "/" && location.pathname !== "/select-role");
  return (
    <Sheet>
      <SheetTrigger className="block md:hidden">
        <Menu />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-left text-blue-600 font-bold">Intervue Portal</SheetTitle>
        </SheetHeader>

        <nav className="gap-4 flex flex-col items-start mt-8">
          {isAdmin && isInsideAdminPortal ? (
            <>
              <NavLink
                to="/enterprise"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium transition-colors",
                    isActive ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "text-slate-600 hover:bg-slate-50"
                  )
                }
              >
                <Building2 className="w-5 h-5" /> Enterprise Dashboard
              </NavLink>
              <NavLink
                to="/setup"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium transition-colors",
                    isActive ? "bg-purple-600 text-white shadow-md shadow-purple-100" : "text-slate-600 hover:bg-slate-50"
                  )
                }
              >
                <Settings2 className="w-5 h-5" /> Admin Configuration
              </NavLink>
            </>
          ) : (
            <>
              <NavigationRoutes isMobile />
              {userId && (
                <NavLink
                  to={"/generate"}
                  className={({ isActive }) =>
                    cn(
                      "text-base text-neutral-600 ",
                      isActive && "text-neutral-900 font-semibold"
                    )
                  }
                >
                  Take An Interview
                </NavLink>
              )}
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
};
