"use client";

import { useState, useTransition } from "react";
import { buscarFrases } from "@/lib/frases";
import { salvarFrases, verificarSenha } from "@/app/frases/actions";

export default function EditorFrases() {
  const [senha, setSenha] = useState("");
  const [liberado, setLiberado] = useState(false);
  const [texto, setTexto] = useState("");
  const [mensagem, setMensagem] = useState<{ ok: boolean; texto: string } | null>(null);
  const [pendente, iniciar] = useTransition();

  const linhas = texto.split("\n").map((l) => l.trim()).filter(Boolean);

  function entrar(e: React.FormEvent) {
    e.preventDefault();
    setMensagem(null);
    iniciar(async () => {
      const r = await verificarSenha(senha);
      if (!r.ok) return setMensagem({ ok: false, texto: r.mensagem });
      setTexto((await buscarFrases()).join("\n"));
      setLiberado(true);
    });
  }

  function salvar() {
    setMensagem(null);
    iniciar(async () => {
      const r = await salvarFrases(senha, linhas);
      setMensagem({ ok: r.ok, texto: r.mensagem });
      if (!r.ok && r.mensagem === "Senha incorreta.") setLiberado(false);
    });
  }

  const aviso = mensagem && (
    <p
      role="status"
      className={`mt-3 rounded-lg px-3 py-2 text-sm ${mensagem.ok ? "bg-emerald-950 text-emerald-200" : "bg-red-950 text-red-200"}`}
    >
      {mensagem.texto}
    </p>
  );

  if (!liberado) {
    return (
      <form onSubmit={entrar} className="mt-8 rounded-2xl bg-slate-800/70 p-5 ring-1 ring-slate-700">
        <label htmlFor="senha" className="block text-sm font-semibold text-slate-200">
          Senha do instrutor
        </label>
        <input
          id="senha"
          type="password"
          autoComplete="current-password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-base text-white focus:border-amber-300 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pendente || !senha}
          className="mt-4 w-full rounded-xl bg-amber-300 py-3 font-bold text-slate-950 hover:bg-amber-200 disabled:opacity-50"
        >
          {pendente ? "Conferindo…" : "Entrar"}
        </button>
        {aviso}
      </form>
    );
  }

  return (
    <section className="mt-6">
      <label htmlFor="lista" className="block text-sm font-semibold text-slate-200">
        Uma frase por linha
      </label>
      <textarea
        id="lista"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={18}
        spellCheck
        className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-3 text-base leading-relaxed text-white focus:border-amber-300 focus:outline-none"
      />
      <p className={`mt-1 text-sm ${linhas.length < 16 ? "text-red-300" : "text-slate-400"}`}>
        {linhas.length} frases {linhas.length < 16 && "(mínimo 16)"}
      </p>
      <button
        type="button"
        onClick={salvar}
        disabled={pendente || linhas.length < 16}
        className="mt-4 w-full rounded-xl bg-amber-300 py-3 font-bold text-slate-950 hover:bg-amber-200 disabled:opacity-50"
      >
        {pendente ? "Salvando…" : "Salvar frases"}
      </button>
      {aviso}
    </section>
  );
}
