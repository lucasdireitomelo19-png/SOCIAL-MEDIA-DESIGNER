# Monitor de promoções → canal de ofertas com link de afiliado

Monitora **Amazon, Mercado Livre e Shopee**, guarda o histórico de preço de cada produto e publica
num **canal do Telegram** só as promoções de verdade, com o seu link de afiliado.

```
buscas (config.toml) → coletores por loja → histórico de preço (SQLite) → detector → canal do Telegram
```

## Como o detector decide o que é promoção

O desconto é calculado contra o **histórico que o próprio monitor coletou**, nunca contra o "de R$" que a
loja anuncia (que costuma ser inflado). Uma oferta só vai pro canal se:

- o produto já é monitorado há pelo menos **3 dias**, com pelo menos **6 coletas** no último mês;
- o preço está pelo menos **15% abaixo do preço normal**. O preço normal é o menor valor entre a mediana
  de 30 dias e a de 90 dias, o que pega o truque de subir o preço antes de "baixar";
- a avaliação é **4.0 ou mais**, quando a loja informa;
- o produto não foi postado nos últimos **7 dias**, a não ser que tenha caído mais 5% desde então.

Cada oferta aprovada recebe uma nota (desconto real, menor preço em 90 dias ou menor preço já visto,
frete grátis, avaliação, volume de vendas). O canal recebe as **5 melhores por execução**.
Todos esses números ficam na seção `[regras]` do `config.toml`.

Exemplo de post:

```
🔥 Air Fryer 4L Antiaderente 1500W

💸 R$ 269,90  (-33%)
Preço normal nas últimas semanas: R$ 401,07
📉 Menor preço que já vimos
🚚 Frete grátis
⭐ 4,7
🏪 Amazon

👉 Ver oferta

Links de afiliado: você não paga nada a mais e ainda apoia o canal 💛
```

## Testar sem nenhuma conta

```bash
cd tools/monitor-promocoes
python -m monitor demo                           # simula 30 dias de histórico e mostra o que seria postado
python -m unittest discover -s tests -t .        # testes
```

Precisa de Python 3.11 ou mais novo, sem nenhuma biblioteca extra.

## Colocar no ar

### 1. Canal e bot do Telegram
1. Crie o canal público (ex.: `@promosdolucas`).
2. No Telegram, fale com o **@BotFather**, envie `/newbot` e guarde o token.
3. Adicione o bot como **administrador** do canal, com permissão de postar.

### 2. Contas de afiliado (as credenciais de cada loja)

| Loja | Onde conseguir | Variáveis |
|---|---|---|
| Amazon | associados.amazon.com.br. O acesso à Product Advertising API só é liberado depois das primeiras vendas qualificadas | `AMAZON_ACCESS_KEY`, `AMAZON_SECRET_KEY`, `AMAZON_PARTNER_TAG` (ex.: `seutag-20`) |
| Mercado Livre | Programa de Afiliados, mais um app em developers.mercadolivre.com.br (o refresh token sai do fluxo OAuth do app) | `ML_CLIENT_ID`, `ML_CLIENT_SECRET`, `ML_REFRESH_TOKEN` |
| Shopee | affiliate.shopee.com.br > Open API | `SHOPEE_APP_ID`, `SHOPEE_SECRET` |

Uma loja sem credenciais fica desligada e o monitor segue com as outras, então dá pra começar só com uma.

No Mercado Livre, copie do painel de afiliados o formato do seu link e coloque em
`[mercadolivre] link_afiliado` no `config.toml`. Use `{url}` onde entra o link do produto.

### 3. GitHub Actions (roda sozinho, de hora em hora)
Em **Settings → Secrets and variables → Actions** do repositório:

- **Secrets**: `TELEGRAM_BOT_TOKEN`, `AMAZON_ACCESS_KEY`, `AMAZON_SECRET_KEY`, `ML_CLIENT_ID`,
  `ML_CLIENT_SECRET`, `ML_REFRESH_TOKEN`, `SHOPEE_APP_ID`, `SHOPEE_SECRET`
- **Variables**: `TELEGRAM_CHAT_ID` (ex.: `@promosdolucas`), `AMAZON_PARTNER_TAG`, e por último
  `MONITOR_ATIVO=true`, que liga o agendamento

O agendamento só roda depois que o workflow chega na branch padrão (`main`). Pra testar antes, vá em
**Actions → Monitor de promoções → Run workflow** e marque "Só mostrar no log".

## O que muda com o tempo

- **Nos primeiros dias o canal fica quieto.** É de propósito: sem histórico não dá pra provar que o
  desconto é real. Com coleta de hora em hora, os produtos começam a ser avaliados a partir do 3º dia.
- **O histórico fica no cache do GitHub Actions.** É de graça e funciona, mas se ficar 7 dias sem rodar
  o cache é apagado e o histórico recomeça do zero. Se o canal crescer, vale migrar pra uma VPS pequena.
  Aí basta um `cron` rodando `python -m monitor rodar`.
- **Mercado Livre:** o monitor renova o token sozinho e guarda o novo no banco. Se o histórico se perder,
  gere um `ML_REFRESH_TOKEN` novo.
- **Minutos do Actions:** de hora em hora dá uns 720 minutos/mês. Em repositório privado, a cota grátis
  é de 2.000.

## Personalizar

- **Nichos:** edite os blocos `[[buscas]]` do `config.toml`. `lojas` e `preco_maximo` são opcionais.
- **Frequência:** a linha `cron` em `.github/workflows/monitor-promocoes.yml`.
- **Rigor:** a seção `[regras]` do `config.toml`.

## Transparência

Deixe claro na descrição do canal que os links são de afiliado. O rodapé de cada post já avisa. É o
que recomenda o Guia de Publicidade por Influenciadores do CONAR, e é exigência dos programas de
afiliados (a Amazon, por exemplo, pede esse aviso).

## Estrutura

```
monitor/
  sources/     coletores (amazon.py, mercadolivre.py, shopee.py)
  db.py        histórico de preços e de posts (SQLite)
  detector.py  regras de promoção real + nota
  publishers/  texto do post, Telegram e saída no terminal
  runner.py    fluxo de uma execução
  demo.py      simulação offline
tests/         testes (python -m unittest)
config.toml    buscas, regras e canal
```
