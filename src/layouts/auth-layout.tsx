import { Outlet } from "react-router-dom";

const AuthenticationLayout = () => {
  return (
    <div className="w-screen h-screen overflow-hidden flex items-center justify-center relative bg-black">
      {/* Background Gradient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#017373]/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#AAD9D1]/10 blur-[120px] rounded-full"></div>
      
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthenticationLayout;
