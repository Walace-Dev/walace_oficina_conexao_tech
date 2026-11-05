import type { Metadata } from "next";
import EditorFrases from "@/components/EditorFrases";

export const metadata: Metadata = { title: "Frases · Bingo da Oficina", robots: { index: false } };

export default function PaginaFrases() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-6 pb-24">
      <h1 className="text-center text-2xl font-black tracking-tight">Frases do bingo</h1>
      <p className="mt-1 text-center text-sm text-slate-400">Área do instrutor</p>
      <EditorFrases />
    </main>
  );
}
