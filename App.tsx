import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. TU LLAVE API (Hardcoded como pediste para que funcione YA)
const API_KEY = "AIzaSyBZbDEMgVJP96NWqZnm84rH64TXJt1Evic";

export default function App() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // 2. Manejo de la imagen
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    if (file) reader.readAsDataURL(file);
  };

  // 3. LA FUNCIÓN MAESTRA
  const analizarPlano = async () => {
    if (!image) return alert("Sube un plano primero, líder.");

    setLoading(true);
    setResult(null);

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      // Usamos Flash 1.5 que es rápido y potente para imágenes
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Limpiamos el Base64 (quitamos el encabezado de data:image/...)
      const base64Data = image.split(",")[1];
      
      const imagePart = {
        inlineData: { data: base64Data, mimeType: "image/jpeg" },
      };

      // Prompt optimizado para construcción
      const prompt = "Analiza este plano. Calcula la cantidad de materiales necesarios (blocks de 6, sacos de cemento, arena en m3 y varillas). Devuelve SOLO un objeto JSON con esta estructura: { 'blocks': 0, 'cemento': 0, 'arena': 0, 'varillas': 0 }. No digas nada más.";

      const resultIA = await model.generateContent([prompt, imagePart]);
      const response = await resultIA.response;
      let text = response.text();

      // Limpieza de etiquetas Markdown que a veces pone la IA
      const jsonCleaned = text.replace(/```json|```/g, "").trim();
      const datos = JSON.parse(jsonCleaned);
      
      setResult(datos);

    } catch (error) {
      console.error("ERROR DE LECTURA:", error);
      alert("La IA no pudo leer la imagen. Intenta con una captura de pantalla más clara.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#0b0b0b', color: '#fff', minHeight: '100vh', textAlign: 'center', fontFamily: 'Arial' }}>
      <h1 style={{ color: '#ff4d4d', fontSize: '2.5rem' }}>CUBIC AI PRO 🏗️</h1>
      <p>Sube tu plano y deja que la IA haga el cómputo métrico.</p>

      <div style={{ border: '2px dashed #444', padding: '30px', borderRadius: '20px', maxWidth: '600px', margin: 'auto', backgroundColor: '#1a1a1a' }}>
        <input type="file" onChange={handleFileUpload} accept="image/*" style={{ marginBottom: '20px' }} />
        
        {image && (
          <div>
            <img src={image} style={{ width: '100%', borderRadius: '10px', marginBottom: '20px' }} alt="Plano" />
            <button 
              onClick={analizarPlano} 
              disabled={loading} 
              style={{ 
                width: '100%', padding: '15px', backgroundColor: loading ? '#555' : '#ff4d4d', 
                color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', 
                fontSize: '1.2rem', cursor: 'pointer', transition: '0.3s' 
              }}
            >
              {loading ? "ANALIZANDO OBRA..." : "GENERAR CÁLCULO"}
            </button>
          </div>
        )}
      </div>

      {result && (
        <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', maxWidth: '600px', margin: '30px auto' }}>
          <div style={cardStyle}><h3>Blocks</h3><p style={numStyle}>{result.blocks}</p></div>
          <div style={cardStyle}><h3>Cemento</h3><p style={numStyle}>{result.cemento} fundas</p></div>
          <div style={cardStyle}><h3>Arena</h3><p style={numStyle}>{result.arena} m³</p></div>
          <div style={cardStyle}><h3>Varillas</h3><p style={numStyle}>{result.varillas}</p></div>
        </div>
      )}
    </div>
  );
}

const cardStyle = { padding: '20px', backgroundColor: '#222', borderRadius: '15px', border: '1px solid #ff4d4d' };
const numStyle = { fontSize: '2rem', fontWeight: 'bold', color: '#ff4d4d', margin: '10px 0' };
