"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";  // ✅ Import useRouter
import { AuthContext } from "@/context/AuthContext";
import { getContract } from "@/utils/contractUtils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function MyPatients() {
  const { walletAddress, user } = useContext(AuthContext);
  const router = useRouter(); // ✅ Initialize useRouter

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicalData, setMedicalData] = useState(null);
  const [fetchingMedicalData, setFetchingMedicalData] = useState(false);

  // Fetch appointments when the user is set
  useEffect(() => {
    if (walletAddress === undefined || user === undefined) return;
    if (!walletAddress) {
      router.push("/login"); // ✅ This will now work
    } else if (user?.role !== "doctor") {
      router.push("/"); // ✅ This will now work
    } else {
      fetchAppointments();
    }
  }, [walletAddress, user]);

  // Fetch all appointments for the doctor
  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const contractData = await getContract();
      if (!contractData) return;
      const { contract } = contractData;

      const appointmentsData = await contract.getAppointmentsForDoctor(walletAddress);
      setAppointments(appointmentsData);
    } catch (error) {
      setError("Failed to fetch appointments.");
      console.error(error);
    }
    setLoading(false);
  };

  // Fetch patient medical details
  const fetchPatientMedicalData = async (patientWallet) => {
    setFetchingMedicalData(true);
    setMedicalData(null);
    try {
      const contractData = await getContract();
      if (!contractData) return;
      const { contract } = contractData;

      const data = await contract.getMedicalRecord(patientWallet);
      if (data[0].toString() === "0" && data[1].toString() === "0") {
        setMedicalData(null); // No record exists
      } else {
        setMedicalData({
          weight: data[0].toString(),
          height: data[1].toString(),
          bloodGroup: data[2] || "Unknown",
          allergies: data[3] || "None",
          medicalHistory: data[4] || "No history",
          medication: data[5] || "None",
        });
      }
    } catch (error) {
      setError("Failed to fetch medical record.");
      console.error(error);
    }
    setFetchingMedicalData(false);
  };

  // Open modal and fetch patient details
  const viewPatientDetails = (patientWallet) => {
    setSelectedPatient(patientWallet);
    fetchPatientMedicalData(patientWallet);
  };

  // Close the modal
  const closeModal = () => {
    setSelectedPatient(null);
    setMedicalData(null);
  };

  // ✅ Function to Approve/Reject Appointments
  const handleUpdateStatus = async (index, status) => {
    setLoading(true);
    try {
      const contractData = await getContract();
      if (!contractData) return;
      const { contract } = contractData;

      const tx = await contract.updateAppointmentStatus(appointments[index].patient, index, status);
      await tx.wait();

      fetchAppointments(); // Refresh the list after updating
    } catch (error) {
      setError("Failed to update appointment.");
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 py-10 px-6">
      <h1 className="text-3xl font-bold text-center text-black mb-6">My Patients</h1>

      {loading ? (
        <p className="text-gray-600">Loading appointments...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : appointments.length === 0 ? (
        <p className="text-gray-600">No appointments available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {appointments.map((appt, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all cursor-pointer"
              onClick={() => viewPatientDetails(appt.patient)}
            >
              <h2 className="text-xl font-semibold text-black capitalize">
                Patient: {appt.patientName}
              </h2>
              <p className="text-gray-700"><strong>Date:</strong> {appt.date}</p>
              <p className="text-gray-700"><strong>Time:</strong> {appt.time}</p>
              <p className="text-gray-700"><strong>Reason:</strong> {appt.reason}</p>
              <p className="text-gray-700"><strong>Status:</strong> {appt.status}</p>

              {appt.status === "Pending" && (
                <div className="mt-4 flex space-x-3">
                  <Button
                    className="bg-green-600 text-white hover:bg-green-700 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateStatus(index, "Approved");
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    className="bg-red-600 text-white hover:bg-red-700 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateStatus(index, "Rejected");
                    }}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Patient Medical Details Modal */}
      {selectedPatient && (
        <Dialog open={true} onOpenChange={closeModal}>
          <DialogContent className="max-w-md p-6">
            <DialogTitle className="text-xl font-semibold text-black">Patient Medical Details</DialogTitle>
            {fetchingMedicalData ? (
              <p className="text-gray-600">Fetching medical details...</p>
            ) : medicalData ? (
              <div className="space-y-3">
                <p className="text-gray-700"><strong>Weight:</strong> {medicalData.weight} kg</p>
                <p className="text-gray-700"><strong>Height:</strong> {medicalData.height} cm</p>
                <p className="text-gray-700"><strong>Blood Group:</strong> {medicalData.bloodGroup}</p>
                <p className="text-gray-700"><strong>Allergies:</strong> {medicalData.allergies}</p>
                <p className="text-gray-700"><strong>Medical History:</strong> {medicalData.medicalHistory}</p>
                <p className="text-gray-700"><strong>Medication:</strong> {medicalData.medication}</p>
              </div>
            ) : (
              <p className="text-gray-500">No medical details found for this patient.</p>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
