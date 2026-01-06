import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  Building2, Upload, Loader2, CheckCircle2, 
  Lock, CreditCard, Ruler, Layers, Package,
  Zap, ChevronRight, ShieldCheck, BarChart3
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
        const prompt = "Analiza este plano de construcción. Eres un ingeniero senior. Devuelve ÚNICAMENTE un objeto JSON con estos campos exactos: area (número), bloques (número), cemento (número), varillas (número), explicacion (resumen profesional de 3 líneas). No incluyas texto fuera del JSON.";

        const result = await model.generateContent([
          prompt,
          { inlineData: { data: base64Data, mimeType: file.type } }
        ]);
        
        const responseText = result.response.text();
        const jsonClean = responseText.replace(/```json|```/g, "").trim();
        setResultado(JSON.parse(jsonClean));
        setCargando(false);
      };
    } catch (err) {
      console.error(err);
      alert("Error en el escaneo. Intente con una imagen más clara.");
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-500/30">
      {/* BARRA DE ESTADO SUPERIOR */}
      <div className="w-full bg-red-600 py-1.5 px-4 flex justify-center items-center gap-4 shadow-lg shadow-red-600/20">
        <span className="text-[10px] font-black tracking-[0.3em] uppercase animate-pulse">● System Live: AI Engine Online</span>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-gradient-to-br from-red-600 to-red-800 p-3 rounded-2xl rotate-6 shadow-2xl shadow-red-600/40 border border-white/10">
                <Building2 size={32} strokeWidth={2.5} />
              </div>
              <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
                Cubic <span className="text-red-600">AI</span>
              </h1>
            </div>
            <p className="text-zinc-500 font-bold tracking-widest text-xs uppercase ml-1">The Future of Structural Estimation</p>
          </div>
          
          <div className="flex gap-8 border-l border-zinc-800 pl-8">
            <HeaderStat label="Model" val="Gemini 1.5 Pro" />
            <HeaderStat label="Region" val="LATAM_SEC_01" />
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* PANEL IZQUIERDO: CARGA */}
          <div className="lg:col-span-5 space-y-8">
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-zinc-800 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-zinc-900/80 border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-sm shadow-2xl">
                {preview ? (
                  <div className="relative">
                    <img src={preview} className="w-full h-[450px] object-cover opacity-80" alt="Plano" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                  </div>
                ) : (
                  <div className="h-[450px] flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-white/5">
                      <Upload className="text-zinc-400" size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Importar Proyecto</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">Arrastre su plano arquitectónico o fotografía de obra para iniciar el procesamiento.</p>
                  </div>
                )}
                <input 
                  type="file" 
                  onChange={analizarImagen}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FeatureBox icon={<ShieldCheck size={18}/>} text="Encriptación SSL" />
              <FeatureBox icon={<Zap size={18}/>} text="Cálculo en < 10s" />
            </div>
          </div>

          {/* PANEL DERECHO: RESULTADOS */}
          <div className="lg:col-span-7 space-y-6">
            {!resultado && !cargando && (
              <div className="h-full flex flex-col items-center justify-center p-16 border border-zinc-800/50 rounded-[2rem] bg-zinc-900/20 border-dashed">
                <BarChart3 size={60} className="text-zinc-800 mb-6" />
                <h2 className="text-2xl font-bold text-zinc-700 italic">Esperando Datos...</h2>
              </div>
            )}

            {cargando && (
              <div className="p-12 bg-zinc-900/50 border border-white/5 rounded-[2rem] flex flex-col items-center gap-6 text-center shadow-inner">
                <div className="relative">
                  <Loader2 className="animate-spin text-red-600" size={48} />
                  <div className="absolute inset-0 blur-xl bg-red-600/20 animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-xl font-black italic tracking-widest uppercase mb-1">Analizando Pixeles</h3>
                  <p className="text-zinc-500 text-sm">La red neuronal está extrayendo medidas estructurales...</p>
                </div>
              </div>
            )}

            {resultado && !pagado && (
              <div className="relative p-10 bg-zinc-900/40 border border-red-600/30 rounded-[2rem] overflow-hidden backdrop-blur-xl group shadow-2xl shadow-red-600/5">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Lock size={120} />
                </div>
                
                <div className="relative z-10 space-y-8">
                  <div className="space-y-2">
                    <span className="bg-red-600/10 text-red-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border border-red-600/20">Ready for delivery</span>
                    <h2 className="text-4xl font-black italic tracking-tighter">ANÁLISIS COMPLETADO</h2>
                    <p className="text-zinc-400 max-w-md">El motor IA ha generado el presupuesto completo de materiales para este plano. Desbloquea el acceso para ver los detalles técnicos.</p>
                  </div>

                  <div className="flex gap-4 opacity-30 grayscale blur-[3px]">
                    <div className="bg-zinc-800 h-16 w-32 rounded-xl"></div>
                    <div className="bg-zinc-800 h-16 w-32 rounded-xl"></div>
                    <div className="bg-zinc-800 h-16 w-32 rounded-xl"></div>
                  </div>

                  <button 
                    onClick={() => setPagado(true)}
                    className="group w-full py-5 bg-white text-black rounded-2xl font-black flex items-center justify-center gap-4 transition-all hover:bg-red-600 hover:text-white"
                  >
                    <CreditCard size={22} />
                    ADQUIRIR REPORTE POR $5.00 USD
                    <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {resultado && pagado && (
              <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard icon={<Ruler size={20}/>} label="Área Total" val={`${resultado.area} m²`} sub="Superficie estimada" color="text-red-500" />
                  <StatCard icon={<Layers size={20}/>} label="Bloques" val={resultado.bloques} sub="Unidades estimadas" color="text-red-500" />
                  <StatCard icon={<Package size={20}/>} label="Cemento" val={`${resultado.cemento} sacos`} sub="Mortero y mezcla" color="text-red-500" />
                </div>

                <div className="p-8 bg-zinc-900/80 border border-white/5 rounded-[2rem] shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
                  <div className="flex items-center gap-3 mb-6">
                    <CheckCircle2 size={24} className="text-red-600" />
                    <h3 className="text-lg font-black italic uppercase tracking-widest text-zinc-300">Memoria Técnica</h3>
                  </div>
                  <p className="text-zinc-400 text-lg leading-relaxed font-medium italic">
                    "{resultado.explicacion}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <footer className="w-full border-t border-zinc-900 py-12 flex flex-col items-center gap-4 mt-20">
        <div className="flex items-center gap-2 opacity-20">
          <Building2 size={16} />
          <span className="text-[10px] font-black uppercase tracking-[0.5em]">Cubic AI Structural Technologies © 2026</span>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ icon, label, val, sub, color }: any) {
  return (
    <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-[1.5rem] flex flex-col gap-3 backdrop-blur-md">
      <div className={`${color} bg-white/5 w-fit p-3 rounded-xl`}>{icon}</div>
      <div>
        <span className="text-[10px] font-black text-zinc-500 tracking-widest uppercase block mb-1">{label}</span>
        <span className="text-2xl font-black italic text-white">{val}</span>
        <p className="text-[10px] text-zinc-600 font-bold mt-1 uppercase tracking-tighter">{sub}</p>
      </div>
    </div>
  );
}

function FeatureBox({ icon, text }: any) {
  return (
    <div className="flex items-center gap-3 px-6 py-4 bg-zinc-900/20 border border-zinc-800/50 rounded-2xl">
      <div className="text-red-600">{icon}</div>
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{text}</span>
    </div>
  );
}

function HeaderStat({ label, val }: any) {
  return (
    <div className="text-right">
      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-black italic text-zinc-300">{val}</p>
    </div>
  );
}
