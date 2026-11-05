"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";

type Resultado = { ok: true; mensagem: string } | { ok: false; mensagem: string };

const resumo = (s: string) => createHash("sha256").update(s).digest();

async function senhaConfere(senha: unknown): Promise<boolean> {
  const certa = process.env.FRASES_SENHA;
  // Atraso fixo para dificultar tentativas em sequência.
  await new Promise((r) => setTimeout(r, 400));
  if (!certa || typeof senha !== "string") return false;
  return timingSafeEqual(resumo(senha), resumo(certa));
}

export async function verificarSenha(senha: string): Promise<Resultado> {
  if (!process.env.FRASES_SENHA) return { ok: false, mensagem: "A senha ainda não foi configurada no servidor." };
  return (await senhaConfere(senha)) ? { ok: true, mensagem: "" } : { ok: false, mensagem: "Senha incorreta." };
}

export async function salvarFrases(senha: string, frases: string[]): Promise<Resultado> {
  if (!(await senhaConfere(senha))) return { ok: false, mensagem: "Senha incorreta." };
  if (!Array.isArray(frases)) return { ok: false, mensagem: "Lista inválida." };

  const limpas: string[] = [];
  const vistas = new Set<string>();
  for (const f of frases) {
    if (typeof f !== "string") continue;
    const texto = f.trim().replace(/\s+/g, " ");
    if (!texto) continue;
    if (texto.length > 80) return { ok: false, mensagem: `Frase muito longa (máx. 80): "${texto.slice(0, 30)}…"` };
    const chave = texto.toLowerCase();
    if (vistas.has(chave)) continue;
    vistas.add(chave);
    limpas.push(texto);
  }
  if (limpas.length < 16) return { ok: false, mensagem: `A cartela precisa de pelo menos 16 frases (tem ${limpas.length}).` };
  if (limpas.length > 200) return { ok: false, mensagem: "Máximo de 200 frases." };

  const admin = supabaseAdmin();
  if (!admin) return { ok: false, mensagem: "Servidor sem SUPABASE_SERVICE_ROLE_KEY configurada." };
  const { error } = await admin.rpc("substituir_frases", { novas: limpas });
  if (error) return { ok: false, mensagem: "Erro ao salvar no banco." };
  return { ok: true, mensagem: `${limpas.length} frases salvas. Valem para as próximas cartelas.` };
}
