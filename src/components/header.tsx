import { cn } from "@/lib/utils";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Container } from "./container";
import { LogoContainer } from "./logo-container";
import { NavigationRoutes } from "./navigation-routes";
import { NavLink, useLocation } from "react-router-dom";
import { ProfileContainer } from "./profile-container";
import { ToggleContainer } from "./toggle-container";
import { ProtectedRoutes } from "@/lib/helpers";

const Header = () => {
  const { userId } = useAuth();
  const { user } = useUser();
  const location = useLocation();
  const isAdmin = user?.publicMetadata.role === "admin" || sessionStorage.getItem("admin_preauth") === "true";
  const isInsideAdminPortal = location.pathname.startsWith("/enterprise") || 
                              location.pathname.startsWith("/setup") || 
                              (location.pathname.startsWith("/analytics") && location.search.includes("u="));

  return (
    <header className="w-full border-b duration-150 transition-all ease-in-out bg-[rgba(1,115,115,1)] text-white">
      <Container>
        <div className="flex items-center gap-4 w-full">
          {/* logo section */}
          <LogoContainer />

          {/* navigation section */}
          <nav className="hidden md:flex items-center gap-3">
            {isAdmin && isInsideAdminPortal ? (
              <div className="flex items-center gap-3">
                <NavLink
                  to="/enterprise"
                  className={({ isActive }) =>
                    cn(
                      "text-sm font-medium text-white/70 hover:text-white transition-colors px-3 py-1.5 rounded-lg",
                      isActive && "text-white bg-white/10 shadow-sm"
                    )
                  }
                >
                  <span>🏢 Enterprise Portal</span>
                </NavLink>
                <NavLink
                  to="/setup"
                  className={({ isActive }) =>
                    cn(
                      "text-sm font-medium text-white/70 hover:text-white transition-colors px-3 py-1.5 rounded-lg",
                      isActive && "text-white bg-white/10 shadow-sm"
                    )
                  }
                >
                  <span>⚙️ System Setup</span>
                </NavLink>
              </div>
            ) : (
              <>
                <NavigationRoutes />
                {userId && (
                  <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/20">
                    {ProtectedRoutes.map((route) => (
                      <NavLink
                        key={route.href}
                        to={route.href}
                        className={({ isActive }) =>
                          cn(
                            "text-sm font-medium text-white/70 hover:text-white transition-colors px-2 py-1 rounded",
                            isActive && "text-white bg-white/10"
                          )
                        }
                        title={route.label}
                      >
                        <span>{route.icon} {route.label}</span>
                      </NavLink>
                    ))}
                    
                    {/* If Admin is testing candidate features, provide a way back to Enterprise Portal */}
                    {isAdmin && (
                      <NavLink
                        to="/enterprise"
                        className={({ isActive }) =>
                          cn(
                            "text-sm font-medium text-white/70 hover:text-white transition-colors px-2 py-1 rounded ml-2 border border-white/20 bg-white/5",
                            isActive && "text-white bg-white/10"
                          )
                        }
                        title="Return to Enterprise Portal"
                      >
                        <span>🏢 Return to Admin</span>
                      </NavLink>
                    )}
                  </div>
                )}
              </>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-6 ">
            {/* profile section */}
            <ProfileContainer />

            {/* mobile toggle section */}
            <ToggleContainer />
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header;
