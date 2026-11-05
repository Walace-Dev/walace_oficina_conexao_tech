"use client";

import { useEffect, useState } from "react";
import { casasVencedoras, sortearCartela } from "@/lib/frases";
import { supabase } from "@/lib/supabase";

const CHAVE = "bingo-oficina-v1";

type Jogo = {
  id: string;
  apelido: string;
  cartela: string[];
  marcadas: boolean[];
  bingoSalvo: boolean;
};

type Envio = "parado" | "enviando" | "ok" | "erro";

function carregar(): Jogo | null {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return null;
    const jogo = JSON.parse(bruto) as Jogo;
    if (jogo?.cartela?.length !== 16 || jogo?.marcadas?.length !== 16) return null;
    return jogo;
  } catch {
    return null;
  }
}

function novoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  // Alternativa para navegadores sem randomUUID (ex.: http em rede local).
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(16),
  );
}

async function registrarJogador(id: string, apelido: string) {
  if (!supabase) throw new Error("Supabase não configurado");
  const { error } = await supabase
    .from("players")
    .upsert({ id, apelido }, { onConflict: "id", ignoreDuplicates: true });
  if (error) throw error;
}

async function registrarBingo(id: string, apelido: string) {
  if (!supabase) throw new Error("Supabase não configurado");
  // Garante o jogador antes (caso o cadastro inicial tenha falhado).
  await registrarJogador(id, apelido);
  const { error } = await supabase.from("bingos").insert({ player_id: id, apelido });
  if (error) throw error;
}

export default function Bingo() {
  const [jogo, setJogo] = useState<Jogo | null>(carregar);
  const [apelido, setApelido] = useState("");
  const [envio, setEnvio] = useState<Envio>("parado");
  const [avisoAberto, setAvisoAberto] = useState(false);

  useEffect(() => {
    try {
      if (jogo) localStorage.setItem(CHAVE, JSON.stringify(jogo));
      else localStorage.removeItem(CHAVE);
    } catch {
      // Sem localStorage (aba anônima, por exemplo): o jogo segue sem salvar.
    }
  }, [jogo]);

  function entrar(e: React.FormEvent) {
    e.preventDefault();
    const nome = apelido.trim().slice(0, 30);
    if (!nome) return;
    const id = novoId();
    setJogo({
      id,
      apelido: nome,
      cartela: sortearCartela(),
      marcadas: Array(16).fill(false),
      bingoSalvo: false,
    });
    registrarJogador(id, nome).catch(() => {
      // Tentamos de novo na hora do BINGO.
    });
  }

  async function salvarBingo(atual: Jogo) {
    setEnvio("enviando");
    try {
      await registrarBingo(atual.id, atual.apelido);
      setEnvio("ok");
      setJogo((j) => (j ? { ...j, bingoSalvo: true } : j));
    } catch {
      setEnvio("erro");
    }
  }

  function alternar(i: number) {
    if (!jogo) return;
    const marcadas = jogo.marcadas.map((m, k) => (k === i ? !m : m));
    const atual = { ...jogo, marcadas };
    setJogo(atual);
    const fezBingo = casasVencedoras(marcadas).size > 0;
    if (fezBingo && !jogo.bingoSalvo && envio !== "enviando" && casasVencedoras(jogo.marcadas).size === 0) {
      setAvisoAberto(true);
      salvarBingo(atual);
    }
  }

  function novaCartela() {
    if (!jogo) return;
    setJogo({ ...jogo, cartela: sortearCartela(), marcadas: Array(16).fill(false), bingoSalvo: false });
    setEnvio("parado");
    setAvisoAberto(false);
  }

  function sair() {
    if (!confirm("Sair e apagar sua cartela deste aparelho?")) return;
    setJogo(null);
    setApelido("");
    setEnvio("parado");
    setAvisoAberto(false);
  }

  if (!jogo) {
    return (
      <form onSubmit={entrar} className="mt-10 rounded-2xl bg-slate-800/70 p-5 ring-1 ring-slate-700">
        <label htmlFor="apelido" className="block text-sm font-semibold text-slate-200">
          Qual é o seu apelido?
        </label>
        <input
          id="apelido"
          name="apelido"
          autoComplete="nickname"
          maxLength={30}
          required
          value={apelido}
          onChange={(e) => setApelido(e.target.value)}
          placeholder="ex.: Dev Noturno"
          className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-amber-300 focus:outline-none"
        />
        <button
          type="submit"
          className="mt-4 w-full rounded-xl bg-amber-300 py-3 font-bold text-slate-950 transition hover:bg-amber-200 disabled:opacity-50"
          disabled={!apelido.trim()}
        >
          Pegar minha cartela
        </button>
        <p className="mt-3 text-xs text-slate-400">
          Você recebe 16 frases sorteadas. Marque quando acontecerem na oficina.
        </p>
      </form>
    );
  }

  const vencedoras = casasVencedoras(jogo.marcadas);
  const temBingo = vencedoras.size > 0;
  const pendente = temBingo && !jogo.bingoSalvo;

  return (
    <section className="mt-5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <p className="truncate">
          Jogando como <strong className="text-amber-300">{jogo.apelido}</strong>
        </p>
        <button type="button" onClick={sair} className="shrink-0 text-slate-400 underline hover:text-white">
          Sair
        </button>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1.5" aria-label="Cartela de bingo">
        {jogo.cartela.map((frase, i) => {
          const marcada = jogo.marcadas[i];
          const vence = vencedoras.has(i);
          return (
            <button
              key={i}
              type="button"
              aria-pressed={marcada}
              onClick={() => alternar(i)}
              className={`flex aspect-square items-center justify-center rounded-lg p-1 text-center text-[11px] leading-tight font-semibold transition select-none sm:text-xs ${
                vence
                  ? "bg-emerald-400 text-slate-950 ring-2 ring-emerald-200"
                  : marcada
                    ? "bg-amber-300 text-slate-950"
                    : "bg-slate-800 text-slate-100 ring-1 ring-slate-700 hover:bg-slate-700"
              }`}
            >
              <span className="hyphens-auto break-words" lang="pt-BR">
                {frase}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-2 text-sm" aria-live="polite">
        {temBingo && jogo.bingoSalvo && (
          <p className="rounded-lg bg-emerald-950 px-3 py-2 text-emerald-200">BINGO registrado! 🎉</p>
        )}
        {pendente && envio === "enviando" && (
          <p className="rounded-lg bg-slate-800 px-3 py-2 text-slate-200">Registrando seu BINGO…</p>
        )}
        {pendente && envio !== "enviando" && (
          <div className="flex items-center justify-between gap-2 rounded-lg bg-red-950 px-3 py-2 text-red-200">
            <span>Não deu para registrar o BINGO.</span>
            <button type="button" onClick={() => salvarBingo(jogo)} className="font-bold underline">
              Tentar de novo
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={novaCartela}
        className="mt-4 w-full rounded-xl border border-slate-600 py-3 font-semibold text-slate-200 hover:bg-slate-800"
      >
        Nova cartela
      </button>

      {avisoAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          onClick={() => setAvisoAberto(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="titulo-bingo"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs animate-[pulse_1s_ease-in-out_2] rounded-3xl bg-amber-300 p-6 text-center text-slate-950 shadow-2xl"
          >
            <p id="titulo-bingo" className="text-5xl font-black tracking-tight">
              BINGO!
            </p>
            <p className="mt-2 font-semibold">Parabéns, {jogo.apelido}!</p>
            <p className="mt-1 text-sm">
              {envio === "enviando" && "Registrando…"}
              {envio === "ok" && "Seu BINGO foi registrado."}
              {envio === "erro" && "Falhou ao registrar. Tente de novo abaixo da cartela."}
            </p>
            <button
              type="button"
              autoFocus
              onClick={() => setAvisoAberto(false)}
              className="mt-5 w-full rounded-xl bg-slate-950 py-3 font-bold text-white"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
