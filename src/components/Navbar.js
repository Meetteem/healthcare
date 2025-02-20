"use client";
import { useContext } from "react";
import Link from "next/link";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { walletAddress, user, login, logout } = useContext(AuthContext);

  // Generate a DiceBear avatar based on wallet address
  const avatarUrl = `https://api.dicebear.com/8.x/identicon/svg?seed=${walletAddress}`;

  return (
    <nav className="bg-white shadow-md w-full p-4 flex justify-between items-center sticky top-0 z-50">
      {/* Logo */}
      <Link href="/" className="text-xl font-bold text-black cursor-pointer">
        HealthChain
      </Link>

      {/* Navigation Links Based on Role */}
      <div className="flex space-x-6">
        <Link href="/"><Button variant="outline">Home</Button></Link>

        {user?.role === "patient" ? (
          <>
            <Link href="/patientDetails"><Button variant="outline">My Details</Button></Link>
            <Link href="/searchDoctors"><Button variant="outline">Search Docs</Button></Link>
            <Link href="/aiDiagnosis"><Button variant="outline">AI Diagnosis</Button></Link>
          </>
        ) : user?.role === "doctor" ? (
          <>
            <Link href="/myPatients"><Button variant="outline">My Patient List</Button></Link>
            <Link href="/doctorProfile"><Button variant="outline">My Profile</Button></Link>
            <Link href="/aiDiagnosis"><Button variant="outline">AI Diagnosis</Button></Link>
          </>
        ) : null}
      </div>

      {/* Profile & Auth Buttons */}
      <div className="flex items-center space-x-4">
        {walletAddress && (
          <Link href="/profile" className="flex items-center space-x-2">
            <img
              src={avatarUrl}
              alt="User Avatar"
              className="w-9 h-9 rounded-full border border-gray-300"
            />
            <span className="text-black font-medium hidden md:block">Profile</span>
          </Link>
        )}

        {walletAddress ? (
          <Button onClick={logout} className="bg-red-500 text-white">Logout</Button>
        ) : (
          <Button onClick={login} className="bg-blue-500 text-white">Login with MetaMask</Button>
        )}
      </div>
    </nav>
  );
}
