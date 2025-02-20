"use client";
import { useContext, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Login() {
  const { login, walletAddress, user } = useContext(AuthContext);
  const router = useRouter();

  // If already logged in, redirect to home OR register
  useEffect(() => {
    if (walletAddress) {
      if (!user) {
        router.push("/register"); // Redirect new users to registration
      } else {
        router.push("/");
      }
    }
  }, [walletAddress, user]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-black mb-4">Login to HealthChain</h1>
      <Button onClick={login} className="bg-blue-500 text-white w-80">
        Login with MetaMask
      </Button>
    </div>
  );
}
