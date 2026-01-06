import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  Building2, Upload, Loader2, CheckCircle2, 
  Lock, CreditCard, Ruler, Layers, Package,
  Zap, ChevronRight, ShieldCheck, BarChart3, AlertOctagon, Cpu
} from 'lucide-react';

const API_KEY = "AIzaSyBr7px50ZywMy3wnRxu5TfVunLkRVD9aMg";
const genAI = new GoogleGenerativeAI(API_KEY);

export default function App() {
  const [resultado, setResultado] = useState<any>(null);
  const [cargando, setCargando] = useState(false);
  const [pagado, setPagado] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const analizarImagen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setCargando(true);
    setResultado(null);
    setPagado(false);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        
        // PROMPT REFORZADO PARA EVITAR ERRORES
        const prompt = "Analiza este plano estructural. Dame los resultados en este formato exacto de JSON: { \"area\": 0, \"bloques\": 0, \"cemento\": 0, \"varillas\": 0, \"explicacion\": \"texto\" }. No escribas nada más, solo el JSON.";

        const result = await model.generateContent([
          prompt,
          { inlineData: { data: base64Data, mimeType: file.type } }
        ]);
        
        const responseText = result.response.text();
        
        // LIMPIADOR MAESTRO: Extrae el JSON aunque la IA mande basura extra
        const inicioJson = responseText.indexOf('{');
        const finJson = responseText.lastIndexOf('}') + 1;
        const jsonPuro = responseText.substring(inicioJson, finJson);
        
        const datosCocinados = JSON.parse(jsonPuro);
        setResultado(datosCocinados);
        setCargando(false);
      };
    } catch (err) {
      console.error("Error en IA:", err);
      alert("Hubo un hipo técnico. ¡Intenta subir el plano otra vez!");
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-red-500/50">
      {/* NAVBAR */}
      <nav className="w-full border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="text-red-600" size={24} />
            <span className="font-black tracking-tighter text-xl italic uppercase">Cubic <span className="text-red-600">AI</span></span>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">System Online</span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LADO IZQUIERDO: CARGA */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative group p-1 bg-gradient-to-br from-red-600/20 to-transparent rounded-[2.5rem]">
              <div className="relative bg-zinc-900 border border-white/5 rounded-[2.4rem] overflow-hidden aspect-square flex items-center justify-center">
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover opacity-80" alt="Plano" />
                ) : (
                  <div className="flex flex-col items-center gap-4 text-zinc-600">
                    <Upload size={48} strokeWidth={1} />
                    <span className="font-black text-[10px] uppercase tracking-[0.3em]">Cargar Plano Estructural</span>
                  </div>
                )}
                <input type="file" onChange={analizarImagen} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-2xl flex items-center gap-3">
                <ShieldCheck className="text-red-600" size={18} />
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Encrip. SSL</span>
              </div>
              <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-2xl flex items-center gap-3">
                <Zap className="text-red-600" size={18} />
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Análisis Fast</span>
              </div>
            </div>
          </div>

          {/* LADO DERECHO: RESULTADOS */}
          <div className="lg:col-span-7">
            {!resultado && !cargando && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border border-zinc-900 border-dashed rounded-[2.5rem] text-zinc-800">
                <BarChart3 size={64} className="mb-4 opacity-20" />
                <p className="font-black italic uppercase tracking-widest text-sm">Esperando imagen...</p>
              </div>
            )}

            {cargando && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-zinc-900/20 border border-white/5 rounded-[2.5rem] p-12 text-center">
                <div className="relative mb-8">
                  <Loader2 className="animate-spin text-red-600" size={60} strokeWidth={1} />
                  <div className="absolute inset-0 blur-2xl bg-red-600/20 animate-pulse"></div>
                </div>
                <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2 animate-pulse">Analizando Píxeles</h3>
                <p className="text-zinc-500 text-xs tracking-widest uppercase font-bold">Extrayendo medidas estructurales...</p>
              </div>
            )}

            {resultado && !pagado && (
              <div className="p-10 bg-gradient-to-b from-zinc-900 to-black border border-red-600/30 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-500">
                <div className="space-y-8">
                  <div className="inline-block bg-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase italic tracking-tighter">Cubic AI Engine v4</div>
                  <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-tight">Presupuesto<br/>Generado</h3>
                  <p className="text-zinc-400 font-medium leading-relaxed italic">Hemos calculado el área de {resultado.area}m² y los materiales necesarios. Desbloquea el reporte completo para tu obra.</p>
                  
                  <button onClick={() => setPagado(true)} className="w-full py-5 bg-white text-black rounded-2xl font-black flex items-center justify-center gap-4 hover:bg-red-600 hover:text-white transition-all transform active:scale-95 shadow-xl">
                    <CreditCard size={20} /> DESBLOQUEAR AHORA POR $5.00
                  </button>
                </div>
              </div>
            )}

            {resultado && pagado && (
              <div className="space-y-6 animate-in slide-in-from-bottom-12 duration-1000">
                <div className="grid grid-cols-3 gap-4">
                  <StatCard label="ÁREA" val={`${resultado.area}m²`} />
                  <StatCard label="BLOQUES" val={resultado.bloques} />
                  <StatCard label="CEMENTO" val={`${resultado.cemento} sacos`} />
                </div>
                
                <div className="p-8 bg-zinc-900 border border-white/5 rounded-[2.5rem] shadow-2xl space-y-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-red-600" size={20} />
                    <h4 className="font-black italic uppercase tracking-widest text-zinc-400 text-sm">Memoria Técnica AI</h4>
                  </div>
                  <p className="text-zinc-300 text-lg leading-relaxed italic font-medium">"{resultado.explicacion}"</p>
                  
                  <div className="pt-6 border-t border-white/5">
                    <div className="p-5 bg-red-600/5 border border-red-600/20 rounded-3xl flex gap-4">
                      <AlertOctagon className="text-red-600 shrink-0" size={24} />
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-tighter">Aviso Legal Obligatorio:</p>
                        <p className="text-[11px] text-zinc-500 leading-tight italic">
                          Este cálculo es una estimación generada por IA. La responsabilidad del proyecto final recae exclusivamente en el ingeniero civil o arquitecto colegiado que firme la obra.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="mt-20 py-12 border-t border-white/5 text-center">
        <p className="text-[10px] font-black text-zinc-700 tracking-[0.5em] uppercase mb-4">Cubic AI Structural Tech © 2026</p>
        <p className="max-w-2xl mx-auto text-[9px] text-zinc-800 font-bold uppercase tracking-widest leading-loose">
          Disclaimer: Herramienta de asistencia técnica. Los resultados deben ser validados por un profesional certificado antes de cualquier ejecución de obra o compra de materiales.
        </p>
      </footer>
    </div>
  );
}

function StatCard({ label, val }: any) {
  return (
    <div className="bg-zinc-900 p-6 rounded-[2rem] border border-white/5 flex flex-col items-center text-center">
      <span className="text-[8px] font-black text-zinc-500 tracking-[0.2em] mb-2 uppercase">{label}</span>
      <span className="text-xl font-black italic text-red-600 leading-none">{val}</span>
    </div>
  );
}
