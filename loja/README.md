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

Fotos enviadas pelo admin são servidas pela rota `/api/uploads/[arquivo]`, que escolhe automaticamente
onde guardar o arquivo:

- **Rodando no Netlify**: usa [Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/)
  automaticamente — nenhuma configuração extra é necessária, e funciona mesmo sem disco persistente.
- **Em qualquer outro lugar** (local, Railway, Docker, VPS): salva em disco, por padrão em
  `public/uploads/`. Se o host tiver um volume persistente (ex: Railway), aponte a variável
  `UPLOAD_DIR` para um caminho dentro dele, assim as fotos sobrevivem a redeploys.

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

O projeto foi construído para ser portável, mas o caminho mais simples (uma conta só, sem
configurar banco/storage externos separadamente) é publicar no **Netlify**:

### Deploy no Netlify

1. Acesse [netlify.com](https://netlify.com) e conecte sua conta GitHub.
2. **Add new site** → **Import an existing project** → selecione o repositório
   `SOCIAL-MEDIA-DESIGNER`.
3. Em **Base directory**, coloque `loja` (o app Next.js fica dentro dessa pasta do repositório).
   O `netlify.toml` já configurado nessa pasta cuida do build (`@netlify/plugin-nextjs`).
4. Antes do primeiro deploy (ou depois, em **Site configuration → Environment variables**),
   defina:
   - `SESSION_SECRET` — gere com `openssl rand -base64 32`
   - `NEXT_PUBLIC_SITE_URL` — a URL que o Netlify vai te dar (ex: `https://seu-site.netlify.app`);
     dá pra ajustar depois do primeiro deploy quando você souber a URL final
   - Opcional: `MERCADOPAGO_ACCESS_TOKEN` e `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` para pagamento real
5. **Banco de dados**: no dashboard do site, vá em **Extensions** (ou **Integrations**) → ative o
   **Netlify DB**. Ele provisiona um Postgres (Neon) e injeta a variável `NETLIFY_DATABASE_URL`
   automaticamente — o app já sabe usar essa variável, nenhuma configuração extra é necessária.
6. **Fotos dos produtos**: não precisa fazer nada — o app detecta que está no Netlify e usa o
   Netlify Blobs automaticamente.
7. Depois do primeiro deploy, rode as migrations e o seed contra o banco de produção. O jeito mais
   simples é rodar localmente apontando para a `NETLIFY_DATABASE_URL` (copie o valor do dashboard
   do Netlify para o seu `.env` local temporariamente):
   ```bash
   DATABASE_URL="<a NETLIFY_DATABASE_URL copiada>" npx prisma migrate deploy
   DATABASE_URL="<a NETLIFY_DATABASE_URL copiada>" npm run db:seed
   ```

### Outras opções de hospedagem

O app também roda em qualquer ambiente Node.js tradicional (Railway, Fly.io, VPS com Docker, etc) —
nesse caso, use um Postgres qualquer (o do próprio provedor, ou Neon/Supabase) e, se o host tiver
disco persistente, aponte `UPLOAD_DIR` para dentro dele (veja "Painel administrativo" acima).

- **Domínio e variáveis de ambiente**: atualize `NEXT_PUBLIC_SITE_URL` para a URL final do site —
  ela é usada nas URLs de retorno do Mercado Pago.
- **Marca**: nome, descrição, WhatsApp, e-mail e Instagram do brechó ficam centralizados em
  `src/lib/site-config.ts` — é só editar esse arquivo.
