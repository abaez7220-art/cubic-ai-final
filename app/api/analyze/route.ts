import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY no esta configurada." },
      { status: 500 }
    );
  }

  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: "No se envio la imagen." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    // Remove the data URL prefix if present
    const base64Data = imageBase64.includes(",")
      ? imageBase64.split(",")[1]
      : imageBase64;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg",
      },
    };

    const prompt = `Actua como un ingeniero civil experto en calculo de materiales de construccion.
Analiza este plano o imagen de construccion cuidadosamente.

Identifica las dimensiones visibles (largo, ancho, alto de paredes, columnas, vigas, etc.)
y calcula la cantidad estimada de materiales necesarios.

Responde UNICAMENTE con un objeto JSON valido con esta estructura exacta:
{
  "area_m2": <numero>,
  "blocks": <numero entero>,
  "cemento": <numero entero de fundas>,
  "arena": <numero con decimales en m3>,
  "varillas": <numero entero>,
  "explicacion": "<texto breve en espanol explicando como calculaste>"
}

REGLAS:
- Solo numeros reales basados en lo que ves en el plano
- Si no puedes determinar un valor, usa 0
- La explicacion debe ser breve (2-3 oraciones)
- NO incluyas texto fuera del JSON`;

    const res = await model.generateContent([prompt, imagePart]);
    const responseText = res.response.text();

    // Robust JSON extraction
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // Try to extract JSON from markdown code blocks or surrounding text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        // Replace single quotes with double quotes as a fallback
        const cleaned = jsonMatch[0].replace(/'/g, '"');
        parsed = JSON.parse(cleaned);
      } else {
        throw new Error("No se pudo extraer JSON de la respuesta de Gemini.");
      }
    }

    // Ensure all fields exist with defaults
    const result = {
      area_m2: Number(parsed.area_m2) || 0,
      blocks: Number(parsed.blocks) || 0,
      cemento: Number(parsed.cemento) || 0,
      arena: Number(parsed.arena) || 0,
      varillas: Number(parsed.varillas) || 0,
      explicacion: parsed.explicacion || "Calculo basado en el analisis del plano.",
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error analyzing image:", error);
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: `Error al analizar: ${message}` },
      { status: 500 }
    );
  }
}
