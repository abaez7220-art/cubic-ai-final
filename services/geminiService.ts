import { GoogleGenerativeAI } from "@google/generative-ai";

// LLAVE MAESTRA - NO TOCAR
const apiKey = 'AIzaSyBhTj1e7uEGTPUY4xWLZVD-9G1-kfklBfY';
const genAI = new GoogleGenerativeAI(apiKey);

// Forzamos que la web detecte la llave en el navegador
if (typeof window !== 'undefined') {
  (window as any).VITE_GEMINI_API_KEY = apiKey;
}

export async function analyzeEngineeringImage(base64Image: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `Actúa como ingeniero civil. Analiza este plano y calcula estos valores exactos en formato JSON:
    area_m2 (número), blocks_count (número), rods_count (número), cement_bags (número), 
    gravel_m3 (número), sand_m3 (número), explanation (texto en español).`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image.split(',')[1] || base64Image,
          mimeType: "image/jpeg"
        }
      }
    ]);

    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Error al analizar la imagen.");
  }
}
