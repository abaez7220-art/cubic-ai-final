import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const analizarPlano = async () => {
    if (!image) return alert("Sube el plano primero.");
    
    // Usamos la llave que pusiste en Vercel
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return alert("Error: No se encontró la llave en Vercel");

    setLoading(true);
    setResult(null);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const base64Data = image.split(",")[1];
      const imagePart = {
        inlineData: { data: base64Data, mimeType: "image/jpeg" },
      };

      const prompt = "Analiza este plano de construcción. Calcula materiales: blocks, cemento, arena y varillas. Responde solo en JSON.";

      const resultIA = await model.generateContent([prompt, imagePart]);
      const text = resultIA.response.text().replace(/```json|```/g, "").trim();
      setResult(JSON.parse(text));
    } catch (error) {
      console.error(error);
      alert("La IA no pudo leer el plano. Intenta con otra foto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#000', color: '#fff', minHeight: '100vh', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#ff4d4d' }}>CUBIC AI PRO 🏗️</h1>
      <div style={{ border: '1px solid #333', padding: '20px', borderRadius: '15px', maxWidth: '500px', margin: 'auto' }}>
        <input type="file" onChange={handleFileUpload} accept="image/*" />
        {image && (
          <div>
            <img src={image} style={{ width: '100%', marginTop: '20px', borderRadius: '10px' }} />
            <button onClick={analizarPlano} disabled={loading} style={{ width: '100%', padding: '15px', marginTop: '20px', backgroundColor: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' }}>
              {loading ? "CALCULANDO..." : "GENERAR CÁLCULO"}
            </button>
          </div>
        )}
      </div>
      {result && (
        <div style={{ marginTop: '20px', textAlign: 'left', maxWidth: '500px', margin: '20px auto', padding: '20px', backgroundColor: '#111', borderRadius: '10px' }}>
          <h3>Resultados:</h3>
          <p>Blocks: {result.materiales?.blocks || result.materiales?.block}</p>
          <p>Cemento: {result.materiales?.cemento} fundas</p>
          <p>Arena: {result.materiales?.arena_m3} m3</p>
          <p>Varillas: {result.materiales?.varillas}</p>
        </div>
      )}
    </div>
  );
}
