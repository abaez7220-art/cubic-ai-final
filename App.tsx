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

    const promptPersona = "Eres un calculador de materiales. Analiza este plano. RESPONDE SOLO JSON. No hables. Formato: {\"areas\": [], \"materiales\": {\"blocks\": 0, \"cemento\": 0, \"arena_m3\": 0, \"varillas\": 0}, \"nota\": \"\"}";

    try {
      const response = await fetch('/api/analyze', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, prompt: promptPersona }),
      });

      const data = await response.json();
      let rawContent = data.choices[0].message.content;

      // Limpieza de posibles etiquetas markdown
      rawContent = rawContent.replace(/```json|```/g, "");
      
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
    <div style={{ padding: '40px', maxWidth: '800px', margin: 'auto', fontFamily: 'sans-serif', backgroundColor: '#0f0f0f', color: '#fff', borderRadius: '15px', minHeight: '100vh' }}>
      
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#ff4d4d' }}>CUBIC AI PRO 🏗️</h1>
        <p style={{ fontSize: '1.1rem', color: '#ccc' }}>
          Analiza planos arquitectónicos al instante. Identifica dimensiones y calcula materiales de obra gris automáticamente.
        </p>
      </header>

      <div style={{ border: '2px dashed #444', padding: '20px', textAlign: 'center', borderRadius: '10px', background: '#1a1a1a' }}>
        <input type="file" onChange={handleFileUpload} accept="image/*" style={{ marginBottom: '20px' }} />
        
        {image && (
          <div>
            <img src={image} alt="Plano" style={{ width: '100%', maxWidth: '400px', borderRadius: '10px', border: '1px solid #333' }} />
            <br />
            <button 
              onClick={analizarPlano} 
              disabled={loading}
              style={{ padding: '15px 30px', fontSize: '18px', backgroundColor: '#ff4d4d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '15px', fontWeight: 'bold' }}
            >
              {loading ? "IDENTIFICANDO MUROS Y COLUMNAS..." : "GENERAR CÁLCULO"}
            </button>
          </div>
        )}
      </div>

      {result && (
        <div style={{ marginTop: '30px', backgroundColor: '#222', padding: '20px', borderRadius: '10px', borderLeft: '5px solid #ff4d4d' }}>
          <h3>Resultados Estimados:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{ background: '#333', padding: '10px', borderRadius: '5px' }}><strong>Blocks:</strong> {result.materiales.blocks} uds</div>
            <div style={{ background: '#333', padding: '10px', borderRadius: '5px' }}><strong>Cemento:</strong> {result.materiales.cemento} fundas</div>
            <div style={{ background: '#333', padding: '10px', borderRadius: '5px' }}><strong>Arena:</strong> {result.materiales.arena_m3} m3</div>
            <div style={{ background: '#333', padding: '10px', borderRadius: '5px' }}><strong>Varillas:</strong> {result.materiales.varillas} uds</div>
          </div>
          <p style={{ fontStyle: 'italic', marginTop: '15px', color: '#aaa' }}>{result.nota}</p>
        </div>
      )}

      <footer style={{ marginTop: '50px', textAlign: 'center', opacity: '0.6' }}>
        <hr style={{ borderColor: '#333' }} />
        <p style={{ fontSize: '10px', lineHeight: '1.5' }}>
          AVISO LEGAL: Los cálculos son estimaciones de IA. La responsabilidad final recae en el usuario y los profesionales de la obra.
        </p>
      </footer>
    </div>
  );
}
