import JogoCliente from "@/components/JogoCliente";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-6 pb-24">
      <h1 className="text-center text-3xl font-black tracking-tight">
        Bingo da <span className="text-amber-300">Oficina</span>
      </h1>
      <p className="mt-1 text-center text-sm text-slate-400">Conexão Tech.RO</p>
      <JogoCliente />
    </main>
  );
}
