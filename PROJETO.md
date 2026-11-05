# Bingo da Oficina

## Equipe
- Engenharia da Computação (UniSapiens)
- Sistemas da Informação (UniSapiens)

## Pedido original
Crie um bingo para a oficina. Ao entrar, a pessoa digita o apelido e recebe uma cartela 4x4 sorteada de uma lista de 30 frases da oficina, como "alguém disse deploy", "o build quebrou", "a IA pediu permissão" e "commit com mensagem engraçada". Ela marca as casas clicando. Quando completar uma linha, coluna ou diagonal, mostre um aviso de BINGO e registre no Supabase o apelido e a hora. Crie as tabelas players e bingos e mostre o SQL antes de aplicar. A cartela marcada fica salva para não sumir ao recarregar.

Em todas as páginas, coloque um botão fixo "Equipe" no canto inferior direito que abre um modal com os participantes no formato Nome (Faculdade). Use os nomes da linha Equipe acima e guarde a lista em src/equipe.ts.

Stack: Next.js (App Router) com TypeScript e Tailwind, banco no Supabase e deploy na Vercel. Antes de enviar, rode npm run build e corrija os erros. Chaves do Supabase só em variáveis de ambiente.

## Como funciona
- `src/lib/frases.ts`: as 30 frases, o sorteio da cartela e a checagem de linha/coluna/diagonal.
- `src/components/Bingo.tsx`: tela de apelido, cartela e aviso de BINGO. Estado salvo no `localStorage` (`bingo-oficina-v1`).
- Supabase: `players` (id, apelido, created_at) e `bingos` (id, player_id, apelido, created_at). O navegador só insere (RLS), não lê.
- `src/components/BotaoEquipe.tsx`: botão fixo "Equipe" no layout, lista vinda de `src/equipe.ts`.

## Pronto quando
- [ ] Ao entrar, a pessoa digita o apelido e recebe uma cartela 4x4.
- [ ] A cartela é sorteada de uma lista de 30 frases da oficina.
- [ ] A pessoa marca as casas clicando.
- [ ] Ao completar linha, coluna ou diagonal aparece o aviso de BINGO.
- [ ] O BINGO fica registrado no Supabase com apelido e hora.
- [ ] Existem as tabelas `players` e `bingos` (SQL mostrado antes de aplicar), com RLS.
- [ ] A cartela marcada continua lá depois de recarregar.
- [ ] Botão fixo "Equipe" no canto inferior direito em todas as páginas, abrindo modal com Nome (Faculdade).
- [ ] Lista da equipe em `src/equipe.ts`.
- [ ] `npm run build` passa e o app está publicado na Vercel.
- [ ] Chaves do Supabase só em variáveis de ambiente.
