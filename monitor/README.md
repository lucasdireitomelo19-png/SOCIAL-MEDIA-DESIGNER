# Monitor de promoções

Acompanha preços no **Mercado Livre** e na **Shopee** pelas APIs oficiais, guarda o histórico e
avisa no **Telegram** (ou Discord) quando aparece uma promoção de verdade — pronta pra virar post.

## Como ele decide que é promoção

O "de R$ X por R$ Y" das lojas não é confiável (muita loja infla o preço "de"). Por isso o monitor
compara com o **histórico que ele mesmo coletou**:

1. preço atual **≥ 20% abaixo da mediana dos últimos 30 dias**, ou
2. **menor preço dos últimos 90 dias** e pelo menos 10% abaixo da mediana.

Ele precisa de 5 coletas de um produto antes de confiar no histórico (≈ 2h30 rodando a cada 30 min).
Não repete alerta do mesmo produto, a menos que o preço caia mais 5% ou passem 7 dias.
Tudo isso é ajustável em [`config.toml`](config.toml), junto com as buscas, filtros de preço e
palavras a excluir.

## Configurar (uma vez)

### 1. Credenciais dos marketplaces
- **Mercado Livre:** crie um app em <https://developers.mercadolivre.com.br/devcenter> e anote
  `Client ID` e `Client Secret`.
- **Shopee (opcional):** com conta de afiliado aprovada, pegue `App ID` e `Secret` em
  <https://affiliate.shopee.com.br/open_api>. Os links gerados já saem com sua comissão.

Uma fonte sem credencial é só ignorada — dá pra começar só com o Mercado Livre.

### 2. Bot do Telegram
1. No Telegram, fale com **@BotFather** → `/newbot` → guarde o token.
2. Crie um grupo/canal, adicione o bot e mande uma mensagem.
3. Abra `https://api.telegram.org/bot<TOKEN>/getUpdates` e copie o `chat.id` (canais começam com `-100`).

### 3. Secrets no GitHub
Em **Settings → Secrets and variables → Actions → New repository secret**, cadastre:

| Secret | Obrigatório |
|---|---|
| `ML_CLIENT_ID`, `ML_CLIENT_SECRET` | para Mercado Livre |
| `SHOPEE_APP_ID`, `SHOPEE_SECRET` | para Shopee |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | para alertas no Telegram |
| `DISCORD_WEBHOOK_URL` | se usar `"discord"` em `alertas` |

### 4. Ligar
O workflow [`.github/workflows/promo-monitor.yml`](../.github/workflows/promo-monitor.yml) roda a cada
30 minutos **depois que estiver na branch principal** (o GitHub só agenda na branch padrão).
Pra testar na hora: aba **Actions → Monitor de promoções → Run workflow**.

## Rodar no computador

```bash
cd monitor
pip install -r requirements.txt
export ML_CLIENT_ID=... ML_CLIENT_SECRET=...
python -m promo_monitor --dry-run   # só imprime, não envia nem marca como alertado
python -m promo_monitor             # envia pelos canais do config.toml
python -m unittest discover -s tests -t .
```

O histórico fica em `monitor/data/precos.db` (SQLite, fora do git).

## Estrutura

```
promo_monitor/
  sources/        uma fonte por marketplace (mercadolivre.py, shopee.py)
  detector.py     regras de promoção e anti-repetição
  storage.py      histórico de preços e alertas (SQLite)
  notifier.py     mensagem e canais (telegram, discord, console)
  __main__.py     execução: coleta → avalia → salva → alerta
```

Pra adicionar outro marketplace (Amazon PA-API, Magalu, AliExpress…), crie um módulo em `sources/`
com uma função `fetch(config)` que devolve objetos `Offer` e registre em `sources/__init__.py`.
