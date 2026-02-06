import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyBZbDEMgVJP96NWqZnm84rH64TXJt1Evic";

export default function App() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    if (file) reader.readAsDataURL(file);
  };

  const analizarPlano = async () => {
    if (!image) return alert("Sube el plano primero.");
    setLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const base64Data = image.split(",")[1];
      const imagePart = { inlineData: { data: base64Data, mimeType: "image/jpeg" } };

      const prompt = "Analiza este plano. Devuelve SOLO un JSON con: blocks, cemento, arena_m3, varillas. Sin texto extra.";
      const res = await model.generateContent([prompt, imagePart]);
      const text = res.response.text().replace(/```json|```/g, "").trim();
      setResult(JSON.parse(text));
    } catch (e) {
      alert("Error de lectura. Intenta con una captura de pantalla más pequeña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#f00' }}>CUBIC AI PRO 🏗️</h1>
      <input type="file" onChange={handleFileUpload} />
      {image && <button onClick={analizarPlano} disabled={loading}>{loading ? "Calculando..." : "Generar Cálculo"}</button>}
      {result && (
        <div style={{ border: '1px solid #f00', marginTop: '20px', padding: '10px' }}>
          <p>Blocks: {result.blocks}</p>
          <p>Cemento: {result.cemento}</p>
          <p>Arena: {result.arena_m3}</p>
          <p>Varillas: {result.varillas}</p>
        </div>
      )}
    </div>
  );
}
