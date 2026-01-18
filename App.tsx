import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  Building2, Upload, Loader2, Ruler, Layers, 
  Package, Zap, ShieldCheck, BarChart3, AlertOctagon, 
  Calculator, FileSearch, Target
} from 'lucide-react';

// CONFIGURACIÓN DE API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || "");

export default function App() {
  const [resultado, setResultado] = useState<any>(null);
  const [cargando, setCargando] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const analizarImagen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !API_KEY) {
      if (!API_KEY) alert("Error: Falta la API KEY en las variables de entorno.");
      return;
    }

    setPreview(URL.createObjectURL(file));
    setCargando(true);
    setResultado(null);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          
          // PROMPT BLINDADO: Estricto para evitar errores de formato
          const prompt = "Actúa como ingeniero civil. Analiza este plano y calcula materiales. Devuelve ÚNICAMENTE un objeto JSON sin texto extra, respetando este formato: { \"area\": 0, \"bloques\": 0, \"cemento\": 0, \"varillas\": 0, \"explicacion\": \"...\" }";

          const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64Data, mimeType: file.type } }
          ]);
          
          const responseText = result.response.text();
          
          // EXTRACTOR DE JSON: Salta cualquier texto que la IA mande por error
          const inicioJson = responseText.indexOf('{');
          const finJson = responseText.lastIndexOf('}') + 1;
          
          if (inicioJson === -1) throw new Error("No se detectó JSON");
          
          const jsonPuro = responseText.substring(inicioJson, finJson);
          setResultado(JSON.parse(jsonPuro));

        } catch (err) {
          console.error("Error procesando respuesta:", err);
          alert("La IA mandó un formato ilegible. ¡Intenta subirlo de nuevo!");
        } finally {
          // SEGURO DE VIDA: Apaga el círculo rojo siempre
          setCargando(false);
        }
      };
      reader.readAsDataURL(file);

    } catch (err) {
      console.error("Error de conexión:", err);
      setCargando(false);
      alert("Error de conexión con el motor de IA.");
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans">
      {/* Banner Superior */}
      <div className="w-full bg-red-600 py-1.5 px-4 flex justify-center items-center gap-4 shadow-lg">
        <span className="text-[10px] font-black tracking-[0.3em] uppercase animate-pulse">● SYSTEM LIVE: AI ENGINE ONLINE</span>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-white/5 pb-8 gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-red-600 p-3 rounded-2xl rotate-3 shadow-xl shadow-red-600/20">
              <Building2 size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Cubic <span className="text-red-600">AI</span></h1>
              <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mt-1">Cálculo Estructural Inteligente</p>
            </div>
          </div>
          
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-[10px] font-black text-red-600 uppercase mb-1">Fase Beta</p>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">Acceso Gratuito</p>
