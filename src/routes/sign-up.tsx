import { SignUp } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";

export const SignUpPage = () => {
  return <SignUp 
    routing="path"
    path="/signup" 
    signInUrl="/signin"
    forceRedirectUrl="/generate"
    appearance={{
      baseTheme: dark,
      variables: {
        colorPrimary: "#017373",
      }
    }}
  />;
};
