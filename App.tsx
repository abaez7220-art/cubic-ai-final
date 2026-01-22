import React, { useState } from 'react';

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
    const promptPersona = "Eres un calculador de materiales experto. Analiza este plano y responde UNICAMENTE con un objeto JSON. No hables. Formato: {\"areas\": [], \"materiales\": {\"blocks\": 0, \"cemento\": 0, \"arena_m3\": 0, \"varillas\": 0}, \"nota\": \"\"}";

    try {
      console.log("Enviando imagen a /api/analyze..."); // Debug: para ver si llega aquí
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, prompt: promptPersona }),
      });

      if (!response.ok) {
        throw new Error(`Error en API: ${response.status}`);
      }

      const data = await response.json();
      console.log("Respuesta cruda de API:", data); // Debug: ve qué llega

      let rawContent = data.choices[0].message.content;
      // Limpieza mejorada de JSON
      rawContent = rawContent.replace(/```json|```/g, "").trim();
      const start = rawContent.indexOf('{');
      const end = rawContent.lastIndexOf('}');

      if (start === -1 || end === -1) {
        throw new Error("No se encontró JSON válido en la respuesta");
      }

      const cleanJson = rawContent.substring(start, end + 1);
      const parsedResult = JSON.parse(cleanJson);
      setResult(parsedResult);
    } catch (error) {
      console.error("Error completo:", error);
      alert("Error de lectura. ¡Intenta subirlo de nuevo! Revisa la consola para detalles.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#000', color: '#fff', fontFamily: 'sans-serif', textAlign: 'center' }}>
      {/* TÍTULO Y DESCRIPCIÓN */}
      <div style={{ marginBottom: '40px', marginTop: '20px' }}>
        <h1 style={{ color: '#ff4d4d', fontSize: '2rem', margin: '0' }}>CUBIC AI PRO 🏗️</h1>
        <p style={{ color: '#888', fontSize: '0.9rem' }}>Identifica dimensiones y calcula materiales de obra gris automáticamente.</p>
      </div>
      {/* ÁREA DE CARGA */}
      <div style={{ maxWidth: '500px', margin: 'auto', padding: '30px', border: '1px solid #333', borderRadius: '20px', backgroundColor: '#0a0a0a' }}>
        <input type="file" onChange={handleFileUpload} accept="image/*" style={{ marginBottom: '20px', color: '#888' }} />
        
        {image && (
          <div>
            <img src={image} alt="Plano" style={{ width: '100%', borderRadius: '10px', marginBottom: '20px' }} />
            <button
              onClick={analizarPlano}
              disabled={loading}
              style={{ width: '100%', padding: '15px', backgroundColor: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {loading ? "PROCESANDO OBRA..." : "GENERAR CÁLCULO"}
            </button>
          </div>
        )}
      </div>
      {/* RESULTADOS */}
      {result && (
        <div style={{ maxWidth: '500px', margin: '30px auto', padding: '20px', backgroundColor: '#111', borderRadius: '15px', textAlign: 'left', border: '1px solid #222' }}>
          <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>Resultados Estimados:</h3>
          <p>• Blocks de 6": <strong>{result.materiales.blocks}</strong></p>
          <p>• Cemento: <strong>{result.materiales.cemento} fundas</strong></p>
          <p>• Arena: <strong>{result.materiales.arena_m3} m3</strong></p>
          <p>• Varillas: <strong>{result.materiales.varillas}</strong></p>
          <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '10px' }}>{result.nota}</p>
        </div>
      )}
      {/* AVISO LEGAL MINIATURA */}
      <div style={{ marginTop: '40px', fontSize: '0.75rem', color: '#444' }}>
        Resultados son estimaciones IA • Verificar con profesional calificado
      </div>
    </div>
  );
}
