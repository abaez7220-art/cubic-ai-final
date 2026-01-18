import React, { useState } from 'react';

// Definimos qué datos esperamos para que el código no se rompa
interface CalculationResult {
  areas: { nombre: string; m2: number }[];
  materiales: {
    blocks: number;
    cemento: number;
    arena_m3: number;
    varillas: number;
  };
  nota: string;
}

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);

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
    setLoading(true);
    setResult(null);

    // INSTRUCCIÓN ULTRA-ESTRICTA
    const promptPersona = "Eres un calculador de materiales. Analiza este plano. RESPONDE SOLO JSON. No hables. Formato: {\"areas\": [], \"materiales\": {\"blocks\": 0, \"cemento\": 0, \"arena_m3\": 0, \"varillas\": 0}, \"nota\": \"\"}";

    try {
      // Sustituye 'TU_URL' por tu endpoint real de la API
      const response = await fetch('/api/analyze', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, prompt: promptPersona }),
      });

      const data = await response.json();
      const rawContent = data.choices[0].message.content;

      // --- FILTRO ANT-ERRORES ---
      const start = rawContent.indexOf('{');
      const end = rawContent.lastIndexOf('}');
      if (start === -1) throw new Error("No JSON found");
      
      const cleanJson = rawContent.substring(start, end + 1);
      setResult(JSON.parse(cleanJson));

    } catch (error) {
      console.error(error);
      alert("La IA mandó un formato raro. ¡Intenta subirlo una vez más!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: 'auto', fontFamily: 'sans-serif', backgroundColor: '#0f0
