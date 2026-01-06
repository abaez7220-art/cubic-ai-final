import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  Ruler, 
  Layers, 
  Package, 
  Calculator, 
  History, 
  ChevronRight,
  Building2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GoogleGenerativeAI } from "@google/generative-ai";

// CONFIGURACIÓN DE LA IA
const API_KEY = "AIzaSyBr7px50ZywMy3wnRxu5TfVunLkRVD9aMg";
const genAI = new GoogleGenerativeAI(API_KEY);

enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

const App = () => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Configurar UI para carga
    setPreviewUrl(URL.createObjectURL(file));
    setStatus(AnalysisStatus.LOADING);
    setError(null);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];

        // Prompt optimizado para tu diseño
        const prompt = "Analiza esta imagen de construcción. Eres un ingeniero experto. Calcula y devuelve ESTRICTAMENTE un objeto JSON con estos campos: area_m2, blocks_count, cement_bags, rods_count, gravel_m3, sand_m3, y una 'explanation' detallada. No escribas texto extra, solo el JSON.";

        const result = await model.generateContent([
          prompt,
          { inlineData: { data: base64Data, mimeType: file.type } }
        ]);

        const responseText = result.response.text();
        const jsonClean = responseText.replace(/```json|```/g, "").trim();
        const data = JSON.parse(jsonClean);

        const newResult = {
          id: Date.now().toString(),
          timestamp: new Date(),
          imageUrl: previewUrl || URL.createObjectURL(file),
          estimate: data
        };

        setCurrentResult(newResult);
        setHistory(prev => [newResult, ...prev]);
        setStatus(AnalysisStatus.SUCCESS);
      };
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al analizar la imagen");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const chartData = currentResult ? [
    { name: 'Bloques', value: currentResult.estimate.blocks_count, color: '#f97316' },
    { name: 'Cemento', value: currentResult.estimate.cement_bags, color: '#94a3b8' },
    { name: 'Varillas', value: currentResult.estimate.rods_count, color: '#ef4444' },
    { name: 'Arena/Grava', value: currentResult.estimate.sand_m3 + currentResult.estimate.gravel_m3, color: '#fbbf24' }
  ] : [];

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center p-6 lg:p-12 font-sans">
      <header className="w-full max-w-6xl mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center rotate-3 shadow-lg shadow-red-600/20">
              <Building2 className="text-white" size={24} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Cubic AI</h1>
          </div>
          <p className="text-zinc-500 font-medium tracking-tight">INTELIGENCIA ARTIFICIAL APLICADA A CUBICACIÓN</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right border-r border-zinc
