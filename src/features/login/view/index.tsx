import React from "react";
import { LoginForm } from "../components/LoginForm";
import { cookies } from "next/headers";
import { decrypt } from "@/utils/jsencrypt.server";

export default async function LoginView() {
  const cookieStore = await cookies();
  const username = cookieStore.get("username")?.value;
  const password = cookieStore.get("password")?.value;
  const passwordEncrypted = cookieStore.get("passwordEncrypted")?.value;
  const rememberMe = cookieStore.get("rememberMe")?.value === "true";
  let initialPassword: string | undefined;
  if (rememberMe && password) {
    if (passwordEncrypted === "true") {
      const decrypted = decrypt(password);
      initialPassword = typeof decrypted === "string" ? decrypted : undefined;
    } else if (passwordEncrypted === "false") {
      initialPassword = password;
    } else {
      const decrypted = decrypt(password);
      initialPassword = typeof decrypted === "string" ? decrypted : password;
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: "url('/login-background1.jpg')",
      }}
    >
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-center h-full">
        {/* Left side placeholder - hidden on small screens, similar to original Vue code */}
        <div className="hidden lg:block lg:w-2/3 h-full">
          {/* Placeholder content if needed */}
        </div>

        {/* Right side login form */}
        <div className="w-full lg:w-1/3">
          <LoginForm
            initialUsername={username}
            initialRememberMe={rememberMe}
            initialPassword={initialPassword}
          />
        </div>
      </div>

      <div className="absolute bottom-4 w-full text-center text-gray-400 text-xs tracking-wider">
        <span>Copyright © 2024 Digital Innovation All Rights Reserved.</span>
      </div>
    </div>
  );
}
