import { SignUp } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";

export const SignUpPage = () => {
  return <SignUp 
    path="/signup" 
    appearance={{
      baseTheme: dark,
      variables: {
        colorPrimary: "#017373",
      }
    }}
  />;
};
