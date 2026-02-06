"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Loader2, ImageIcon, RotateCcw } from "lucide-react";

interface AnalysisResult {
  area_m2: number;
  blocks: number;
  cemento: number;
  arena: number;
  varillas: number;
  explicacion: string;
}

export function BlueprintAnalyzer() {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setFileName(file.name);
      setResult(null);
      setError(null);

      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    },
    []
  );

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setResult(null);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
    },
    []
  );

  const analizarPlano = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: image }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al analizar el plano.");
      }

      setResult(data);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Error desconocido";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setFileName("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
      {/* Upload Area */}
      <Card className="w-full border-border bg-card">
        <CardContent className="p-6">
          {!image ? (
            <label
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-muted-foreground/30 rounded-lg p-12 cursor-pointer hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-foreground font-medium">
                  Sube tu plano o captura de pantalla
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Arrastra y suelta o haz clic para seleccionar
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  JPG, PNG o captura de pantalla
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-full">
                <img
                  src={image}
                  alt="Plano subido"
                  className="w-full max-h-80 object-contain rounded-lg border border-border"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ImageIcon className="w-4 h-4" />
                <span>{fileName}</span>
              </div>
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={reset}
                  className="flex-1"
                  disabled={loading}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Cambiar imagen
                </Button>
                <Button
                  onClick={analizarPlano}
                  disabled={loading}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Calculando...
                    </>
                  ) : (
                    "Generar Calculo"
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="w-full border-destructive/50 bg-destructive/10">
          <CardContent className="p-4">
            <p className="text-destructive text-sm text-center">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <Card className="w-full border-primary/30 bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-primary text-lg">
              Resultado del Calculo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-2 gap-4">
              <ResultItem
                label="Area Total"
                value={result.area_m2}
                unit="m2"
              />
              <ResultItem
                label="Blocks"
                value={result.blocks}
                unit="unidades"
              />
              <ResultItem
                label="Cemento"
                value={result.cemento}
                unit="fundas"
              />
              <ResultItem
                label="Arena"
                value={result.arena}
                unit="m3"
              />
              <ResultItem
                label="Varillas"
                value={result.varillas}
                unit="unidades"
                className="col-span-2"
              />
            </div>
            {result.explicacion && (
              <div className="mt-6 p-4 rounded-lg bg-secondary/50 border border-border">
                <p className="text-sm font-medium text-foreground mb-1">
                  Explicacion:
                </p>
                <p className="text-sm text-muted-foreground">
                  {result.explicacion}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ResultItem({
  label,
  value,
  unit,
  className = "",
}: {
  label: string;
  value: number;
  unit: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center p-4 rounded-lg bg-secondary/50 border border-border ${className}`}
    >
      <span className="text-2xl font-bold text-foreground">
        {typeof value === "number" && !Number.isInteger(value)
          ? value.toFixed(2)
          : value}
      </span>
      <span className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
        {unit}
      </span>
      <span className="text-sm text-primary font-medium mt-1">{label}</span>
    </div>
  );
}
