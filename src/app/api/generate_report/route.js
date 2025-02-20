import { NextResponse } from "next/server";
import axios from "axios";

// Google Gemini API Endpoint and API Key
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const API_KEY = "AIzaSyC3dp77y-3aTST9RJTuqZKtLHAAWvr052M";

// AI Prompt for structured analysis
const ANALYSIS_PROMPT = `
You are a medical imaging expert. Analyze this medical image (X-ray, MRI, or CT scan) and provide:
1. A clear diagnosis if any abnormalities are present
2. Detailed observations of any visible issues
3. Potential medical conditions suggested by the findings
4. Areas that require further investigation

Format your response in valid JSON without markdown or code blocks:
{
    "diagnosis": "Brief primary diagnosis",
    "observations": ["List of detailed observations"],
    "potential_conditions": ["List of possible conditions"],
    "areas_of_concern": ["Specific areas needing attention"]
}
`;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ status: "error", error: "No file uploaded." }, { status: 400 });
    }

    // Convert image to Base64 format
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    // Validate base64 encoding
    if (!base64Image || base64Image.length < 100) {
      return NextResponse.json({ status: "error", error: "Invalid image encoding." }, { status: 400 });
    }

    // Correct request structure for Gemini API
    const requestBody = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: file.type || "image/png", // Ensure MIME type is correct
                data: base64Image
              }
            },
            {
              text: ANALYSIS_PROMPT // Use predefined AI prompt for structured response
            }
          ]
        }
      ]
    };

    console.log("Sending request to Gemini API...");

    // Send request to Gemini API
    const response = await axios.post(`${GEMINI_API_URL}?key=${API_KEY}`, requestBody, {
      headers: { "Content-Type": "application/json" }
    });

    console.log("Gemini API raw response:", response.data);

    if (!response.data || !response.data.candidates || response.data.candidates.length === 0) {
      return NextResponse.json({ status: "error", error: "AI analysis failed." }, { status: 500 });
    }

    let aiAnalysisText = response.data.candidates[0].content.parts[0].text;

    // 🔹 Remove Markdown code block syntax (```json and ```)
    aiAnalysisText = aiAnalysisText.replace(/```json|```/g, "").trim();

    // 🔹 Parse AI response as JSON
    let aiAnalysis;
    try {
      aiAnalysis = JSON.parse(aiAnalysisText);
    } catch (error) {
      console.error("Error parsing AI response:", error, "Response Text:", aiAnalysisText);
      return NextResponse.json({ status: "error", error: "Invalid AI response format." }, { status: 500 });
    }

    return NextResponse.json({ status: "success", analysis: aiAnalysis }, { status: 200 });
  } catch (error) {
    console.error("Error analyzing image:", error.response?.data || error.message);
    return NextResponse.json({ status: "error", error: "Failed to analyze image." }, { status: 500 });
  }
}
