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
    if (!image) return alert("Por favor, sube un plano primero.");
    
    // 1. Solución al problema de la API Key:
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      alert("Error: No se encontró la VITE_GEMINI_API_KEY en Vercel.");
      return;
    }

    setLoading(true);
    try {
      // 2. Solución al error 404: Hablamos directo con Google, NO con /api/analyze
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const base64Data = image.split(",")[1];
      const imagePart = {
        inlineData: { data: base64Data, mimeType: "image/jpeg" },
      };

      const prompt = "Analiza este plano de construcción. Devuelve un JSON con: materiales (blocks, cemento, arena_m3, varillas).";

      const resultIA = await model.generateContent([prompt, imagePart]);
      const response = await resultIA.response;
      const text = response.text().replace(/```json|```/g, "").trim();
      
      setResult(JSON.parse(text));
    } catch (error) {
      console.error("Error detallado:", error);
      alert("Hubo un problema con la IA. Revisa la consola (F12).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#000', color: '#fff', minHeight: '100vh', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#ff4d4d' }}>CUBIC AI PRO 🏗️</h1>
      <div style={{ border: '2px solid #333', padding: '20px', borderRadius: '15px', maxWidth: '500px', margin: 'auto' }}>
        <input type="file" onChange={handleFileUpload} accept="image/*" style={{ marginBottom: '20px' }} />
        {image && (
          <div>
            <img src={image} style={{ width: '100%', borderRadius: '10px' }} alt="Plano" />
            <button 
              onClick={analizarPlano} 
              disabled={loading} 
              style={{ width: '100%', padding: '15px', marginTop: '20px', backgroundColor: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {loading ? "CALCULANDO CON IA..." : "GENERAR CÁLCULO"}
            </button>
          </div>
        )}
      </div>

      {result && (
        <div style={{ marginTop: '30px', textAlign: 'left', maxWidth: '500px', margin: '20px auto', padding: '20px', backgroundColor: '#111', borderRadius: '10px', border: '1px solid #ff4d4d' }}>
          <h3 style={{ color: '#ff4d4d' }}>Cómputo Métrico Estimado:</h3>
          <p><strong>Blocks:</strong> {result.materiales?.blocks || 'N/A'}</p>
          <p><strong>Cemento:</strong> {result.materiales?.cemento || 'N/A'} fundas</p>
          <p><strong>Arena:</strong> {result.materiales?.arena_m3 || 'N/A'} m3</p>
          <p><strong>Varillas:</strong> {result.materiales?.varillas || 'N/A'}</p>
        </div>
      )}
    </div>
  );
}
