"use client";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getContract } from "@/utils/contractUtils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { walletAddress } = useContext(AuthContext);
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!walletAddress) {
      router.push("/login");
    } else {
      fetchUserData();
    }
  }, [walletAddress]);

  // Fetch user details from blockchain
  const fetchUserData = async () => {
    setLoading(true);
    setError("");
    const contractData = await getContract();
    if (!contractData) return;

    const { contract } = contractData;

    try {
      const data = await contract.getUser(walletAddress);
      if (!data || data[0] === "") {
        setError("No user record found for this wallet address.");
        setUserData(null);
      } else {
        setUserData({
          name: data[0],
          age: data[1].toString(),
          gender: data[2],
          role: data[3].charAt(0).toUpperCase() + data[3].slice(1), // Capitalize role
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to fetch user details.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="max-w-md bg-white p-6 rounded-xl shadow-lg w-full">
        {/* Profile Header */}
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold text-black">Profile</h1>
          <p className="text-gray-600 mt-1">Your account details</p>
        </div>

        {/* Wallet Address */}
        <div className="mt-4">
          <label className="text-gray-700 font-semibold">Wallet Address</label>
          <Input
            type="text"
            value={walletAddress || ""}
            readOnly
            className="w-full text-black bg-gray-200 cursor-not-allowed"
          />
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 mt-2 text-center">{error}</p>}

        {/* Loading Indicator */}
        {loading && <p className="text-gray-600 mt-2 text-center">Loading...</p>}

        {/* User Information */}
        {userData && (
          <div className="mt-6 space-y-3">
            <div className="p-4 bg-gray-50 rounded-md shadow-sm">
              <p className="text-black font-medium"><strong>Name:</strong> {userData.name}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-md shadow-sm">
              <p className="text-black font-medium"><strong>Age:</strong> {userData.age}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-md shadow-sm">
              <p className="text-black font-medium"><strong>Gender:</strong> {userData.gender}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-md shadow-sm">
              <p className="text-black font-medium"><strong>Role:</strong> {userData.role}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
