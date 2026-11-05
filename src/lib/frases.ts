export const FRASES: string[] = [
  "alguém disse deploy",
  "o build quebrou",
  "a IA pediu permissão",
  "commit com mensagem engraçada",
  "o Wi-Fi caiu",
  "alguém esqueceu o ponto e vírgula",
  "\"na minha máquina funciona\"",
  "apareceu erro de CORS",
  "alguém falou \"é só um detalhe\"",
  "o npm install demorou",
  "deu erro de tipo no TypeScript",
  "alguém abriu o DevTools",
  "o celular virou tela de teste",
  "alguém pediu café",
  "a variável de ambiente sumiu",
  "alguém deu Ctrl+Z demais",
  "o link da Vercel foi compartilhado",
  "alguém falou \"Supabase\"",
  "apareceu um erro 404",
  "alguém riu do nome de uma variável",
  "o Tailwind salvou o layout",
  "alguém perguntou \"qual é a senha?\"",
  "a IA escreveu código demais",
  "alguém disse \"vou só testar rapidinho\"",
  "o terminal ficou vermelho",
  "alguém mostrou o projeto no celular",
  "um console.log ficou esquecido",
  "alguém falou \"RLS\"",
  "o push foi rejeitado",
  "alguém comemorou o deploy",
];

export function sortearCartela(lista: string[] = FRASES): string[] {
  const copia = [...(lista.length >= 16 ? lista : FRASES)];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia.slice(0, 16);
}

// Lê a lista atual do Supabase. Se falhar ou tiver menos de 16, usa a lista padrão.
export async function buscarFrases(): Promise<string[]> {
  const { supabase } = await import("./supabase");
  if (!supabase) return FRASES;
  const { data, error } = await supabase.from("frases").select("texto").order("id");
  if (error || !data || data.length < 16) return FRASES;
  return data.map((f) => f.texto as string);
}

const N = 4;
const LINHAS: number[][] = [
  ...Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => r * N + c)),
  ...Array.from({ length: N }, (_, c) => Array.from({ length: N }, (_, r) => r * N + c)),
  Array.from({ length: N }, (_, i) => i * N + i),
  Array.from({ length: N }, (_, i) => i * N + (N - 1 - i)),
];

// Devolve as casas que formam linha, coluna ou diagonal completa.
export function casasVencedoras(marcadas: boolean[]): Set<number> {
  const vencedoras = new Set<number>();
  for (const linha of LINHAS) {
    if (linha.every((i) => marcadas[i])) linha.forEach((i) => vencedoras.add(i));
  }
  return vencedoras;
}
