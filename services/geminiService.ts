import { GoogleGenAI, Type } from "@google/genai";
import { MaterialEstimate } from "../types";

// Usamos un modelo estable compatible con la versión gratuita
const MODEL_NAME = 'gemini-1.5-flash';

export async function analyzeEngineeringImage(base64Image: string): Promise<MaterialEstimate> {
  // CORRECCIÓN: Usamos import.meta.env y el nombre exacto que pusiste en Netlify
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  const ai = new GoogleGenAI(apiKey);
  
  const prompt = `
    Actúa como un ingeniero civil experto en presupuestos de obra.
    Analiza esta imagen de ingeniería (plano, croquis o sitio de obra).
    Calcula los siguientes valores basándote en la información visual:
    1. Área total estimada en metros cuadrados (m2).
    2. Cantidad de bloques de concreto estándar necesarios.
    3. Cantidad de varillas de acero (estándar 3/8 o 1/2) necesarias.
    4. Cantidad de bultos de cemento (50kg) necesarios.
    5. Grava (m3) y Arena (m3) necesaria.

    Proporciona una explicación detallada del razonamiento detrás de los cálculos.
    Todo el contenido debe estar en español.
  `;

  try {
    const model = ai.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            area_m2: { type: Type.NUMBER, description: "Área total en metros cuadrados" },
            blocks_count: { type: Type.NUMBER, description: "Número de bloques de concreto" },
            rods_count: { type: Type.NUMBER, description: "Número de varillas de acero" },
            cement_bags: { type: Type.NUMBER, description: "Número de sacos de cemento de 50kg" },
            gravel_m3: { type: Type.NUMBER, description: "Metros cúbicos de grava" },
            sand_m3: { type: Type.NUMBER, description: "Metros cúbicos de arena" },
            explanation: { type: Type.STRING, description: "Explicación técnica detallada de los cálculos" },
          },
          required: ["area_m2", "blocks_count", "rods_count", "cement_bags", "gravel_m3", "sand_m3", "explanation"],
        },
      },
    });

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image.split(',')[1] || base64Image,
        },
      },
    ]);

    const responseText = result.response.text();
    return JSON.parse(responseText) as MaterialEstimate;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Error al analizar la imagen. Asegúrate de que la imagen sea clara y contenga información de ingeniería.");
  }
}
