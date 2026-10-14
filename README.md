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
(cd ../backend && AI_FAKE_FAIL_PLAN_FOR=falha-chromium@e2e.pratoforte.test,falha-webkit@e2e.pratoforte.test docker compose up -d && docker compose exec api php artisan migrate:fresh --seeder=E2ESeeder --force)
docker compose run --rm web npm run e2e
```

O `docker compose up` do backend sobe a fila (`queue`), que gera os planos. `AI_FAKE_FAIL_PLAN_FOR` faz a primeira geração das contas `falha-*` falhar (E2E-07). Os testes mudam o estado das contas: semeie de novo antes de cada rodada.

## Configuração (`.env`)

As variáveis estão documentadas em [`.env.example`](.env.example). Para desenvolver:

```bash
cp .env.example .env.local
```

| Variável | Para quê |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | URL da API Laravel, sem barra no fim. **Obrigatória no `npm run build`**: o build falha sem ela. |
| `SESSION_COOKIE_NAME` | Cookie de sessão do Laravel (`Str::slug(APP_NAME).'-session'`). O proxy usa para abrir as telas logadas. |
| `NEXT_PUBLIC_APP_VERSION` | Opcional. Versão em Configurações; sem ela, a do `package.json`. |
| `MAILPIT_URL` | Só E2E. |

`NEXT_PUBLIC_*` entram no bundle na hora do build: mudou, refaça o build.

## Subir (deploy)

1. **Domínio.** Front e API no mesmo domínio, em subdomínios — ex.: `app.exemplo.com.br` e
   `api.exemplo.com.br`. O login é por cookie (Sanctum SPA) e o proxy do Next precisa ler o
   cookie de sessão; com domínios diferentes (ex.: `*.vercel.app` + outro host) o login não
   para de voltar para `/entrar`.
2. **Front** (Vercel ou `npm run build && npm run start` em um Node 22):
   ```env
   NEXT_PUBLIC_API_URL=https://api.exemplo.com.br
   SESSION_COOKIE_NAME=prato-forte-session
   ```
3. **Backend** (`backend/.env`), apontando de volta para o front:
   ```env
   APP_URL=https://api.exemplo.com.br
   FRONTEND_URL=https://app.exemplo.com.br
   SANCTUM_STATEFUL_DOMAINS=app.exemplo.com.br
   SESSION_DOMAIN=.exemplo.com.br
   SESSION_SECURE_COOKIE=true
   ```
   `FRONTEND_URL` libera o CORS e monta o link do e-mail de redefinir senha; `SESSION_DOMAIN`
   com o ponto faz o cookie valer para os dois subdomínios.


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
