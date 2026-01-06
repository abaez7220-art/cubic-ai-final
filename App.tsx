import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

// LLAVE DE ACCESO
const API_KEY = "AIzaSyBr7px50ZywMy3wnRxu5TfVunLkRVD9aMg";
const genAI = new GoogleGenerativeAI(API_KEY);

export default function App() {
  const [resultado, setResultado] = useState<string>("");
  const [cargando, setCargando] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const analizarImagen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setCargando(true);
    setResultado("");

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = "Actúa como un ingeniero civil experto. Analiza este plano de construcción y genera un presupuesto detallado que incluya: 1. Área total estimada en m2. 2. Cantidad de bloques de 6 u 8 pulgadas. 3. Cantidad de fundas de cemento. 4. Cantidad de varillas. 5. Metros cúbicos de arena y grava. Responde de forma clara y profesional en español.";

        const result = await model.generateContent([
          prompt,
          { inlineData: { data: base64Data, mimeType: file.type } }
        ]);
        
        setResultado(result.response.text());
        setCargando(false);
      };
    } catch (err) {
      console.error(err);
      setResultado("Error técnico: No se pudo conectar con el motor de IA.");
      setCargando(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#0a0a0a', 
      color: '#fff', 
      minHeight: '100vh', 
      fontFamily: 'system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#ff4d4d', fontSize: '3rem', margin: '0' }}>CUBIC AI</h1>
        <p style={{ color: '#888' }}>SISTEMA DE CUBICACIÓN INTELIGENTE</p>
      </header>

      <div style={{ 
        width: '100%', 
        maxWidth: '800px', 
        background: '#1a1a1a', 
        padding: '30px', 
        borderRadius: '20px',
        border: '1px solid #333'
      }}>
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <input 
            type="file" 
            accept="image/*" 
            onChange={analizarImagen} 
            style={{ 
              padding: '15px', 
              background: '#333', 
              borderRadius: '10px', 
              color: '#fff',
              cursor: 'pointer'
            }} 
          />
        </div>

        {preview && (
          <img src={preview} alt="Plano" style={{ width: '100%', borderRadius: '10px', marginBottom: '20px' }} />
        )}

        {cargando && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#4da6ff' }}>
            <p style={{ fontWeight: 'bold', animation: 'pulse 1.5s infinite' }}>⚙️ PROCESANDO PLANO CON INTELIGENCIA ARTIFICIAL...</p>
          </div>
        )}

        {resultado && (
          <div style={{ 
            background: '#000', 
            padding: '25px', 
            borderRadius: '10px', 
            borderLeft: '5px solid #ff4d4d',
            lineHeight: '1.6'
          }}>
            <h2 style={{ marginTop: '0', color: '#ff4d4d' }}>Memoria de Cálculo:</h2>
            <div style={{ whiteSpace: 'pre-wrap', fontSize: '1rem' }}>{resultado}</div>
          </div>
        )}
      </div>

      <footer style={{ marginTop: '50px', color: '#444', fontSize: '0.8rem' }}>
        POWERED BY GEMINI PRO VISION // CUBIC AI v4.0
      </footer>
    </div>
  );
}
