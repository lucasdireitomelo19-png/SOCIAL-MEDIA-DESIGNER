# Brechó Online

Loja online de brechó com site público (catálogo, carrinho e checkout) e área
administrativa (insights de vendas, gestão de pedidos e cadastro de produtos).

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- [Prisma 7](https://www.prisma.io) + SQLite (banco em arquivo, sem infra externa)
- [NextAuth 5](https://authjs.dev) (Credentials) para login do admin
- [Zustand](https://zustand.docs.pmnd.rs) (carrinho, persistido no navegador)
- [Recharts](https://recharts.org) (gráfico de receita no dashboard)

## Funcionalidades

**Site público**
- Catálogo de produtos com filtro por categoria e busca
- Página de produto com fotos, descrição, estado de conservação e estoque
- Carrinho persistente (localStorage) e checkout com dados do cliente
- Confirmação de pedido (pagamento e entrega são combinados com a loja depois)

**Área administrativa** (`/admin`, protegida por login)
- Dashboard com receita total, ticket médio, pedidos por status, gráfico de
  receita dos últimos 14 dias, mais vendidos e alerta de estoque baixo
- Gestão de pedidos: listar, ver detalhes do cliente/entrega e atualizar status
  (pendente → pago → enviado → entregue / cancelado)
- Cadastro e edição de produtos (nome, preço, categoria, tamanho, estado de
  conservação, imagens, estoque, visibilidade na loja)

## Como rodar localmente

```bash
npm install
cp .env.example .env      # ajuste as variáveis se quiser
npx prisma migrate dev    # cria o banco SQLite e as tabelas
npx prisma db seed        # cria o admin e produtos de exemplo
npm run dev
```

Acesse:
- Loja: http://localhost:3000
- Admin: http://localhost:3000/admin/login

**Login padrão do admin** (definido no seed, troque depois de entrar):
- E-mail: `admin@brecho.com`
- Senha: `brecho123`

## Variáveis de ambiente

Veja `.env.example`. As principais:

| Variável | Descrição |
| --- | --- |
| `DATABASE_URL` | Caminho do arquivo SQLite (padrão `file:./dev.db`) |
| `NEXTAUTH_SECRET` | Segredo usado para assinar a sessão do admin. **Gere um valor novo em produção** (`openssl rand -base64 32`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | Usados apenas pelo script de seed para criar o primeiro usuário admin |

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Ambiente de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Sobe o build de produção |
| `npm run lint` | ESLint |
| `npx prisma migrate dev` | Aplica migrações do banco |
| `npx prisma db seed` | Recria o admin e os produtos de exemplo |
| `npx prisma studio` | Interface visual para o banco |

## Estrutura

```
src/
  app/
    (site)/          # loja pública: home, produtos, carrinho, checkout, pedido
    admin/
      login/         # login do admin (fora da área protegida)
      (dashboard)/   # dashboard, produtos e pedidos (protegido por sessão)
    api/             # rotas REST (pedidos e produtos)
  components/
    site/            # componentes da loja pública
    admin/           # componentes da área admin
  lib/               # prisma, auth, insights, formatação, carrinho (zustand)
prisma/
  schema.prisma      # modelos: Product, Order, OrderItem, AdminUser
  seed.ts            # cria admin + produtos de exemplo
```

## Notas sobre o modelo de negócio

Como é uma loja de brechó (peças únicas/estoque limitado), o checkout não
processa pagamento online: o cliente preenche seus dados e o pedido é criado
com status "pendente". A loja combina pagamento e entrega diretamente com o
cliente pelo telefone informado, e atualiza o status do pedido pela área
admin conforme o processo avança.
