"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedWallet = localStorage.getItem("walletAddress");
    if (storedWallet) {
      setWalletAddress(storedWallet);
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300">
      {/* Navbar */}

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
        <h1 className="text-5xl md:text-6xl font-extrabold text-blue-800 leading-tight">
          Welcome to <span className="text-blue-600">HealthChain</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-800 mt-4 max-w-2xl">
          Revolutionizing healthcare with **secure, transparent**, and **efficient** blockchain-powered solutions.
        </p>

        {/* Background Decorative Circles */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-blue-400 opacity-30 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-600 opacity-30 rounded-full blur-2xl"></div>
        <div className="absolute top-40 right-32 w-16 h-16 bg-blue-300 opacity-20 rounded-full blur-2xl"></div>
      </div>

      {/* Feature Highlights */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center py-16 px-6">
        <div className="bg-white shadow-lg rounded-xl p-6 transform transition-all hover:scale-105">
          <h3 className="text-xl font-bold text-blue-700">🔗 Blockchain Security</h3>
          <p className="text-gray-600 mt-2">Protect medical records with **decentralized encryption**.</p>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-6 transform transition-all hover:scale-105">
          <h3 className="text-xl font-bold text-blue-700">🩺 Find Verified Doctors</h3>
          <p className="text-gray-600 mt-2">Book **appointments** seamlessly with expert doctors.</p>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-6 transform transition-all hover:scale-105">
          <h3 className="text-xl font-bold text-blue-700">📜 Immutable Records</h3>
          <p className="text-gray-600 mt-2">Keep medical histories **secure, tamper-proof, and portable**.</p>
        </div>
      </div>
    </div>
  );
}
