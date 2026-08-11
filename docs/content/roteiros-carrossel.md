# Roteiros de Carrossel — @lucasdireitoo

Templates adaptáveis de carrossel (mín. 4, máx. 7 slides). Sempre usar **"perfil"** no lugar de "página"
nos textos das artes.

## Estrutura padrão

1. **Capa** — hook + tema
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

## Roteiro E — "Decisões que mudaram o processo" (5 slides)

1. Capa: "N decisões que mudaram meu processo criativo"
2. Decisão 1: o que mudou + por quê
3. Decisão 2: o que mudou + por quê
4. Decisão 3: o que mudou + por quê
5. CTA: reforço + "Segue @lucasdireitoo"

## Regras fixas

- Substituir sempre "página" → "perfil" no texto final das artes.
- Cores da marca (ver `docs/brand/identidade-visual.md`) como fio condutor.

## Design das artes — linha ativa

Layout base: fundo sólido azul-petróleo `#0B1E2E`, headline bold condensado (Anton) centralizado
misturando duas cores — texto principal em off-white `#F8E8C5`/`#EDEDE9` e a palavra-chave em
laranja `#E14D24`/`#F4A259` — com legenda de apoio em Poppins abaixo. Slides de lista usam bullet
com seta (→). Inspirado no layout da Vitória Zuntini, recolorido pra paleta da marca.

Carrossel pronto — Roteiro B "3 erros que travam seu perfil" (6 slides: capa, erro 1/2/3, resumo,
CTA): design `DAHSAqKQ_uQ` — https://www.canva.com/design/DAHSAqKQ_uQ/edit

Observação técnica: pra editar o texto de um design gerado por IA sem quebrar a formatação
(cores por trecho, fonte), usar `find_and_replace_text` element por element_id (troca o texto de
uma região específica preservando a cor/fonte dela) em vez de `replace_text` (que substitui todo o
elemento e colapsa pra uma única formatação). Pra montar o carrossel: duplicar a página-base N
vezes com `merge-designs` (`insert_pages`), depois editar o texto de cada página.
