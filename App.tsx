
import React, { useState, useCallback } from 'react';
import { 
  Building2, 
  Upload, 
  AlertTriangle, 
  ChevronRight, 
  Calculator, 
  History,
  HardHat,
  Ruler,
  Package,
  Layers,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { analyzeEngineeringImage } from './services/geminiService';
import { MaterialEstimate, AnalysisResult, AnalysisStatus } from './types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const App: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus(AnalysisStatus.LOADING);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setPreviewUrl(base64);

      try {
        const estimate = await analyzeEngineeringImage(base64);
        const result: AnalysisResult = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
          imageUrl: base64,
          estimate
        };

        setCurrentResult(result);
        setHistory(prev => [result, ...prev]);
        setStatus(AnalysisStatus.SUCCESS);
      } catch (err: any) {
        setError(err.message || "Error desconocido durante el análisis");
        setStatus(AnalysisStatus.ERROR);
      }
    };
    reader.readAsDataURL(file);
  };

  const chartData = currentResult ? [
    { name: 'Bloques', value: currentResult.estimate.blocks_count, color: '#ef4444' },
    { name: 'Varillas', value: currentResult.estimate.rods_count, color: '#f97316' },
    { name: 'Cemento', value: currentResult.estimate.cement_bags, color: '#3b82f6' },
  ] : [];

  return (
    <div className="min-h-screen text-slate-200 p-4 md:p-8 flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-6xl flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-lg">
            <Building2 className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tighter text-white">CUBIC AI</h1>
            <p className="text-xs text-red-500 font-bold uppercase tracking-widest">Ingeniería & Cálculo</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-400">
          <span className="flex items-center gap-1"><HardHat size={16} /> Pro Mode</span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          <span>Sistemas Activos</span>
        </div>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload & Image */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-900 border-2 border-zinc-800 rounded-2xl overflow-hidden relative group">
            {previewUrl ? (
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-[400px] object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                />
                {status === AnalysisStatus.LOADING && <div className="scanning-line" />}
              </div>
            ) : (
              <div className="w-full h-[400px] flex flex-col items-center justify-center border-dashed border-2 border-zinc-800 m-2 rounded-xl bg-zinc-900/50">
                <Upload className="text-zinc-700 mb-4" size={48} />
                <p className="text-zinc-500 text-sm font-medium">Sube un plano o foto de obra</p>
              </div>
            )}
            
            <label className="absolute inset-0 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              <div className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-xl transform group-hover:scale-105 transition-transform">
                <Upload size={20} />
                {previewUrl ? 'Cambiar Imagen' : 'Seleccionar Archivo'}
              </div>
            </label>
          </div>

          {status === AnalysisStatus.LOADING && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 flex items-center gap-4 animate-pulse">
              <Loader2 className="animate-spin text-blue-400" />
              <div className="text-sm">
                <p className="font-bold text-blue-400">ANALIZANDO ESTRUCTURA...</p>
                <p className="text-blue-300/70 text-xs">Gemini está calculando volúmenes y materiales</p>
              </div>
            </div>
          )}

          {status === AnalysisStatus.ERROR && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 flex items-center gap-4">
              <AlertTriangle className="text-red-500" />
              <div className="text-sm">
                <p className="font-bold text-red-400">ERROR DE SISTEMA</p>
                <p className="text-red-300/70 text-xs">{error}</p>
              </div>
            </div>
          )}

          {/* Tips / Info */}
          <div className="bg-zinc-900/30 rounded-xl p-6 border border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-400 mb-4 flex items-center gap-2">
              <CheckCircle2 size={16} /> GUÍA DE USO
            </h3>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li className="flex gap-2">
                <span className="text-red-500 font-bold">01.</span>
                Asegúrate de que las cotas (medidas) sean legibles en el plano.
              </li>
              <li className="flex gap-2">
                <span className="text-red-500 font-bold">02.</span>
                Las fotos de obra deben tener buena iluminación y perspectiva.
              </li>
              <li className="flex gap-2">
                <span className="text-red-500 font-bold">03.</span>
                El sistema detectará automáticamente el tipo de material.
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-7 space-y-6">
          {currentResult ? (
            <>
              {/* Material Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <MaterialCard 
                  icon={<Ruler className="text-blue-400" />} 
                  label="Área Estimada" 
                  value={`${currentResult.estimate.area_m2} m²`} 
                />
                <MaterialCard 
                  icon={<Layers className="text-orange-400" />} 
                  label="Bloques" 
                  value={`${currentResult.estimate.blocks_count} uds`} 
                />
                <MaterialCard 
                  icon={<Package className="text-gray-400" />} 
                  label="Cemento" 
                  value={`${currentResult.estimate.cement_bags} bultos`} 
                />
                <MaterialCard 
                  icon={<Calculator className="text-red-400" />} 
                  label="Varillas" 
                  value={`${currentResult.estimate.rods_count} uds`} 
                />
                <MaterialCard 
                  icon={<div className="w-5 h-5 bg-zinc-700 rounded-full" />} 
                  label="Grava" 
                  value={`${currentResult.estimate.gravel_m3} m³`} 
                />
                <MaterialCard 
                  icon={<div className="w-5 h-5 bg-amber-700/50 rounded-full" />} 
                  label="Arena" 
                  value={`${currentResult.estimate.sand_m3} m³`} 
                />
              </div>

              {/* Chart & Analysis */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Calculator size={20} className="text-red-500" /> Comparativa de Materiales
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                        cursor={{ fill: '#27272a' }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Explanation */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-green-500" /> Memoria de Cálculo
                </h3>
                <div className="text-zinc-400 text-sm leading-relaxed prose prose-invert">
                  {currentResult.estimate.explanation.split('\n').map((para, i) => (
                    <p key={i} className="mb-3">{para}</p>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-zinc-900/20 border-2 border-dashed border-zinc-800 rounded-3xl">
              <Building2 className="text-zinc-800 mb-6" size={80} />
              <h2 className="text-2xl font-bold text-zinc-500">Panel de Resultados Vacío</h2>
              <p className="text-zinc-600 max-w-sm mt-2">
                Sube una imagen de ingeniería para comenzar el análisis automático de materiales.
              </p>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-zinc-500 mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2 uppercase tracking-widest"><History size={16} /> Historial Reciente</span>
                <span className="bg-zinc-800 px-2 py-0.5 rounded text-[10px]">{history.length}</span>
              </h3>
              <div className="space-y-3">
                {history.map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => {
                      setCurrentResult(item);
                      setPreviewUrl(item.imageUrl);
                      setStatus(AnalysisStatus.SUCCESS);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${item.id === currentResult?.id ? 'bg-red-600 text-white shadow-lg' : 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-700">
                        <img src={item.imageUrl} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold truncate w-32">{item.estimate.area_m2} m² Calculados</p>
                        <p className="text-[10px] opacity-60">{item.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-20 py-8 text-center text-zinc-600 text-sm border-t border-zinc-900 w-full max-w-6xl">
        <p className="mono">CUBIC AI ENGINE v3.5 // POWERED BY GEMINI PRO VISION</p>
        <p className="mt-1">Cálculos sujetos a validación profesional por ingeniero responsable.</p>
      </footer>
    </div>
  );
};

interface MaterialCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const MaterialCard: React.FC<MaterialCardProps> = ({ icon, label, value }) => (
  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl hover:border-zinc-700 transition-colors">
    <div className="mb-2">{icon}</div>
    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{label}</p>
    <p className="text-xl font-bold text-white tracking-tight">{value}</p>
  </div>
);

export default App;
