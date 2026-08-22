# Renove Brechó — Ecommerce

Loja online para um brechó, construída do zero com Next.js. Tem uma loja pública (catálogo,
carrinho, checkout com Pix/cartão via Mercado Pago) e um painel de administração protegido por
login (cadastro de peças com fotos, gestão de pedidos e um dashboard com insights de vendas).

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS 4
- **Prisma ORM** com SQLite local (portável — dá pra trocar para um banco hospedado sem mudar o
  código, veja "Indo para produção" abaixo)
- **Sessão de admin própria** (cookie assinado com JWT via `jose` + `bcryptjs`), sem depender de
  serviço externo
- **Mercado Pago** (Checkout Pro) para pagamento via Pix/cartão
- **Recharts** para os gráficos do dashboard
- **Zustand** para o carrinho (guardado no navegador do cliente)

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha SESSION_SECRET (veja abaixo) e, se quiser pagamento real, o Mercado Pago
npx prisma migrate dev # cria o banco SQLite local
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

Fotos enviadas pelo admin são salvas em `public/uploads/`. **Isso funciona bem em um servidor
tradicional (Docker, VPS), mas não persiste em plataformas serverless como a Vercel** — nesse caso,
o próximo passo natural é trocar esse upload local por um serviço como Cloudinary, S3 ou Vercel
Blob (ver "Indo para produção").

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

O projeto foi construído para ser portável — sem travar você em uma hospedagem específica:

- **Banco de dados**: hoje usa SQLite local (`file:./dev.db`) através de um driver adapter
  (`@prisma/adapter-libsql`). Para produção, basta apontar `DATABASE_URL` para um banco
  [Turso](https://turso.tech) (mesmo formato libsql, sem mudar código) ou trocar o adapter do
  Prisma para Postgres/MySQL se preferir outro provedor.
- **Hospedagem do site**: qualquer ambiente Node.js funciona (Vercel, Railway, Fly.io, VPS com
  Docker, etc). Se optar por uma plataforma serverless (Vercel), lembre de resolver o upload de
  imagens (item acima) antes de ir ao ar.
- **Domínio e variáveis de ambiente**: atualize `NEXT_PUBLIC_SITE_URL` para a URL final do site —
  ela é usada nas URLs de retorno do Mercado Pago.
- **Marca**: nome, descrição, WhatsApp, e-mail e Instagram do brechó ficam centralizados em
  `src/lib/site-config.ts` — é só editar esse arquivo.
