import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  Building2, Upload, Loader2, Ruler, Layers, 
  Package, Zap, ShieldCheck, BarChart3, AlertOctagon, 
  Calculator, FileSearch, Target
} from 'lucide-react';

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
          
          // PROMPT NIVEL DIOS: No le damos espacio a que hable de más
          const prompt = "Analiza este plano arquitectónico. Entrega los datos técnicos en formato JSON puro. No escribas NADA fuera del JSON. Formato: {\"area\": 0.0, \"bloques\": 0, \"cemento\": 0, \"varillas\": 0, \"explicacion\": \"...\"}";

          const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64Data, mimeType: file.type } }
          ]);
          
          let responseText = result.response.text();
          
          // LIMPIEZA EXTREMA: Buscamos el primer '{' y el último '}'
          const inicio = responseText.indexOf('{');
          const fin = responseText.lastIndexOf('}') + 1;
          
          if (inicio === -1 || fin === 0) throw new Error("No hay JSON");
          
          const jsonLimpio = responseText.substring(inicio, fin).replace(/\\n/g, "");
          setResultado(JSON.parse(jsonLimpio));

        } catch (err) {
          console.error(err);
          alert("Error analizando. La IA se volvió loca con el formato, ¡intenta de nuevo!");
        } finally {
          setCargando(false); // El círculo rojo MUERE aquí sí o sí
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setCargando(false);
      alert("Error de conexión.");
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans">
      <div className="w-full bg-red-600 py-1.5 px-4 flex justify-center items-center gap-4">
        <span className="text-[10px] font-black tracking-[0.3em] uppercase animate-pulse">● SYSTEM LIVE: AI ENGINE ONLINE</span>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-white/5 pb-8">
          <div className="flex items-center gap-4">
            <div className="bg-red-600 p-3 rounded-2xl rotate-3">
              <Building2 size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Cubic <span className="text-red-600">AI</span></h1>
              <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mt-1">Fase Beta - Acceso Gratuito</p>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-8">
            <div className="relative bg-zinc-900 border border-white/5 rounded-[2.4rem] overflow-hidden aspect-square flex items-center justify-center">
              {preview ? (
                <img src={preview} className="w-full h-full object-cover opacity-80" alt="Plano" />
              ) : (
                <div className="flex flex-col items-center gap-4 text-zinc-600">
                  <Upload size={48} strokeWidth={1} />
                  <span className="font-black text-[10px] uppercase tracking-[0.3em]">Subir Plano</span>
                </div>
              )}
              <input type="file" onChange={analizarImagen} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
            </div>
          </div>

          <div className="lg:col-span-7">
            {c
