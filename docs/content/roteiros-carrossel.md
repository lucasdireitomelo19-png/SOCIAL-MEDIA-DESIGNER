# Roteiros de Carrossel — @lucasdireitoo

Templates adaptáveis de carrossel (mín. 4, máx. 7 slides). Sempre usar **"perfil"** no lugar de "página"
nos textos das artes. Alternar publicação entre a versão **fundo escuro** e **fundo claro** da identidade.

Bases no Canva (linha v1 — gráfica/minimalista):
- Fundo escuro (papel amassado azul petróleo): design `DAHR_SCvODo`
- Fundo claro (papel amassado off-white): design `DAHR_hgWfkY`
- Carrossel único (5 escuras + 5 claras, intercaladas na publicação): design `DAHR_vz2L1Q`
  https://www.canva.com/design/DAHR_vz2L1Q/edit

## Roteiro E — linha editorial v2 (foto sem pessoas + serifada/sans)

Baseado em referências de mercado (Josi Muniz, Jessi Lima, Vitória Zuntini, Carol Ferreira,
Mariana Guimarães). Fundo com foto genérica sem pessoas, headline misturando serifada display
(itálico/regular) com peso forte, 1-2 palavras em destaque laranja, eyebrow "@lucasdireitoo" no
canto superior, legenda pequena em caixa alta abaixo do headline.

Templates base no Canva:
- Estilo A (linha itálica de abertura + palavra grande em destaque): design `DAHR_3ygUFw`
- Estilo B (eyebrow caixa branca + headline empilhado + legenda embaixo): design `DAHR_6ejOgk`

**Dois carrosséis finais, cada um 100% num estilo (não mais intercalados)** — tema "3 decisões
que mudaram meu processo criativo", já em português:
- Carrossel A: `DAHR_wJLpjI` — https://www.canva.com/design/DAHR_wJLpjI/edit
- Carrossel B: `DAHR_2uihF4` — https://www.canva.com/design/DAHR_2uihF4/edit

Observação técnica: esses templates da IA usam posicionamento absoluto pensado pro texto
original (inclusive uma sobreposição tipográfica fina, tipo capa de revista) — trocar o texto
via API quebra essa sobreposição e não dá pra recalcular reposicionando manualmente (a IA ajusta
isso com base na "silhueta" de cada palavra, não é algo replicável em pixels). A solução que
funcionou: regerar cada slide via `generate-design` já com o texto final em português desde o
início (a IA desenha a composição certa pra aquelas palavras), revisar o thumbnail de cada
candidato e escolher o que bate com o estilo, depois montar o carrossel com `merge-designs`. Cada
geração retorna 4 candidatos e nem todos batem com o estilo pedido — é normal ter que checar 2-4
antes de achar um bom.

Observação: as páginas claras foram reconstruídas a partir da própria estrutura do design escuro
(fundo sólido #EDEDE9 + texto recolorido para #0B1E2E), garantindo as fontes corretas
Anton/Poppins/Montserrat — sem textura de papel nessa variante, já que a API do Canva não permite
trocar a fonte de um template gerado por IA.

## Estrutura padrão

1. **Capa** — hook + tema (letra ou palavra-chave em laranja `#F4A259`)
2. **Conteúdo** — 2 a 5 slides, um ponto por slide (dica, erro, passo, dado)
3. **Fechamento/CTA** — reforço + chamada pra ação (seguir, salvar, comentar)

## Roteiro A — "N dicas pra crescer seu perfil" (5 slides)

1. Capa: "3 DICAS PRA CRESCER SEU PERFIL"
2. Dica 1: título curto + 1 frase de explicação
3. Dica 2: título curto + 1 frase de explicação
4. Dica 3: título curto + 1 frase de explicação
5. CTA: "Salva esse post e testa hoje" + "Segue @lucasdireitoo pra mais"

## Roteiro B — "N erros que travam seu perfil" (5–7 slides)

1. Capa: "3 ERROS QUE TRAVAM SEU PERFIL"
2. Erro 1: o que é + por que atrapalha
3. Erro 2: o que é + por que atrapalha
4. Erro 3: o que é + por que atrapalha
5. (opcional) Erro 4 / Erro 5
6. Resumo rápido dos erros (bullet curto)
7. CTA: "Qual desses você já fez? Comenta aqui"

## Roteiro C — Pergunta/engajamento direto (4 slides)

1. Capa: pergunta direta, ex. "Qual sua maior dificuldade pra crescer o perfil hoje?"
2. Contexto: por que essa dificuldade é comum
3. Dica rápida relacionada
4. CTA: "Responde nos comentários" + "Segue @lucasdireitoo"

## Roteiro D — Prova social / resultado (4–5 slides)

1. Capa: número/resultado em destaque, ex. "+X seguidores em Y dias"
2. Como: estratégia usada (resumo)
3. Passo prático que qualquer perfil pode aplicar
4. (opcional) Prova/detalhe extra
5. CTA: "Quer isso pro seu perfil? Segue e ativa o sininho"

## Regras fixas

- Substituir sempre "página" → "perfil" no texto final das artes.
- Título em Anton, subtítulo em Poppins Bold, corpo em Montserrat.
- Palavra-chave/número de destaque em laranja `#F4A259`.
- Sem fotos — só tipografia, textura de papel amassado e formas simples.
