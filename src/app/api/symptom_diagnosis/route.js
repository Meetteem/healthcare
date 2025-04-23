import { NextResponse } from "next/server";
import axios from "axios";

// Google Gemini API Endpoint
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const API_KEY = "AIzaSyABd_BeaChO8GBwZVzaHi5Jrws_W2DXTyM";

export async function POST(req) {
  try {
    const { name, age, gender, weight, height, bloodGroup, allergies, medicalHistory, medication, symptoms } = await req.json();

    if (!symptoms) {
      return NextResponse.json({ status: "error", error: "Missing symptoms." }, { status: 400 });
    }

    // Construct AI prompt
    const aiPrompt = `
      Patient Information:
      - Name: ${name}
      - Age: ${age}
      - Gender: ${gender}
      - Weight: ${weight} kg
      - Height: ${height} cm
      - Blood Group: ${bloodGroup}
      - Allergies: ${allergies}
      - Medical History: ${medicalHistory}
      - Current Medication: ${medication}

      Reported Symptoms:
      - ${symptoms}

      Based on this information, suggest possible medical conditions, severity, and recommended next steps.
    `;

    // Make request to Gemini AI
    const response = await axios.post(`${GEMINI_API_URL}?key=${API_KEY}`, {
      contents: [{ parts: [{ text: aiPrompt }] }],
    }, { headers: { "Content-Type": "application/json" } });

    if (!response.data || !response.data.candidates || response.data.candidates.length === 0) {
      return NextResponse.json({ status: "error", error: "AI diagnosis failed." }, { status: 500 });
    }

    const aiDiagnosis = response.data.candidates[0].content.parts[0].text;

    return NextResponse.json({ status: "success", diagnosis: aiDiagnosis }, { status: 200 });

  } catch (error) {
    console.error("Error generating AI diagnosis:", error);
    return NextResponse.json({ status: "error", error: "Failed to generate diagnosis." }, { status: 500 });
  }
}
