"use client";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { getContract } from "@/utils/contractUtils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function SymptomChecker() {
  const { walletAddress, user } = useContext(AuthContext);
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const [error, setError] = useState("");
  const [patientDetails, setPatientDetails] = useState(null);

  // Fetch patient details from blockchain
  useEffect(() => {
    if (walletAddress) {
      fetchPatientDetails();
    }
  }, [walletAddress]);

  const fetchPatientDetails = async () => {
    try {
      const contractData = await getContract();
      if (!contractData) {
        setError("Failed to connect to blockchain.");
        return;
      }
      const { contract } = contractData;

      // Fetch user basic info
      const userData = await contract.getUser(walletAddress);
      if (!userData) {
        setError("User details not found.");
        return;
      }
      const [name, age, gender, role] = userData;

      if (role !== "patient") {
        setError("Only patients can use this feature.");
        return;
      }

      // Fetch medical history
      const medicalData = await contract.getMedicalRecord(walletAddress);
      if (!medicalData) {
        setError("Medical record not found.");
        return;
      }
      const [weight, height, bloodGroup, allergies, medicalHistory, medication] = medicalData;

      setPatientDetails({
        name,
        age: age.toString(),
        gender,
        weight: weight.toString(),
        height: height.toString(),
        bloodGroup,
        allergies,
        medicalHistory,
        medication,
      });
    } catch (error) {
      console.error("Error fetching patient details:", error);
      setError("Failed to fetch patient details.");
    }
  };

  const fetchDiagnosis = async () => {
    if (!symptoms.trim()) {
      setError("Please enter your symptoms.");
      return;
    }
    if (!walletAddress) {
      setError("Please connect your wallet.");
      return;
    }
    if (!patientDetails) {
      setError("Patient details are missing.");
      return;
    }

    setLoading(true);
    setError("");
    setDiagnosis(null);

    try {
      const response = await fetch("/api/symptom_diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...patientDetails, symptoms }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === "success") {
        setDiagnosis(data.diagnosis);
      } else {
        setError(data.error || "AI diagnosis failed.");
      }
    } catch (err) {
      console.error("Error fetching AI response:", err);
      setError("Failed to generate diagnosis. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-200 to-teal-300 p-6">
      <div className="max-w-lg bg-white p-8 rounded-2xl shadow-lg w-full">
        <h1 className="text-2xl font-bold text-black text-center">AI Symptom Checker</h1>
        <p className="text-gray-600 text-center mb-6">
          Enter your symptoms and let AI suggest possible conditions.
        </p>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <Textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Describe your symptoms..."
          className="w-full text-black mb-4"
          rows={4}
        />

        <Button onClick={fetchDiagnosis} className="w-full bg-blue-600 text-white" disabled={loading}>
          {loading ? "Analyzing..." : "Get Diagnosis"}
        </Button>

        {/* Diagnosis Display */}
        {diagnosis && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-black mb-2">AI Diagnosis</h2>
            <p className="text-gray-800 whitespace-pre-line">{diagnosis}</p>
          </div>
        )}
      </div>
    </div>
  );
}
