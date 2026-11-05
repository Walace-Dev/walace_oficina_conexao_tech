"use client";

import dynamic from "next/dynamic";

// O jogo lê o localStorage, então só renderiza no navegador.
const Bingo = dynamic(() => import("./Bingo"), {
  ssr: false,
  loading: () => <p className="mt-10 text-center text-slate-400">Carregando…</p>,
});

export default function JogoCliente() {
  return <Bingo />;
}
