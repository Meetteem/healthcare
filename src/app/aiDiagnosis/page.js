"use client";
import { useState } from "react";

export default function aiDiagnosis() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError("");
      setAnalysis(null);
      await handleUpload(selectedFile);
    }
  };

  const handleUpload = async (file) => {
    if (!file) {
      setError("Please select an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate_report", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === "success") {
        setAnalysis(data.analysis);
      } else {
        setError(data.error || "Analysis failed");
      }
    } catch (error) {
      setError("Failed to analyze image. Please try again.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">MediVision AI - Medical Report</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <label className="block font-medium text-gray-700 mb-2">Upload Medical Image</label>
            <div
              className="border-dashed border-2 border-gray-300 rounded-lg h-64 flex items-center justify-center cursor-pointer hover:bg-gray-50 relative"
              onClick={() => document.getElementById("fileUpload").click()}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-full max-w-full object-cover rounded-lg" />
              ) : (
                <span className="text-gray-500">Click to upload X-ray, MRI, or CT scan</span>
              )}
              <input
                id="fileUpload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            {loading && <p className="text-blue-500 mt-2 text-center">Generating Report...</p>}
          </div>

          <div>
            {error && <div className="p-4 bg-red-100 text-red-600 rounded-lg mb-4">{error}</div>}
            {analysis ? (
              <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Medical Report</h2>
                <p className="text-black"><strong>Diagnosis:</strong> {analysis.diagnosis}</p>
                <h3 className="text-lg font-semibold text-black mt-4">Observations:</h3>
                <ul className="list-disc ml-5 text-black">
                  {analysis.observations.map((obs, index) => (
                    <li key={index}>{obs}</li>
                  ))}
                </ul>
                <h3 className="text-lg font-semibold text-black mt-4">Potential Conditions:</h3>
                <p className="text-black">{analysis.potential_conditions.join(", ")}</p>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Upload an image to generate the medical report
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
