"use client";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getContract } from "@/utils/contractUtils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DoctorProfile() {
  const { walletAddress, user } = useContext(AuthContext);
  const router = useRouter();
  const [doctorData, setDoctorData] = useState({
    specialization: "",
    experience: "",
    degree: "",
    university: "",
    hospitalAffiliation: "",
    clinicName: "",
    clinicLocation: "",
    consultationFees: "",
    availability: "",
    contactNumber: "",
  });
  const [editMode, setEditMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Redirect if not authenticated or not a doctor
  useEffect(() => {
    if (!walletAddress) {
      router.push("/login");
    } else if (user?.role !== "doctor") {
      router.push("/");
    } else {
      fetchDoctorData();
    }
  }, [walletAddress, user]);

  // Fetch doctor details from blockchain using a single call
  const fetchDoctorData = async () => {
    setLoading(true);
    setError("");
    const contractData = await getContract();
    if (!contractData) return;
    const { contract } = contractData;

    try {
      const data = await contract.doctorProfiles(walletAddress);
      if (!data.exists) {
        setEditMode(true);
        setLoading(false);
        return;
      }

      setDoctorData({
        specialization: data.specialization || "",
        experience: data.experience.toString() || "",
        degree: data.degree || "",
        university: data.university || "",
        hospitalAffiliation: data.hospitalAffiliation || "",
        clinicName: data.clinicName || "",
        clinicLocation: data.clinicLocation || "",
        consultationFees: data.consultationFees.toString() || "",
        availability: data.availability || "",
        contactNumber: data.contactNumber || "",
      });

      setEditMode(false);
    } catch (error) {
      console.error("Error fetching doctor profile:", error);
      setError("Failed to fetch profile.");
    }
    setLoading(false);
  };

  // Handle input changes
  const handleChange = (e) => {
    setDoctorData({ ...doctorData, [e.target.name]: e.target.value });
  };

  // Submit doctor details
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const contractData = await getContract();
    if (!contractData) return;
    const { contract } = contractData;

    try {
      const tx = await contract.updateDoctorProfile(
        doctorData.specialization,
        parseInt(doctorData.experience),
        doctorData.degree,
        doctorData.university,
        doctorData.hospitalAffiliation,
        doctorData.clinicName,
        doctorData.clinicLocation,
        parseInt(doctorData.consultationFees),
        doctorData.availability,
        doctorData.contactNumber
      );
      await tx.wait();
      setSuccess("Profile updated successfully!");
      setEditMode(false);
      fetchDoctorData();
    } catch (error) {
      console.error("Error updating doctor profile:", error);
      setError("Failed to update profile.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-r from-blue-100 to-indigo-200 py-10 px-6">
      <div className="max-w-lg bg-white p-8 rounded-2xl shadow-lg w-full">
        <h1 className="text-3xl font-bold text-center text-black">Doctor Profile</h1>
        <p className="text-gray-600 text-center mb-6">Manage your professional details</p>

        {/* Wallet Address (Read-Only) */}
        <div className="mb-4 text-center">
          <p className="text-gray-700 font-medium">Wallet Address</p>
          <p className="text-sm bg-gray-200 text-black p-2 rounded-md break-all">{walletAddress || "N/A"}</p>
        </div>

        {/* Error or Success Messages */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}

        {editMode ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {Object.keys(doctorData).map((key) => (
              <div key={key}>
                <label className="text-gray-700 font-medium capitalize">{key.replace(/([A-Z])/g, " $1")}</label>
                <Input
                  type={["experience", "consultationFees"].includes(key) ? "number" : "text"}
                  name={key}
                  value={doctorData[key] || ""}
                  onChange={handleChange}
                  placeholder={key.replace(/([A-Z])/g, " $1")}
                  required
                  className="mt-1"
                />
              </div>
            ))}
            <Button type="submit" className="w-full bg-blue-600 text-white mt-4" disabled={loading}>
              {loading ? "Saving..." : "Save Details"}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            {Object.entries(doctorData).map(([key, value]) => (
              <div key={key} className="p-3 bg-gray-50 rounded-md shadow-sm">
                <p className="text-black font-semibold capitalize">{key.replace(/([A-Z])/g, " $1")}:</p>
                <p className="text-gray-800">{value}</p>
              </div>
            ))}
            <Button onClick={() => setEditMode(true)} className="w-full bg-blue-600 text-white mt-4">
              Edit Profile
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
