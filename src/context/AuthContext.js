"use client";
import { createContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getContract } from "@/utils/contractUtils";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [walletAddress, setWalletAddress] = useState("");
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Fetch user details & role after login
  useEffect(() => {
    const fetchUserData = async () => {
      const storedWallet = localStorage.getItem("walletAddress");
      if (storedWallet) {
        setWalletAddress(storedWallet);
        await checkUserExists(storedWallet);
      } else {
        router.push("/login"); // Redirect to login if no wallet is stored
      }
    };

    fetchUserData();
  }, []);

  // Check if user exists in blockchain
  const checkUserExists = async (wallet) => {
    const contractData = await getContract();
    if (!contractData) return;

    const { contract } = contractData;
    try {
      const userData = await contract.getUser(wallet);
      setUser({
        name: userData[0],
        age: userData[1],
        gender: userData[2],
        role: userData[3],
      });
    } catch (error) {
      console.log("User not found, redirecting to registration...");
      router.push("/register"); // Redirect new users to registration page
    }
  };

  // Login function
  const login = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setWalletAddress(accounts[0]);
        localStorage.setItem("walletAddress", accounts[0]);
        await checkUserExists(accounts[0]);
      } catch (error) {
        console.error("Error logging in with MetaMask:", error);
      }
    } else {
      alert("MetaMask is not installed. Please install it.");
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("walletAddress");
    setWalletAddress("");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ walletAddress, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
