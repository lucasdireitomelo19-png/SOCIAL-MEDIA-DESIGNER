# Renove Brechó — Ecommerce

Loja online para um brechó, construída do zero com Next.js. Tem uma loja pública (catálogo,
carrinho, checkout com Pix/cartão via Mercado Pago) e um painel de administração protegido por
login (cadastro de peças com fotos, gestão de pedidos e um dashboard com insights de vendas).

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS 4
- **Prisma ORM** com **Postgres** (funciona com qualquer Postgres — local, Netlify DB, Railway,
  Supabase, etc, veja "Indo para produção" abaixo)
- **Sessão de admin própria** (cookie assinado com JWT via `jose` + `bcryptjs`), sem depender de
  serviço externo
- **Mercado Pago** (Checkout Pro) para pagamento via Pix/cartão
- **Recharts** para os gráficos do dashboard
- **Zustand** para o carrinho (guardado no navegador do cliente)

## Rodando localmente

Você precisa de um Postgres rodando (local ou um banco gratuito na nuvem, ex: criar já um banco no
[Netlify DB](https://docs.netlify.com/build/data-and-storage/netlify-db/) ou no
[Neon](https://neon.tech) e usar a connection string dele).

```bash
npm install
cp .env.example .env   # preencha DATABASE_URL, SESSION_SECRET (veja abaixo) e, se quiser pagamento real, o Mercado Pago
npx prisma migrate dev # cria as tabelas no banco
npm run db:seed        # cria categorias, peças de exemplo e o usuário admin
npm run dev
```

Gere o `SESSION_SECRET` com:

```bash
openssl rand -base64 32
```

Acesse:

- Loja: http://localhost:3000
- Painel admin: http://localhost:3000/admin/login

O login do admin criado pelo seed é `admin@renovebrecho.com.br` / `TrocarSenha123!` (ou os valores
de `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` no seu `.env`). **Troque a senha assim que possível** —
hoje isso é feito direto no banco (não há tela de "trocar senha" ainda); dá pra gerar um novo hash
com bcrypt e atualizar a tabela `Admin`, ou simplesmente rodar o seed de novo com outra senha.

## Configurando o Mercado Pago

1. Crie uma conta/aplicação em https://www.mercadopago.com.br/developers/panel/app
2. Copie o **Access Token** (de teste ou produção) para `MERCADOPAGO_ACCESS_TOKEN`
3. Copie a **Public Key** para `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`
4. Defina `NEXT_PUBLIC_SITE_URL` com a URL pública do site (o Mercado Pago usa isso para redirecionar
   o cliente de volta e para enviar a notificação de pagamento)

Sem essas variáveis configuradas, o checkout continua funcionando (o pedido é criado normalmente),
mas o cliente cai direto na página de "pedido recebido" sem passar pelo pagamento — útil para testar
o site antes de ativar cobranças de verdade.

Peças ficam "Reservadas" assim que o cliente inicia o checkout, e voltam a ficar disponíveis
automaticamente depois de 30 minutos se o pagamento não for concluído (carrinho abandonado).

## Painel administrativo

- **Visão geral**: receita de pedidos pagos, total de pedidos, pedidos aguardando pagamento, peças
  disponíveis, gráfico de receita dos últimos 14 dias, mais vendidos e pedidos recentes.
- **Produtos**: cadastrar, editar e excluir peças (nome, descrição, preço, tamanho, marca,
  condição, categoria, fotos, destaque na home). Peças já vendidas não podem ser excluídas
  (evita perder o histórico do pedido) — marque como "Vendido" em vez disso.
- **Pedidos**: lista de pedidos com status, e uma tela de detalhe para atualizar o status
  (aguardando pagamento → pago → enviado → entregue, ou cancelado).

Fotos enviadas pelo admin escolhem automaticamente onde guardar o arquivo, dependendo de onde o
app está rodando:

- **Na Vercel**: usa [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) — a foto fica numa
  URL própria da CDN deles. Nenhuma configuração extra é necessária.
- **No Netlify**: usa [Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/),
  servida pela rota `/api/uploads/[arquivo]`. Também automático.
- **Em qualquer outro lugar** (local, Railway, Docker, VPS): salva em disco, por padrão em
  `public/uploads/`, também servida por `/api/uploads/[arquivo]`. Se o host tiver um volume
  persistente (ex: Railway), aponte a variável `UPLOAD_DIR` para um caminho dentro dele, assim as
  fotos sobrevivem a redeploys.

## Estrutura do projeto

```
src/
  app/
    (site)/            loja pública (home, /produtos, /carrinho, /checkout, /pedido/*)
    admin/
      login/            tela de login (fora do grupo protegido)
      (protected)/       dashboard, /produtos, /pedidos — protegidos por sessão
    api/mercadopago/webhook/  notificações de pagamento
  actions/              Server Actions (auth, produtos, pedidos, checkout)
  components/           componentes de UI (site/ e admin/)
  lib/                  Prisma client, sessão/autenticação, integração com Mercado Pago
  store/                carrinho (zustand, persistido no navegador)
prisma/
  schema.prisma         modelos (Admin, Category, Product, ProductImage, Order, OrderItem)
  seed.ts                dados iniciais (categorias, peças de exemplo, admin)
```

## Indo para produção

O projeto foi construído para ser portável — roda em qualquer host Node.js/Postgres. O caminho
mais rápido é publicar na **Vercel** com o botão abaixo.

### Deploy na Vercel (mais rápido)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Flucasdireitomelo19-png%2Frenove-brecho&env=SESSION_SECRET%2CDATABASE_URL&envDescription=SESSION_SECRET%3A+gere+com+openssl+rand+-base64+32.+DATABASE_URL%3A+connection+string+de+um+banco+Postgres+%28veja+abaixo+como+criar+um+gr%C3%A1tis%29.&envLink=https%3A%2F%2Fgithub.com%2Flucasdireitomelo19-png%2Frenove-brecho%23readme&project-name=renove-brecho&repository-name=renove-brecho)

Antes de clicar, crie um banco Postgres gratuito (leva ~1 minuto, não precisa cartão):

1. Acesse [neon.tech](https://neon.tech) → crie uma conta (dá pra entrar com GitHub) → crie um
   projeto/banco novo.
2. Copie a **connection string** que ele mostra (começa com `postgresql://...`).

Agora clique no botão **"Deploy with Vercel"** acima:

3. Conecte sua conta GitHub (se for a primeira vez).
4. Na tela de configuração, a Vercel vai pedir os valores de duas variáveis:
   - `SESSION_SECRET` → gere com `openssl rand -base64 32` (ou qualquer texto aleatório longo)
   - `DATABASE_URL` → cole a connection string do Neon que você copiou
5. Clique em **Deploy**. As migrations e o seed do banco rodam automaticamente durante o build
   (configurado no `vercel.json`) — não precisa rodar nenhum comando à parte.
6. Fotos de produto: também automático — o app detecta que está na Vercel e usa o **Vercel Blob**
   (é ativado sozinho na primeira vez que uma foto é enviada; se pedir para "criar um Blob store",
   aceite).
7. A URL pública do site (`NEXT_PUBLIC_SITE_URL`) também é resolvida automaticamente pela Vercel —
   só defina essa variável manualmente se quiser usar um domínio próprio.

### Outras opções de hospedagem

O app também roda em qualquer ambiente Node.js tradicional (Railway, Netlify, Fly.io, VPS com
Docker, etc) — nesse caso, use um Postgres qualquer (o do próprio provedor, ou Neon/Supabase) e,
se o host tiver disco persistente, aponte `UPLOAD_DIR` para dentro dele (veja "Painel
administrativo" acima). O repositório já inclui `railway.json` e `netlify.toml` configurados para
essas plataformas, caso prefira usá-las.

- **Domínio e variáveis de ambiente**: atualize `NEXT_PUBLIC_SITE_URL` para a URL final do site —
  ela é usada nas URLs de retorno do Mercado Pago.
- **Marca**: nome, descrição, WhatsApp, e-mail e Instagram do brechó ficam centralizados em
  `src/lib/site-config.ts` — é só editar esse arquivo.
