import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Building2, Upload, Loader2, BarChart3, Calculator, Target } from 'lucide-react';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || "");

export default function App() {
  const [resultado, setResultado] = useState<any>(null);
  const [cargando, setCargando] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const analizarImagen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !API_KEY) return;

    setPreview(URL.createObjectURL(file));
    setCargando(true);
    setResultado(null);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          
          // PROMPT ULTRA-ESTRICTO: Formato JSON puro sin rodeos
          const prompt = "Actúa como experto en cubicación. Analiza este plano y responde SOLO con un objeto JSON (sin markdown, sin texto extra) con este formato exacto: {\"area\": 0.0, \"bloques\": 0, \"cemento\": 0, \"varillas\": 0, \"explicacion\": \"...\"}";

          const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64Data, mimeType: file.type } }
          ]);
          
          const responseText = result.response.text();
          
          // LIMPIEZA AGRESIVA: Extraemos solo lo que esté entre llaves
          const match = responseText.match(/\{[\s\S]*\}/);
          if (!match) throw new Error("No se encontró JSON");
          
          const datos = JSON.parse(match[0]);
          setResultado(datos);

        } catch (err) {
          console.error("Fallo de formato:", err);
          alert("La IA mandó un formato raro. ¡Intenta subirlo una vez más!");
        } finally {
          setCargando(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setCargando(false);
      alert("Error de conexión.");
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center gap-4 mb-12 border-b border-white/5 pb-8">
          <div className="bg-red-600 p-3 rounded-2xl shadow-lg shadow-red-600/20">
            <Building2 size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black italic uppercase">Cubic <span className="text-red-600">AI</span></h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Cálculo Estructural Pro</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Carga de Imagen */}
          <div className="space-y-6">
            <div className="relative bg-zinc-900 border-2 border-dashed border-white/10 rounded-[2rem] overflow-hidden aspect-video flex items-center justify-center group hover:border-red-600/50 transition-all">
              {preview ? (
                <img src={preview} className="w-full h-full object-contain" alt="Plano" />
              ) : (
                <div className="text-center">
                  <Upload size={40} className="mx-auto mb-2 text-zinc-600" />
                  <p className="text-[10px] font-black uppercase text-zinc-500">Subir Plano (JPG/PNG)</p>
                </div>
              )}
              <input type="file" onChange={analizarImagen} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                 <Calculator size={20} className="text-red-600 mb-2" />
                 <h4 className="text-[10px] font-black uppercase text-zinc-300">Precisión AI</h4>
                 <p className="text-[9px] text-zinc-500">Estimación de obra gris.</p>
              </div>
              <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                 <Target size={20} className="text-red-600 mb-2" />
                 <h4 className="text-[10px] font-black uppercase text-zinc-300">Rapidez</h4>
                 <p className="text-[9px] text-zinc-500">Resultados en segundos.</p>
              </div>
            </div>
          </div>

          {/* Resultados */}
          <div className="bg-zinc-900/30 rounded-[2rem] border border-white/5 p-8 min-h-[300px] flex flex-col justify-center">
            {cargando ? (
              <div className="text-center">
                <Loader2 className="animate-spin text-red-600 mx-auto mb-4" size={48} />
                <h3 className="font-black italic uppercase tracking-tighter">Procesando Obra...</h3>
              </div>
            ) : resultado ? (
              <div className="space-y-6 animate-in zoom-in-95">
                <div className="grid grid-cols-3 gap-3">
                   <StatBox label="Área" value={`${resultado.area}m²`} />
                   <StatBox label="Bloques" value={resultado.bloques} />
                   <StatBox label="Cemento" value={resultado.cemento} />
                </div>
                <div className="p-6 bg-zinc-900 rounded-2xl border border-white/10">
                   <p className="text-zinc-400 text-sm italic leading-relaxed">"{resultado.explicacion}"</p>
                </div>
                <button onClick={() => window.location.reload()} className="w-full py-4 bg-red-600 rounded-xl font-black uppercase text-[10px] hover:bg-red-700 transition-all">
                  Limpiar y Nuevo Análisis
                </button>
              </div>
            ) : (
              <div className="text-center opacity-20">
                <BarChart3 size={64} className="mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase">Esperando Plano</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: any) {
  return (
    <div className="bg-zinc-900 p-4 rounded-xl border border-white/5 text-center">
      <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">{label}</p>
      <p className="text-lg font-black italic text-red-600 leading-none">{value}</p>
    </div>
  );
}
