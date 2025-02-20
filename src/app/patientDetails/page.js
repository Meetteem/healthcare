"use client";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getContract } from "@/utils/contractUtils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function PatientDetails() {
  const { walletAddress, user } = useContext(AuthContext);
  const router = useRouter();
  const [medicalData, setMedicalData] = useState({
    weight: "",
    height: "",
    bloodGroup: "",
    allergies: "",
    medicalHistory: "",
    medication: "",
  });
  const [editMode, setEditMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Redirect if not authenticated or not a patient
  useEffect(() => {
    if (!walletAddress) {
      router.push("/login");
    } else if (user?.role !== "patient") {
      router.push("/");
    } else {
      fetchMedicalData();
    }
  }, [walletAddress, user]);

  // Fetch medical details from blockchain
  const fetchMedicalData = async () => {
    setLoading(true);
    setError("");
    const contractData = await getContract();
    if (!contractData) return;

    const { contract } = contractData;

    try {
      const data = await contract.getMedicalRecord(walletAddress);
      if (data[0].toString() === "0" && data[1].toString() === "0") {
        setMedicalData(null); // No record exists
      } else {
        setMedicalData({
          weight: data[0].toString(),
          height: data[1].toString(),
          bloodGroup: data[2] || "Unknown",
          allergies: data[3],
          medicalHistory: data[4],
          medication: data[5],
        });
        setEditMode(false);
      }
    } catch (error) {
      console.error("Error fetching medical record:", error);
      setError("No medical record found. Please enter your details.");
    }
    setLoading(false);
  };

  // Handle input changes
  const handleChange = (e) => {
    setMedicalData({ ...medicalData, [e.target.name]: e.target.value });
  };

  // Submit updated details
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const contractData = await getContract();
    if (!contractData) return;

    const { contract } = contractData;

    try {
      const tx = await contract.updateMedicalRecord(
        parseInt(medicalData.weight),
        parseInt(medicalData.height),
        medicalData.bloodGroup,
        medicalData.allergies,
        medicalData.medicalHistory,
        medicalData.medication
      );
      await tx.wait();
      setSuccess("Medical details updated successfully!");
      setEditMode(false);
      fetchMedicalData(); // Refresh details
    } catch (error) {
      console.error("Error updating medical record:", error);
      setError("Failed to update medical details.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-teal-200 to-cyan-300 p-6">
      <div className="max-w-lg bg-white p-8 rounded-2xl shadow-lg w-full">
        <h1 className="text-3xl font-bold text-black text-center">Medical Details</h1>
        <p className="text-gray-600 text-center mb-6">Manage your health data securely</p>

        {/* Wallet Address (Read-Only) */}
        <div className="mb-4 text-center">
          <p className="text-gray-700 font-medium">Wallet Address</p>
          <p className="text-sm bg-gray-200 text-black p-2 rounded-md break-all">{walletAddress || "N/A"}</p>
        </div>

        {/* Error or Success Messages */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}

        {/* If data exists, show details & Edit button */}
        {!editMode ? (
          <div className="space-y-4">
            {Object.entries(medicalData).map(([key, value]) => (
              <div key={key} className="p-3 bg-gray-50 rounded-md shadow-sm">
                <p className="text-black font-semibold capitalize">{key.replace(/([A-Z])/g, " $1")}:</p>
                <p className="text-gray-800">{value}</p>
              </div>
            ))}
            <Button onClick={() => setEditMode(true)} className="w-full bg-blue-600 text-white mt-4">
              Edit Details
            </Button>
          </div>
        ) : (
          // If no data, show form
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-700 font-semibold">Weight (kg)</label>
              <Input
                type="number"
                name="weight"
                value={medicalData?.weight || ""}
                onChange={handleChange}
                className="w-full text-black"
                required
              />
            </div>

            <div>
              <label className="text-gray-700 font-semibold">Height (cm)</label>
              <Input
                type="number"
                name="height"
                value={medicalData?.height || ""}
                onChange={handleChange}
                className="w-full text-black"
                required
              />
            </div>

            <div>
              <label className="text-gray-700 font-semibold">Blood Group</label>
              <Input
                type="text"
                name="bloodGroup"
                value={medicalData?.bloodGroup || ""}
                onChange={handleChange}
                className="w-full text-black"
                required
              />
            </div>

            <div>
              <label className="text-gray-700 font-semibold">Allergies</label>
              <Input
                type="text"
                name="allergies"
                value={medicalData?.allergies || ""}
                onChange={handleChange}
                className="w-full text-black"
                required
              />
            </div>

            <div>
              <label className="text-gray-700 font-semibold">Medical History</label>
              <Input
                type="text"
                name="medicalHistory"
                value={medicalData?.medicalHistory || ""}
                onChange={handleChange}
                className="w-full text-black"
                required
              />
            </div>

            <div>
              <label className="text-gray-700 font-semibold">Medication</label>
              <Input
                type="text"
                name="medication"
                value={medicalData?.medication || ""}
                onChange={handleChange}
                className="w-full text-black"
                required
              />
            </div>

            <Button type="submit" className="w-full bg-blue-600 text-white mt-4" disabled={loading}>
              {loading ? "Saving..." : "Save Details"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
