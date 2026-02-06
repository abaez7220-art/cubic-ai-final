import { BlueprintAnalyzer } from "@/components/blueprint-analyzer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center px-4 py-12">
      <div className="flex flex-col items-center gap-2 mb-10">
        <h1 className="text-3xl font-bold text-primary tracking-tight text-balance text-center">
          CUBIC AI PRO
        </h1>
        <p className="text-muted-foreground text-sm text-center max-w-md text-pretty">
          Sube un plano de construccion y la IA calculara los materiales que
          necesitas: blocks, cemento, arena y varillas.
        </p>
      </div>
      <BlueprintAnalyzer />
    </main>
  );
}
