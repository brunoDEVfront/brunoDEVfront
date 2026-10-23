# Prompt: Parte 2 do Reel (o sistema), continuação da abertura já editada

Você vai produzir a **Parte 2** de um Reel vertical para o Instagram. A **Parte 1** (a abertura com a fala do dono da barbearia) já está pronta e editada. No final, as duas partes vão ser **unidas num vídeo só**. Por isso a Parte 2 precisa parecer o mesmo vídeo: mesma identidade visual, mesmo ritmo e as mesmas especificações técnicas. Leia tudo antes de começar.

Use os skills disponíveis:
- **`/video-shotcraft`**: para as cenas do sistema, com telas reais, movimentos de câmera 2.5D e cortes no ritmo.
- **`/motion-design`**: princípios de tempo, curvas de aceleração e coreografia.
- **`/video-edit`**: se ele gravar mais falas para a câmera.

### Instalação dos skills (faça antes de começar, se algum não aparecer na lista de skills)

- **video-edit:** `git clone https://github.com/tenfoldmarc/video-edit-skill "$HOME/.claude/skills/video-edit"`. Na primeira vez, rode `/video-edit`; ele faz a configuração inicial sozinho.
- **motion-design:** `npx skills add LottieFiles/motion-design-skill`. Se não funcionar, clone `https://github.com/lottiefiles/motion-design-skill` e copie a **pasta inteira** `skills/motion-design` para `$HOME/.claude/skills/motion-design`. Não copie só o SKILL.md, porque ele aponta para outros arquivos da pasta.
- **video-shotcraft:** é um plugin da conta claude.ai do usuário e costuma aparecer sozinho nas sessões do Claude Code. Se não aparecer, peça ao usuário para ativá-lo nos plugins da conta.
- **Neste repositório:** se você estiver no `brunoDEVfront`, na branch `claude/focused-cray-kxwdyl`, o video-edit e o motion-design já estão em `.claude/skills/`.

---

## 1. Contexto do vídeo

- **Quem fala:** um empreendedor, dono de uma barbearia. O ambiente tem parede de mármore preto, ripas de madeira, LED vermelho e cadeira de barbeiro. Ele fala em português do Brasil, de forma informal ("fala rapaziada").
- **Formato:** Reel do Instagram, vertical 9:16, 1080×1920, 30 fps.
- **História do Reel completo:**
  1. **Parte 1 (pronta):** a dor. Ele não consegue responder clientes no WhatsApp e no Instagram enquanto corta cabelo e faz barba, e as mensagens se acumulam.
  2. **Parte 2 (esta):** a solução. O sistema que resolve isso.

### Transcrição completa da Parte 1 (26,1 s, tempos no vídeo editado)

| Tempo | Fala | O que acontece na tela |
|---|---|---|
| 0,00 | "Fala rapaziada, beleza?" | Abre com a imagem desfocada entrando em foco |
| 1,25 | "Eu quero passar uma visão aqui pra vocês como empreendedor, tá bom?" | "empreendedor" em amarelo, atrás da cabeça dele |
| 4,53 (corte) | "O que que acontece? Eu tenho uma dificuldade absurda aqui na minha produção, na minha operação." | Plano mais fechado; "absurda" em amarelo atrás da cabeça |
| 9,21 | "Como que funciona?" | Volta ao plano aberto |
| 10,37 (corte) | "Eu tô aqui cortando o cabelo, tô fazendo uma barba" | Ícone de tesoura (abrindo e fechando) e ícone de aparelho de barbear, em selos redondos na parede |
| 14,78 | "e eu não consigo dar atenção no meu celular," | Um celular aparece na parede e vibra, com o contador "3 mensagens não lidas" |
| 15,24 a 19,5 | "não consigo dar atenção no meu WhatsApp, nos meus clientes que vêm até mim pelo WhatsApp, pelo Instagram." | Cartões de mensagem empilham na parede (WhatsApp e Instagram), o contador sobe 12, 19, 31, **47**, e um brilho vermelho pulsa a cada leva |
| 19,76 | "Então, com essa dor," | As mensagens são varridas da tela; "dor" atrás da cabeça |
| 21,62 | "eu fui em busca de uma solução." | "solução" em amarelo atrás da cabeça, brilho dourado e um reflexo de luz passando |
| 24,40 (corte) a 26,10 | "Como que funciona essa solução?" | Aproximação lenta; termina com **a imagem desfocando e clareando** (os 0,34 s finais) |

**A Parte 2 começa logo depois de "Como que funciona essa solução?"**, então ela responde essa pergunta.

### Mensagens usadas na Parte 1

Os nomes são fictícios. Reutilize-os para dar continuidade:

| App | Cliente | Mensagem |
|---|---|---|
| WhatsApp | Lucas | Tem horário hoje às 18h? |
| WhatsApp | Rafael | Quanto tá o corte + barba? |
| WhatsApp | Pedro | Oi, tá aberto agora? |
| Instagram | Mariana | Vi seu trabalho, tem vaga amanhã? |
| WhatsApp | João | Posso remarcar pra sexta? |
| WhatsApp | Thiago | Chego em 10 min, segura pra mim |
| Instagram | Diego | Quanto tá a pigmentação? |
| Instagram | Ana | Tem horário sábado de manhã? |

---

## 2. O que a Parte 2 precisa mostrar

> **Preencha com o usuário antes de produzir** (pergunte o que faltar, de uma vez só):
> - **Nome do sistema:** [PREENCHER]
> - **O que ele faz:** 3 a 5 funcionalidades principais. Exemplo: responde automaticamente no WhatsApp e no Instagram, agenda horários sozinho, confirma e lembra o cliente, mostra a agenda do dia. [PREENCHER]
> - **Material:** link do sistema (para tirar prints reais), prints ou gravações de tela. [PREENCHER]
> - **Narração:** ele vai gravar mais falas para a câmera ou será só texto na tela e música? [PREENCHER]
> - **Duração desejada:** sugestão de 20 a 35 s. [PREENCHER]
> - **Chamada final:** por exemplo "segue o @…", "comenta SISTEMA", link na bio. [PREENCHER]

### Roteiro sugerido

Ajuste ao sistema real; o importante é **pagar o que a Parte 1 armou**:

1. **Entrada (0 a 0,5 s):** começa **desfocada e clara** (desfoque de 14 px, brilho 1,35) e entra em foco em 0,35 a 0,5 s, desacelerando no fim. É o espelho da saída da Parte 1, para que o corte entre as duas fique invisível.
2. **Virada (cerca de 2 s):** o contador **"47 mensagens não lidas"** volta e despenca para **0**, ou as mensagens da tabela acima reaparecem e vão sendo **respondidas sozinhas**. Exemplo: Lucas pergunta "Tem horário hoje às 18h?" e o sistema responde "Temos 18h30 livre, confirma?". É o momento de alívio.
3. **O sistema (o miolo):** telas reais. Uma funcionalidade por cena, um movimento principal por cena (aproximar, revelar um elemento, rolar a tela) e texto curto dizendo o benefício.
4. **Resultado:** agenda cheia, cliente confirmado, "e eu sigo cortando". Se houver mais gravação dele, este é o melhor lugar para ela.
5. **Chamada final:** segure a tela parada por pelo menos 1 s antes de terminar.

---

## 3. Identidade visual (obrigatória para casar com a Parte 1)

### Tipografia e textos

- **Fonte principal:** **Inter Tight 900**, em minúsculas, espaçamento entre letras `-0.05em`, altura de linha `0.9`.
- **Tamanhos:**
  - frases de apoio: **84 px** (peso 800, espaçamento `-0.04em`);
  - frases longas: **56 px**;
  - palavra de impacto: **150 px**;
  - destaque gigante: **220 px**.
- **Cores:** texto branco `#FFFFFF`. A **cor de destaque é amarelo manteiga `#FAE67A`**, usada só na palavra de impacto de cada frase.
- **Sombra do texto:** `0 10px 40px rgba(0,0,0,.55), 0 2px 8px rgba(0,0,0,.35)`.
- **Fontes de interface** (cartões e telas): **Inter 500/600**.
- **Pontuação:** sem travessão nos textos da tela.
- **Onde baixar:** todas estão no Google Fonts. Também estão em `~/.claude/skills/video-edit/assets/template/assets/fonts/`, se o skill video-edit estiver instalado.

### Animação dos textos (a "assinatura")

- **Entrada:** cada palavra aparece no momento exato em que é falada. Ela começa com escala 1.22, desfoque de 22 px e opacidade 0, e vai para 1 / 0 px / 1 em **0,2 s**, curva `power3.out`.
- **Saída do grupo:** escala 0.96, desfoque de 16 px e opacidade 0 em **0,12 s**, curva `power2.in`.
- **Posição:** frases centralizadas na faixa y 1010 a 1190 px. Palavras de impacto em y 1090.
- **Corte:** a cada corte, um leve impulso de zoom (1.05 para 1 em 0,32 s, `power2.out`).

### Elementos de interface (já usados na Parte 1; reutilize)

- **Cartão de mensagem:**
  - tamanho 430×116 px, cantos de 30 px;
  - fundo `rgba(24,24,28,.9)`, borda de 1,5 px `rgba(255,255,255,.1)`, sombra `0 22px 50px rgba(0,0,0,.45)`;
  - ícone de 66 px com cantos de 18 px;
  - linha 1: nome do app, "· agora" (Inter 600, 19 px, maiúsculas, cinza `#8e8e96`);
  - linha 2: nome do cliente (Inter 600, 27 px, branco);
  - linha 3: mensagem (Inter 500, 24 px, `#d2d2d8`).
- **Cores dos apps:** WhatsApp verde **`#2fbe63`**. Instagram com degradê **`#f6a03a → #d6326f → #7a3fc0`** (135°). Use ícones genéricos (balão de conversa, avião de papel), **nunca os logos oficiais**.
- **Celular:**
  - tamanho 250×500 px, cantos de 44 px, corpo `#0b0b0d`;
  - tela em degradê `#1d2230 → #121418 → #0d0e10`;
  - contador grande em Inter Tight 900 de 124 px, com "mensagens não lidas" embaixo;
  - bolinha vermelha `#ff3b30` no canto.
- **Brilhos:** dourado `rgba(250,230,122,.5)` para alívio e solução. Vermelho `rgba(255,52,40,.3)` para tensão, mas evite o vermelho na Parte 2, que é a parte da solução.

### Movimento (princípios do `/motion-design`, mantendo a personalidade da Parte 1)

- **Personalidade:** energética.
- **Curvas:** entradas desaceleram (`expo.out` ou `power3.out`), saídas aceleram (`power2.in`).
- **Duração:** entre 0,2 e 0,45 s para elementos de interface.
- **Escalonamento** de listas: 50 a 100 ms, total abaixo de 500 ms.
- **Uma animação de destaque por cena.** Depois que a informação chave aparece, segure 0,5 a 1 s parado.
- **Camadas:** principal (texto, tela), secundária (cartões, sombras) e ambiente (brilho suave).
- **Nada de** movimento linear em deslocamentos, de brilhos espalhados por todo lado nem de granulado de filme.

### Cor e imagem

- **Tom geral:** quente, contraste levemente alto e fundo escuro com o assunto iluminado.
- **Vinheta:** suave nas bordas e escurecimento leve no topo e na base para a leitura do texto.

---

## 4. Área segura do Reels (obrigatória)

Nada importante pode ficar em:
- **topo:** primeiros 220 px;
- **base:** abaixo de **y 1470**;
- **laterais:** 35 px de cada lado;
- **coluna da direita:** 100 px a partir de y 1155 (ícones de curtir e comentar).

Confira com uma guia vermelha nas capturas de teste e tire a guia antes da renderização final.

---

## 5. Especificações técnicas de entrega (para juntar sem emenda visível)

**Vídeo:**
- H.264 perfil High, `yuv420p`;
- **1080×1920, 30 fps constantes**;
- CRF 18 a 19, `+faststart`.

**Áudio:**
- AAC LC, **48 kHz, estéreo, 192 kbps**;
- volume **−14 LUFS integrado**, pico máximo de −1,5 dBTP. A Parte 1 está em −13,9 LUFS;
- **20 ms de entrada suave** no primeiro áudio, para não estalar na emenda.

**Música:** se usar música de fundo, entregue **duas versões**, com e sem música, mantendo os efeitos sonoros. A Parte 1 não tem música.

**Efeitos sonoros (discretos, sempre abaixo da voz):**
- palheta da Parte 1: whoosh curto nos cortes, pop nas palavras de impacto, clique suave nas mensagens, brilho na "solução" e grave de impacto no gancho final;
- na Parte 2, um "brilho" ou "ding" positivo quando o contador zerar ou uma mensagem for respondida combina bem.

**Primeiro quadro:** desfocado e claro, como descrito na seção 2.

**Arquivos:**
- `parte2-sistema.mp4`, em qualidade máxima;
- `parte2-sistema-celular.mp4`, em 720p e CRF 26, para revisão no celular.

**Dados das telas:** use só dados fictícios ou anonimizados. Nada de nomes, telefones ou valores reais de clientes. Reutilize os nomes da tabela acima.

---

## 6. Como juntar as duas partes

Com as duas partes nessas especificações, a junção sem perda é:

```bash
printf "file 'parte1-intro-1080p.mp4'\nfile 'parte2-sistema.mp4'\n" > lista.txt
ffmpeg -f concat -safe 0 -i lista.txt -c copy -movflags +faststart reel-completo.mp4
```

Se os formatos não baterem, recodifique na junção:

```bash
ffmpeg -i parte1-intro-1080p.mp4 -i parte2-sistema.mp4 -filter_complex "[0:v]fps=30,format=yuv420p,setsar=1[v0];[1:v]fps=30,scale=1080:1920,format=yuv420p,setsar=1[v1];[0:a]aresample=48000[a0];[1:a]aresample=48000[a1];[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k -ar 48000 -movflags +faststart reel-completo.mp4
```

Depois de juntar:
- confira o volume do vídeo inteiro (meta de −14 LUFS);
- extraia o último quadro da Parte 1 e o primeiro da Parte 2 e confirme que a passagem de desfocado para nítido ficou contínua.

---

## 7. Checklist antes de entregar

- [ ] Responde à pergunta "como que funciona essa solução?" logo no começo.
- [ ] Usa Inter Tight 900 em minúsculas, branco com amarelo `#FAE67A`, e as palavras entram com desfoque e escala no tempo da fala ou da batida.
- [ ] Reaproveita pelo menos um elemento da Parte 1 (o contador 47 indo a 0, ou as mensagens sendo respondidas).
- [ ] Telas reais do sistema, sem dados sensíveis.
- [ ] Tudo dentro da área segura.
- [ ] 1080×1920, 30 fps, H.264, AAC 48 kHz, −14 LUFS.
- [ ] Começa desfocado e claro para emendar com a Parte 1.
- [ ] Chamada final segurada parada por pelo menos 1 s.
- [ ] Revisão independente quadro a quadro antes de mostrar ao usuário.

**Arquivo da Parte 1 para usar na junção:** `parte1-intro-1080p.mp4` (26,1 s, 1080×1920, 30 fps, AAC 48 kHz, −13,9 LUFS).
