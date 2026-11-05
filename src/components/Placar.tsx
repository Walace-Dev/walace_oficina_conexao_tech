"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Linha = { id: number; apelido: string; created_at: string };
type Estado = "carregando" | "ao-vivo" | "reconectando" | "erro" | "sem-config";

const hora = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "America/Porto_Velho",
});

export default function Placar() {
  const [bingos, setBingos] = useState<Linha[]>([]);
  const [estado, setEstado] = useState<Estado>(supabase ? "carregando" : "sem-config");

  useEffect(() => {
    const sb = supabase;
    if (!sb) return;
    let ativo = true;

    const juntar = (novas: Linha[]) =>
      setBingos((atuais) => {
        const porId = new Map(atuais.map((b) => [b.id, b]));
        for (const n of novas) porId.set(n.id, n);
        return [...porId.values()].sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id - b.id);
      });

    const carregar = async () => {
      const { data, error } = await sb
        .from("bingos")
        .select("id, apelido, created_at")
        .order("created_at", { ascending: true })
        .limit(1000);
      if (!ativo) return;
      if (error) setEstado("erro");
      else juntar(data as Linha[]);
    };

    const canal = sb
      .channel("placar-bingos")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bingos" }, (payload) => {
        const n = payload.new as Linha;
        juntar([{ id: n.id, apelido: n.apelido, created_at: n.created_at }]);
      })
      .subscribe((status) => {
        if (!ativo) return;
        if (status === "SUBSCRIBED") {
          setEstado("ao-vivo");
          carregar(); // recarrega ao (re)conectar para não perder nada
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          setEstado("reconectando");
        }
      });

    return () => {
      ativo = false;
      sb.removeChannel(canal);
    };
  }, []);

  // Uma posição por pessoa: vale o primeiro BINGO; conta quantos ela fez.
  const ranking = useMemo(() => {
    const porNome = new Map<string, { apelido: string; primeiro: string; total: number }>();
    for (const b of bingos) {
      const chave = b.apelido.trim().toLowerCase();
      const atual = porNome.get(chave);
      if (atual) atual.total += 1;
      else porNome.set(chave, { apelido: b.apelido, primeiro: b.created_at, total: 1 });
    }
    return [...porNome.values()];
  }, [bingos]);

  return (
    <section className="mt-6 sm:mt-10">
      <p className="text-center text-sm text-slate-400 sm:text-xl" aria-live="polite">
        {estado === "carregando" && "Conectando…"}
        {estado === "ao-vivo" && (
          <span className="inline-flex items-center gap-2">
            <span className="size-2.5 animate-pulse rounded-full bg-emerald-400" aria-hidden /> Ao vivo
          </span>
        )}
        {estado === "reconectando" && "Reconectando…"}
        {estado === "erro" && "Não foi possível carregar o placar."}
        {estado === "sem-config" && "Supabase não configurado."}
      </p>

      {ranking.length === 0 ? (
        <p className="mt-16 text-center text-xl text-slate-300 sm:text-4xl">Ninguém fez BINGO ainda. Quem vai ser o primeiro?</p>
      ) : (
        <ol className="mt-6 space-y-2 sm:space-y-3">
          {ranking.map((r, i) => (
            <li
              key={r.apelido.toLowerCase()}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 sm:gap-6 sm:px-6 sm:py-4 ${
                i === 0 ? "bg-amber-300 text-slate-950" : i < 3 ? "bg-slate-700" : "bg-slate-800"
              }`}
            >
              <span className="w-10 shrink-0 text-2xl font-black tabular-nums sm:w-20 sm:text-5xl">{i + 1}º</span>
              <span className="min-w-0 flex-1 truncate text-xl font-bold sm:text-4xl">{r.apelido}</span>
              {r.total > 1 && (
                <span className="shrink-0 text-sm font-semibold opacity-80 sm:text-2xl">×{r.total}</span>
              )}
              <span className="shrink-0 font-mono text-sm tabular-nums opacity-80 sm:text-2xl">
                {hora.format(new Date(r.primeiro))}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
