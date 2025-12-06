import { GoogleGenAI } from "@google/genai";
import { Airport } from "../types";

const SYSTEM_INSTRUCTION = `
You are a friendly, calm airline captain on a "Lo-Fi Focus Flight". 
Your tone should be soothing, encouraging, and very brief. 
You are speaking to a passenger who is about to start a focus session (working or studying).
Avoid formal airline jargon; focus on the "healing" and "relaxing" vibe.
Language: Traditional Chinese (繁體中文).
`;

export const generateCaptainAnnouncement = async (destination: Airport, durationMinutes: number): Promise<string> => {
  if (!process.env.API_KEY) {
    return `歡迎搭乘前往 ${destination.city} 的航班。接下來 ${durationMinutes} 分鐘，請享受這段專注旅程。`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      We are flying from Taipei (TPE) to ${destination.city} (${destination.code}).
      The flight duration is ${durationMinutes} minutes.
      Write a very short (max 2 sentences) welcome announcement in Traditional Chinese (繁體中文).
      Mention the destination in a dreamy way. 
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        maxOutputTokens: 100,
        temperature: 0.7,
      }
    });

    return response.text || `歡迎搭乘前往 ${destination.city} 的航班。祝您擁有高效率的 ${durationMinutes} 分鐘。`;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `歡迎搭乘前往 ${destination.city} 的航班。接下來 ${durationMinutes} 分鐘，請享受這段專注旅程。`;
  }
};