import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY);

export async function analizarConGemini(base64Image: string, prompt: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",  // o gemini-1.5-pro si tienes acceso
    generationConfig: {
      responseMimeType: "application/json",  // ← fuerza JSON (Gemini 1.5+)
      temperature: 0.2,
    },
  });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: base64Image.split(';')[0].split(':')[1] || "image/jpeg",
        data: base64Image.split(',')[1],
      },
    },
    { text: prompt },
  ]);

  const responseText = result.response.text();  // o candidates[0].content.parts[0].text
  return responseText;
}
