import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  Building2, Upload, Loader2, CreditCard, Ruler, Layers, 
  Package, Zap, ShieldCheck, BarChart3, AlertOctagon, 
  Calculator, FileSearch, Target
} from 'lucide-react';

// CONEXIÓN SEGURA
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || "");

export default function App() {
  const [resultado, setResultado] = useState<any>(null);
  const [cargando, setCargando] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const analizarImagen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !API_KEY) {
      if (!API_KEY) alert("Error: No se detectó la llave premium en Vercel.");
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
          // Prompt optimizado para velocidad
          const prompt = "Analiza este plano de construcción. Calcula: área total, bloques necesarios, sacos de cemento y varillas. Responde ÚNICAMENTE un objeto JSON con estas llaves: { \"area\": 0, \"bloques\": 0, \"cemento\": 0, \"varillas\": 0, \"explicacion\": \"...\" }";

          const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64Data, mimeType: file.type } }
          ]);
          
          const responseText = result.response.text();
          
          // LIMPIEZA DE JSON (Evita que se quede analizando)
          const inicioJson = responseText.indexOf('{');
          const finJson = responseText.lastIndexOf('}') + 1;
          const jsonPuro = responseText.substring(inicioJson, finJson);
          
          setResultado(JSON.parse(jsonPuro));
        } catch (err) {
          console.error(err);
          alert("La IA mandó un formato ilegible. ¡Intenta de nuevo!");
        } finally {
          // ESTA LÍNEA MATA EL CÍRCULO ROJO PASE LO QUE PASE
          setCargando(false);
        }
      };
      reader.readAsDataURL(file);

    } catch (err) {
      console.error(err);
      setCargando(false);
      alert("Error de conexión con el motor de IA.");
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans">
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
            <div className="text-center opacity-50">
              <p className="text-[10px] font-black text-white uppercase mb-1">Fase Beta</p>
              <p className="text-[9px] text-red-600 font-bold uppercase tracking-tighter">Acceso Gratuito</p>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-8">
            <div className="relative group p-1 bg-gradient-to-br from-red-600/30 to-transparent rounded-[2.5rem]">
              <div className="relative bg-zinc-900 border border-white/5 rounded-[2.4rem] overflow-hidden aspect-square flex items-center justify-center">
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover opacity-80" alt="Plano" />
                ) : (
                  <div className="flex flex-col items-center gap-4 text-zinc-600 p-12 text-center">
                    <Upload size={48} strokeWidth={1} />
                    <span className="font-black text-[10px] uppercase tracking-[0.3em]">Cargar Plano (JPG / PNG)</span>
                  </div>
                )}
                <input type="file" onChange={analizarImagen} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              </div>
            </div>

            <div className="space-y-4">
              <BenefitCard icon={<Calculator size={20}/>} title="Presupuestos Rápidos" desc="Materiales en segundos para cotizar hoy mismo." />
              <BenefitCard icon={<Target size={20}/>} title="Evita el Desperdicio" desc="Cálculos precisos para que no compres de más." />
            </div>
          </div>

          <div className="lg:col-span-7">
            {cargando ? (
              <div className="h-full min-h-[450px] flex flex-col items-center justify-center bg-zinc-900/10 border border-white/5 rounded-[2.5rem] p-12 text-center">
                <Loader2 className="animate-spin text-red-600 mb-6" size={60} />
                <h3 className="text-2xl font-black italic uppercase mb-2">Procesando Obra</h3>
                <p className="text-zinc-500 text-xs tracking-widest uppercase font-bold">Identificando muros y columnas...</p>
              </div>
            ) : resultado ? (
              <div className="space-y-6 animate-in zoom-in-95 duration-500">
                <div className="bg-red-600/10 border border-red-600/20 p-4 rounded-2xl text-center">
                   <p className="text-[10px] font-black uppercase tracking-widest text-red-500">🚀 REPORTE GENERADO CON ÉXITO</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <ResultCard label="ÁREA" val={`${resultado.area}m²`} />
                  <ResultCard label="BLOQUES" val={resultado.bloques} />
                  <ResultCard label="CEMENTO" val={`${resultado.cemento} sacos`} />
                </div>
                <div className="p-8 bg-zinc-900 border border-white/5 rounded-[2.5rem] shadow-2xl">
                    <h4 className="font-black italic uppercase tracking-widest text-zinc-500 text-xs mb-4">Explicación Técnica</h4>
                    <p className="text-zinc-300 text-xl leading-relaxed italic font-bold mb-8">"{resultado.explicacion}"</p>
                    <button onClick={() => window.location.reload()} className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-xs hover:bg-red-600 hover:text-white transition-all">
                      Analizar otro plano ↗
                    </button>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[450px] flex flex-col items-center justify-center border border-zinc-900 border-dashed rounded-[2.5rem]">
                <BarChart3 size={64} className="mb-4 text-zinc-900 opacity-20" />
                <p className="font-black italic uppercase tracking-widest text-[10px] text-zinc-700">Esperando plano del ingeniero...</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// COMPONENTES AUXILIARES (Sin cambios)
function BenefitCard({ icon, title, desc }: any) {
  return (
    <div className="flex gap-4 p-4 bg-zinc-900/30 border border-white/5 rounded-2xl group hover:border-red-600/50 transition-colors">
      <div className="text-red-600 mt-1 group-hover:scale-110 transition-transform">{icon}</div>
      <div>
        <h4 className="text-[11px] font-black uppercase text-zinc-300 tracking-widest mb-1">{title}</h4>
        <p className="text-[10px] text-zinc-500 leading-tight font-medium">{desc}</p>
      </div>
    </div>
  );
}

function ResultCard({ label, val }: any) {
  return (
    <div className="bg-zinc-900 p-6 rounded-[2rem] border border-white/5 text-center shadow-xl">
      <span className="text-[8px] font-black text-zinc-500 tracking-[0.2em] mb-2 uppercase">{label}</span>
      <span className="text-xl font-black italic text-red-600 leading-none block mt-1">{val}</span>
    </div>
  );
}
