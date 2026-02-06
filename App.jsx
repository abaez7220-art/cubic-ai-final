import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

// USANDO TU LLAVE DIRECTAMENTE
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

      const prompt = "Analiza este plano. Calcula la cantidad de: blocks, fundas de cemento, arena m3 y varillas. Devuelve SOLO un JSON asi: {'blocks':0, 'cemento':0, 'arena':0, 'varillas':0}";
      
      const res = await model.generateContent([prompt, imagePart]);
      const text = res.response.text().replace(/```json|```/g, "").trim();
      setResult(JSON.parse(text));
    } catch (e) {
      console.error(e);
      alert("Error de lectura. ¡Prueba con una captura de pantalla del plano!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#ff4d4d' }}>CUBIC AI PRO 🏗️</h1>
      <input type="file" onChange={handleFileUpload} style={{ margin: '20px 0' }} />
      
      {image && (
        <div>
          <img src={image} style={{ width: '300px', borderRadius: '10px' }} />
          <br />
          <button onClick={analizarPlano} disabled={loading} style={{ padding: '15px 30px', backgroundColor: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px' }}>
            {loading ? "CALCULANDO..." : "GENERAR CÁLCULO"}
          </button>
        </div>
      )}

      {result && (
        <div style={{ marginTop: '30px', border: '2px solid #ff4d4d', padding: '20px', display: 'inline-block' }}>
          <p>🧱 Blocks: {result.blocks}</p>
          <p>🥡 Cemento: {result.cemento} fundas</p>
          <p>⏳ Arena: {result.arena} m3</p>
          <p>🧵 Varillas: {result.varillas}</p>
        </div>
      )}
    </div>
  );
}
