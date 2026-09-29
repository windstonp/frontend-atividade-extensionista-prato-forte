# Prato Forte — frontend

## Rodar (Docker — o WSL não precisa de Node)

```bash
docker compose run --rm web npm ci          # 1ª vez
docker compose up web                        # Next em http://localhost:3000 (API: repo backend, :8000)
docker compose run --rm web npm test         # unit + integração (MSW) + Storybook (Chromium + axe)
docker compose run --rm web npm run lint     # inclui a guarda "sem mocks em produção" (D12)
docker compose run --rm web npm run storybook  # http://localhost:6006
```

E2E (precisa do backend no ar e semeado):
```bash
(cd ../backend && docker compose up -d && docker compose exec api php artisan migrate:fresh --seeder=E2ESeeder --force)
docker compose run --rm web npm run e2e
```


Guia nutricional para quem treina na academia Zfit, em Capivari de Baixo.
Projeto de extensão do curso de Ciência da Computação da UNINTER.

Next.js 16 (App Router) + TypeScript + Tailwind CSS 4.

## Rodando

O `node` deste ambiente está no nvm, fora do PATH padrão:

```bash
export PATH="$HOME/.nvm/versions/node/v22.16.0/bin:$PATH"
npm install
npm run dev
```

## Por onde andar no app

| Rota | Tela |
| --- | --- |
| `/` | Boas-vindas |
| `/onboarding/objetivo` … `/onboarding/resumo` | As 7 etapas, com progresso |
| `/onboarding/gerando` → `/onboarding/pronto` | Geração do plano e resultado |
| `/hoje` | A linha do dia e as metas |
| `/dieta` | A semana e as refeições do dia |
| `/dieta/[refeicao]` | Detalhe da refeição e a folha de substituição |
| `/nutri` | O assistente, com o contexto do plano |
| `/evolucao`, `/evolucao/peso` | Gráfico, constância e registro de peso |
| `/perfil`, `/perfil/preferencias`, `/perfil/configuracoes` | Perfil e ajustes |

## Onde ficam os dados falsos

Tudo passa por **`src/lib/api.ts`**. Cada função tem, no comentário, o endpoint
REST que deve chamar quando o backend existir — trocar o corpo da função é a
única mudança necessária; as telas não sabem de onde vem o dado.

- `src/lib/mock-data.ts` — o conteúdo fictício (perfil, plano do dia, trocas,
  pesagens, constância).
- `src/lib/types.ts` — o modelo de domínio que o backend precisa passar a
  devolver.
- `src/lib/plan-store.tsx` — estado do dia no cliente: marcar refeição, trocar
  alimento, aplicar sugestão do Nutri, desfazer. Persiste em `localStorage`,
  então as trocas sobrevivem ao recarregar a página.

### O que o backend já tem

`POST /users`, `POST /sessions`, `POST /refresh-token`, `POST /password/forgot`,
`POST /password/reset`, `PATCH /users/avatar`, `GET|POST|DELETE /chats`,
`POST /messages/:chat_id`.

### O que falta para sair do mock

1. Entidades de nutrição: perfil/objetivo, preferências, restrições, plano,
   refeição, alimento, substituição, pesagem e adesão.
2. `POST /messages/:chat_id` precisa **devolver a resposta da IA**. Hoje o
   controller consome o stream inteiro e responde `201` sem corpo, então o
   frontend não recebe nada na mesma chamada.

## Design

Os tokens estão em `src/app/globals.css`, no bloco `@theme`: tinta `#15251C`,
papel `#ECEEE7`, gema `#E8A93C` (o único acento), mata `#2F6B47` para "feito" e
alerta `#A8342A` só para erro e alergia. Tipografia: Bricolage Grotesque nos
títulos e números, Instrument Sans na interface.

### Movimento

A camada de animação está no fim de `src/app/globals.css`: os `@keyframes`
`pf-*` e os tokens `--animate-*` do bloco `@theme`, que viram utilitários
(`animate-entra`, `animate-pop`, `animate-halo`, `animate-tique`…). Ajudantes em
`src/lib/motion.ts`:

- `cascata(i, passo, base)` — atraso em cascata para listas.
- `useMontado(atraso)` — liga a transição depois da hidratação, para barra
  encher do zero sem quebrar o HTML do servidor.
- `useContagem` / `<CountUp>` — números que contam até o valor.
- `useNaTela` / `<Reveal>` — revela blocos quando entram na tela.

Cada segmento tem seu próprio `template.tsx`, que remonta a cada navegação: o
app entra subindo, o onboarding entra pela direita.

Tudo passa pelo `prefers-reduced-motion`: com movimento reduzido as animações
terminam na hora, no estado final, e o app continua legível.

A peça que dá identidade é a **linha do dia** (`src/components/app/DayRail.tsx`):
o dia inteiro como um traço vertical, com a próxima refeição aberta na posição
dela. O motivo secundário é a **régua** (`src/components/ui/Rail.tsx`), usada em
macros, peso e progresso.
