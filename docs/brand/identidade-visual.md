# Identidade Visual — @lucasdireitoo

Diretrizes de marca para as artes de conteúdo sobre crescimento de página em social media.

## Perfil

- **Nome/usuário:** @lucasdireitoo
- **Nicho:** Conteúdo educativo para crescer página nas redes sociais (dicas, estratégia, growth)

## Paleta de cores

| Uso sugerido        | Cor            | Hex       |
|----------------------|----------------|-----------|
| Fundo escuro (base)   | Azul-petróleo muito escuro | `#0B1E2E` |
| Fundo/bloco secundário| Azul petróleo  | `#1B4965` |
| Destaque frio         | Azul claro     | `#5FA8D3` |
| Texto claro / fundo alt| Off-white     | `#EDEDE9` |
| Destaque quente (CTA, chamadas) | Laranja/coral | `#F4A259` |

Uso recomendado: fundo em `#0B1E2E` ou `#1B4965`, texto principal em `#EDEDE9`, e `#F4A259` reservado para
palavras-chave, números e chamadas de ação (contraste quente sobre fundo frio). `#5FA8D3` para elementos
gráficos secundários (linhas, ícones, tags).

## Tipografia

### v1 — gráfica/minimalista (linha ativa)

| Papel        | Fonte                  |
|--------------|-------------------------|
| Título       | Anton (Bold)            |
| Subtítulo    | Poppins (Bold)          |
| Parágrafo/corpo | Montserrat (regular, sem bold) |

### v2 — editorial (em pausa — ver observações no roteiro de carrossel)

| Papel        | Fonte                  |
|--------------|-------------------------|
| Título (parte serifada, dá o tom elegante) | Serifada display (ex.: Playfair Display / DM Serif Display) |
| Título (parte destaque/itálico ou peso extra) | Mesma serifada, itálico ou peso maior |
| Eyebrow / legendas / corpo | Montserrat ou sans-serif equivalente, caixa alta, tracking largo para o eyebrow |

Hierarquia v2: eyebrow pequeno nos dois cantos superiores (ex.: "@lucasdireitoo" à esquerda,
"Social Media Growth" à direita, caixa alta, tracking largo) → headline grande misturando serifada
normal + itálico/peso forte, com 1-2 palavras destacadas na cor de accent → linha de apoio menor
(sans-serif) ao lado ou abaixo → CTA discreto no rodapé (ex. "arrasta pro lado").

## Estilo visual

### v1 — gráfica/minimalista (linha ativa)

- Minimalista, sem fotos, textura de papel amassado como fundo.
- Título grande em Anton, hierarquia 100% tipográfica.
- Ver `docs/content/roteiros-carrossel.md` (Roteiros A-D) para estrutura de conteúdo.

### v2 — editorial com foto (em pausa)

- **Foto de fundo genérica, sem pessoas** — objetos, ambientes, texturas (ex.: mesa de trabalho, xícara,
  papel, tecido) tratada com overlay sutil na paleta da marca para manter contraste com o texto.
- Headline com mix serifada + itálico/peso forte, 1-2 palavras na cor de destaque (laranja `#F4A259`
  ou vermelho terroso como variação pontual).
- Eyebrow pequeno em caixa alta nos cantos superiores (autoria/nicho).
- Texto de apoio compacto, alinhado à direita ou abaixo do headline.
- CTA discreto no rodapé quando for carrossel ("arrasta pro lado").
- **Pausado**: os templates gerados por IA calculam uma sobreposição tipográfica fina (tipo capa de
  revista) específica pras palavras originais em inglês; substituir o texto por conteúdo em português
  quebra essa sobreposição e não há como recalcular isso via API do Canva (sem acesso a redesenho de
  layout, só a elementos individuais). Retomar exigiria regerar cada slide via IA com o texto final já
  em português desde o início, slide por slide — ver `docs/content/roteiros-carrossel.md` (Roteiro E).

## Formatos de produção

- Feed Instagram (post único)
- Stories / Reels (9:16)
- Carrossel (múltiplos slides)
