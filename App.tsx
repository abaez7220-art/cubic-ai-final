import React, { useState } from 'react';

// Define la estructura de los resultados para que TypeScript no moleste
interface CalculationResult {
  areas: { nombre: string; m2: number }[];
  materiales: {
    blocks: number;
    cemento: number;
    arena_m3: number;
    varillas_3_8: number;
  };
  analisis_estructural: string;
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
    if (!image) return alert("Sube el plano primero, mano.");
    
    setLoading(true);
    setResult(null);

    // INSTRUCCIÓN ULTRA-ESTRICTA PARA LA IA
    const systemPrompt = `Actúa como un Ingeniero Estructural experto. 
    Analiza la imagen del plano y extrae las medidas. 
    Calcula materiales para muros de block de 6".
    RESPONDE ÚNICAMENTE EN FORMATO JSON PURO. 
    No uses bloques de código Markdown, no saludes, no expliques nada.
    
    Formato requerido:
    {
      "areas": [{"nombre": "Dormitorio", "m2": 0}],
      "materiales": {"blocks": 0, "cemento": 0, "arena_m3": 0, "varillas_3_8": 0},
      "analisis_estructural": "Breve nota técnica"
    }`;

    try {
      // AQUÍ VA TU LLAMADA A LA API (OpenAI o Gemini)
      const response = await fetch('TU_API_URL_AQUÍ', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, prompt: systemPrompt }),
      });

      const data = await response.json();
      const rawText = data.choices[0].message.content;

      // --- TRUCO MÁGICO PARA LIMPIAR EL JSON ---
      const start = rawText.indexOf('{');
      const end = rawText.lastIndexOf('}');
      const jsonString = rawText.substring(start, end + 1);
      
      const finalData: CalculationResult = JSON.parse(jsonString);
      setResult(finalData);

    } catch (error) {
      console.error(error);
      alert("Error analizando. La IA se volvió loca con el formato.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
      <h1>CUBIC AI 🏗️</h1>
      <p>Cálculo Estructural Inteligente - Fase Beta</p>
      
      <input type="file" onChange={handleFileUpload} accept="image/*" />
      
      {image && (
        <div style={{ marginTop: '20px' }}>
          <img src={image} alt="Plano" style={{ maxWidth: '300px', borderRadius: '8px' }} />
          <br />
          <button 
            onClick={analizarPlano} 
            disabled={loading}
            style={{ padding: '10px 20px', marginTop: '10px', cursor: 'pointer', backgroundColor: '#e53e3e', color: 'white', border: 'none', borderRadius: '5px' }}
          >
            {loading ? "PROCESANDO OBRA..." : "CALCULAR AHORA"}
          </button>
        </div>
      )}

      {result && (
        <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #444', borderRadius: '10px', backgroundColor: '#2d2d2d' }}>
          <h2>Resultados del Cálculo:</h2>
          <ul>
            <li><strong>Blocks de 6":</strong> {result.materiales.blocks} unidades</li>
            <li><strong>Cemento:</strong> {result.materiales.cemento} fundas</li>
            <li><strong>Arena:</strong> {result.materiales.arena_m3} m³</li>
            <li><strong>Varillas 3/8:</strong> {result.materiales.varillas_3_8} unidades</li>
          </ul>
          <p><strong>Nota técnica:</strong> {result.analisis_estructural}</p>
        </div>
      )}
    </div>
  );
}
