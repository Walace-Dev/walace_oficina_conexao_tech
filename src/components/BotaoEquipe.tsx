"use client";

import { useEffect, useRef, useState } from "react";
import { equipe } from "@/equipe";

export default function BotaoEquipe() {
  const [aberto, setAberto] = useState(false);
  const fecharRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aberto) return;
    fecharRef.current?.focus();
    const aoTeclar = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aberto]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="fixed bottom-4 right-4 z-40 rounded-full bg-amber-300 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-black/30 transition hover:bg-amber-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
      >
        Equipe
      </button>

      {aberto && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
          onClick={() => setAberto(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-equipe"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-slate-900 shadow-2xl"
          >
            <h2 id="titulo-equipe" className="text-lg font-bold">
              Equipe
            </h2>
            <ul className="mt-4 space-y-2">
              {equipe.map((pessoa) => (
                <li key={pessoa} className="rounded-lg bg-slate-100 px-3 py-2">
                  {pessoa}
                </li>
              ))}
            </ul>
            <button
              ref={fecharRef}
              type="button"
              onClick={() => setAberto(false)}
              className="mt-6 w-full rounded-lg bg-slate-900 py-3 font-semibold text-white hover:bg-slate-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
