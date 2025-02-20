"use client";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getContract } from "@/utils/contractUtils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Register() {
  const { walletAddress } = useContext(AuthContext);
  const router = useRouter();
  const [userData, setUserData] = useState({
    name: "",
    age: "",
    gender: "Male",
    role: "patient",
  });

  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [error, setError] = useState("");

  // **🚀 Check if user is already registered before rendering the form**
  useEffect(() => {
    if (!walletAddress) {
      router.push("/login");
    } else {
      checkIfRegistered();
    }
  }, [walletAddress]);

  // **Function to check user registration status with `await`**
  const checkIfRegistered = async () => {
    setCheckingStatus(true);
    try {
      const contractData = await getContract();
      if (!contractData) {
        setCheckingStatus(false);
        return;
      }

      const { contract } = contractData;
      const data = await contract.getUser(walletAddress);

      console.log("Fetched User Data from Blockchain:", data);

      // **🚀 Ensure proper checking of user existence**
      if (data && data[0] !== "" && data[0] !== undefined) {
        console.log("User is already registered! Redirecting...");
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Small delay to ensure state updates
        router.replace("/"); // ✅ Redirect to home if user exists
      } else {
        console.log("User not registered, showing registration form.");
        setCheckingStatus(false); // ✅ Show the form if not registered
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setCheckingStatus(false); // ✅ If user doesn't exist, allow them to register
    }
  };

  // **Handle form input changes**
  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  // **Register new user**
  const handleRegister = async () => {
    setLoading(true);
    setError("");

    try {
      const contractData = await getContract();
      if (!contractData) return;

      const { contract } = contractData;
      const tx = await contract.registerUser(userData.name, parseInt(userData.age), userData.gender, userData.role);
      await tx.wait();

      console.log("User successfully registered!");

      // **🚀 Ensure the blockchain updates before checking again**
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Give blockchain time to update
      await checkIfRegistered(); // Check again after registration
    } catch (error) {
      console.error("Error registering user:", error);
      setError("Registration failed. Please try again.");
    }

    setLoading(false);
  };

  // **🚀 FIX: Show loading while checking registration status**
  if (checkingStatus) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
        <p className="text-gray-600 text-center">Checking registration status...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="max-w-md bg-white p-6 rounded-xl shadow-lg w-full">
        <h1 className="text-3xl font-bold text-black text-center">User Registration</h1>
        <p className="text-gray-600 text-center mb-4">Create your account</p>

        {/* Wallet Address (Read-Only) */}
        <div className="mb-4">
          <label className="text-gray-700 font-semibold">Wallet Address</label>
          <Input type="text" value={walletAddress || ""} readOnly className="w-full text-black bg-gray-200 cursor-not-allowed" />
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Registration Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} className="space-y-4">
          <Input type="text" name="name" value={userData.name} onChange={handleChange} placeholder="Full Name" required />
          <Input type="number" name="age" value={userData.age} onChange={handleChange} placeholder="Age" required />

          <select name="gender" value={userData.gender} onChange={handleChange} className="w-full p-2 border rounded text-black">
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <select name="role" value={userData.role} onChange={handleChange} className="w-full p-2 border rounded text-black">
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>

          <Button type="submit" className="w-full bg-blue-600 text-white" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>
      </div>
    </div>
  );
}
