"use client";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { getContract } from "@/utils/contractUtils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export default function DoctorList() {
  const { walletAddress } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentData, setAppointmentData] = useState({ date: "", time: "", reason: "" });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Filters
  const [selectedSpecialization, setSelectedSpecialization] = useState("all");
  const [selectedExperience, setSelectedExperience] = useState("all");

  // Fetch doctors on load
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    setError("");

    try {
      const contractData = await getContract();
      if (!contractData) return;
      const { contract } = contractData;

      const doctorAddresses = await contract.getAllDoctors();
      const doctorDetails = await Promise.all(
        doctorAddresses.map(async (address) => {
          const data = await contract.doctorProfiles(address);
          if (!data.exists) return null;
          return {
            wallet: address,
            specialization: data.specialization || "Not Provided",
            experience: data.experience ? parseInt(data.experience) : 0,
            degree: data.degree || "Not Provided",
            university: data.university || "Not Provided",
            clinicName: data.clinicName || "Not Provided",
            clinicLocation: data.clinicLocation || "Not Provided",
            consultationFees: data.consultationFees ? `$${data.consultationFees}` : "N/A",
            availability: data.availability || "Not Provided",
          };
        })
      );

      const validDoctors = doctorDetails.filter(Boolean);
      setDoctors(validDoctors);
      setFilteredDoctors(validDoctors);
    } catch (err) {
      setError("Failed to fetch doctors.");
      console.error(err);
    }

    setLoading(false);
  };

  // Handle filters
  useEffect(() => {
    let filtered = doctors;

    if (selectedSpecialization !== "all") {
      filtered = filtered.filter((doc) =>
        doc.specialization.toLowerCase().includes(selectedSpecialization.toLowerCase())
      );
    }

    if (selectedExperience !== "all") {
      filtered = filtered.filter((doc) => {
        const exp = doc.experience;
        if (selectedExperience === "1-5" && exp >= 1 && exp <= 5) return true;
        if (selectedExperience === "6-10" && exp >= 6 && exp <= 10) return true;
        if (selectedExperience === "10+" && exp > 10) return true;
        return false;
      });
    }

    setFilteredDoctors(filtered);
  }, [selectedSpecialization, selectedExperience, doctors]);

  // Handle appointment booking
  const handleBookAppointment = async () => {
    if (!selectedDoctor) return;
    setBookingLoading(true);
    setSuccessMessage("");

    try {
      const contractData = await getContract();
      if (!contractData) return;
      const { contract } = contractData;

      const tx = await contract.bookAppointment(
        selectedDoctor.wallet,
        appointmentData.date,
        appointmentData.time,
        appointmentData.reason
      );
      await tx.wait();

      setSuccessMessage("Appointment booked successfully!");
      setAppointmentData({ date: "", time: "", reason: "" });
      setSelectedDoctor(null);
    } catch (error) {
      setError("Failed to book appointment.");
      console.error(error);
    }
    setBookingLoading(false);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold text-center mb-4">Available Doctors</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select onValueChange={setSelectedSpecialization} value={selectedSpecialization}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select Specialization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specializations</SelectItem>
            <SelectItem value="Cardiologist">Cardiologist</SelectItem>
            <SelectItem value="Dermatologist">Dermatologist</SelectItem>
            <SelectItem value="Pediatrician">Pediatrician</SelectItem>
            <SelectItem value="Pediatrician">Dentist</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={setSelectedExperience} value={selectedExperience}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select Experience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Experience Levels</SelectItem>
            <SelectItem value="1-5">1-5 Years</SelectItem>
            <SelectItem value="6-10">6-10 Years</SelectItem>
            <SelectItem value="10+">10+ Years</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filteredDoctors.length === 0 ? (
        <p>No doctors found.</p>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.wallet} className="p-4 bg-white shadow rounded">
              <h2 className="text-xl font-bold">{doctor.specialization}</h2>
              <p><strong>Experience:</strong> {doctor.experience} years</p>
              <p><strong>Clinic:</strong> {doctor.clinicName}, {doctor.clinicLocation}</p>
              <p><strong>Fees:</strong> {doctor.consultationFees}</p>
              <Button onClick={() => setSelectedDoctor(doctor)}>Book Appointment</Button>
            </div>
          ))}
        </div>
      )}

      {selectedDoctor && (
        <Dialog open={true} onOpenChange={() => setSelectedDoctor(null)}>
          <DialogContent>
            <DialogTitle>Book Appointment with {selectedDoctor.specialization}</DialogTitle>
            <Input type="date" name="date" onChange={(e) => setAppointmentData({ ...appointmentData, date: e.target.value })} />
            <Input type="time" name="time" onChange={(e) => setAppointmentData({ ...appointmentData, time: e.target.value })} />
            <Input type="text" name="reason" placeholder="Reason" onChange={(e) => setAppointmentData({ ...appointmentData, reason: e.target.value })} />
            <Button onClick={handleBookAppointment} disabled={bookingLoading}>Confirm</Button>
            {successMessage && <p>{successMessage}</p>}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
