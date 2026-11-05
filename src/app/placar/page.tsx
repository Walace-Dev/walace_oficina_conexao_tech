import type { Metadata } from "next";
import Placar from "@/components/Placar";

export const metadata: Metadata = { title: "Placar · Bingo da Oficina" };

export default function PaginaPlacar() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pt-6 pb-24 sm:px-8 sm:pt-10">
      <h1 className="text-center text-3xl font-black tracking-tight sm:text-6xl">
        Placar do <span className="text-amber-300">BINGO</span>
      </h1>
      <Placar />
    </main>
  );
}
