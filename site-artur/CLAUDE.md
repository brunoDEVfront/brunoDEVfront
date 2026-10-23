# Site do Vintage Salon (Artur Almeida): contexto do projeto

Leia este arquivo inteiro antes de mexer no site. Ele resume tudo o que já foi
combinado com quem pediu o site, para continuar sem perder nada.

## Como falar com quem pede

- Sempre em português do Brasil, frases curtas e diretas.
- A pessoa quer **ver o progresso visualmente, em tempo real**: abra o site no
  Preview e mostre cada mudança. Trabalhe em passos pequenos e mostre o
  resultado de cada um.
- Ordem combinada: **uma seção por vez, desktop primeiro, celular por último.**
  A hero do desktop já está pronta. Não mexa no celular até ela pedir.
- Quando ela disser "para" ou "espera", pare na hora e aguarde.
- Ela vai mandar as fotos depois ("num arquivo bonitinho"). O site precisa
  estar sempre pronto para receber as fotos sem mexer no código.

## O cliente

- **Marca:** Vintage Salon. **Profissional:** Artur Almeida.
- O nome é **Artur, sem H** (o @ dele é `aartursemh_`, "Artur sem H").
- Instagram: https://www.instagram.com/aartursemh_/
- Bio: "Especialista em atendimento ao público | Consultor de imagem |
  Visagista | Nunca foi só um corte".
- **Lema: "Nunca foi só um corte."** (é o título da hero).
- Os posts dele são escuros com dourado, fotos com clima de barbearia e um
  monograma "VS" (Vintage Salon).
- O Instagram pede login para mostrar mais que isso; se precisar de mais
  informações (endereço, preços, horários), peça prints para a pessoa.

## Referência de estilo

- Site de referência: https://cabralbarberstudio.com.br/ (é de **outra**
  barbearia).
- Pedido: "quero que fique exatamente nesse estilo, clean vintage, porque vai
  ser uma foto dele de fundo... mas não quero que pareça cópia".
- Regra: seguir a **estrutura e o estilo** (escuro, dourado, premium, layout),
  mas **não copiar** textos, fotos, logo nem depoimentos do Cabral. O conteúdo
  é sempre do Artur.
- A pessoa passou uma skill "skill-web-clone". Usamos o fluxo dela só para
  medir a referência com o navegador (Playwright), aplicar as proporções e
  comparar lado a lado, sem clonar o conteúdo.

### Medidas da referência (hero, tela 1440×900)

| Item | Medida |
|---|---|
| Topo | 68px, transparente; ao rolar fica `rgba(16,14,12,.95)` com `blur(8px)` |
| Menu | 12px, peso 500, espaçamento 1,8px, cor marfim apagado |
| Botão do topo | 44px de altura, 12px/600, espaçamento 0,18em, sombra dourada |
| Título | serifada, 72px, entrelinha 0,95, segunda parte em dourado degradê |
| Texto | 16px, entrelinha 26px, largura máxima ~512px |
| Botões | 46px, padding 14px 28px, 12px/600, um cheio e um com contorno |
| Destaques | 4 itens com ícone dourado em cima e texto pequeno embaixo |
| Margem lateral | conteúdo a 100px da borda |

### Seções da referência, em ordem

1. Hero com foto de fundo
2. "Experiência premium": foto à esquerda e texto em fundo creme à direita
3. "Como funciona": 3 passos numerados
4. Serviços: cards com foto, nome, preço e botão "Agendar"
5. Tratamentos: foto, texto e uma frase do dono
6. Depoimentos (carrossel com avaliações do Google)
7. Planos de assinatura (2 planos)
8. Localização com mapa
9. Chamada final "Agendar pelo WhatsApp"
10. Rodapé com links e contato

Depoimentos e planos só entram se o Artur tiver avaliações reais ou planos de
verdade. **Nunca invente avaliações.**

## Decisões de design (já aprovadas na hero)

- **Cores** (`:root` em `style.css`): `--preto #100e0c`, `--carvao #181411`,
  `--ouro #cfa555`, `--ouro-claro #ecd08a`, `--marfim #efe6d4`,
  `--marfim-suave #b8ac97`, `--papel #efe6d4`, `--tinta #1a1511`,
  `--sangue #8a2c22` (o vermelho, usado bem pouco).
- **Fontes:** Bodoni Moda (títulos; na hero com `opsz 18` para ficar mais
  encorpada), Libre Franklin (texto), Yellowtail (script, para detalhes).
- **Toque vintage:** a foto ganha um leve tom sépia, um grão de filme fica
  por cima da página, a segunda linha do título vai em itálico com dourado
  degradê, e um selo circular "VS" gira devagar no canto da hero.
- **Topo:** fixo e transparente sobre a foto; ganha fundo quando a página rola
  (`is-rolado`, em `script.js`).
- **Hero:** texto à esquerda, foto ocupando o fundo e escurecendo para o lado
  do texto. Sem foto, fica um fundo escuro elegante.

## Arquivos

- `index.html`: a página.
- `style.css`: todo o visual. A hero e o topo já estão no estilo novo.
- `script.js`:
  - `WHATSAPP` é o número (ainda falso: `5500000000000`). Todo link com
    `data-whatsapp` abre o WhatsApp com a mensagem pronta; com `data-servico`
    a mensagem cita o serviço.
  - O topo muda ao rolar.
  - Molduras com `data-foto` mostram a foto sozinhas quando o arquivo existe.
  - O dia de hoje fica destacado nos horários.
- `img/`: onde entram as fotos.

### Fotos (é só salvar com estes nomes)

| Arquivo | Onde aparece | Ideal |
|---|---|---|
| `img/capa.jpg` | fundo da hero | horizontal, 1920×1080 ou mais, Artur do lado direito |
| `img/artur.jpg` | seção sobre o Artur | vertical 4:5 |
| `img/galeria-1.jpg` … `galeria-6.jpg` | galeria | vertical 4:5 |

O enquadramento da capa se ajusta com `--capa-posicao` no `.inicio` do
`style.css` (ex.: `70% center`, `right 20%`).

## O que está pronto e o que falta

**Pronto:** topo e hero no desktop, testados no navegador. O topo muda ao
rolar, o botão clareia no hover, o WhatsApp abre com a mensagem e
"Ver serviços" rola até a seção.

**Falta, nesta ordem:**
1. Refazer as seções abaixo da hero no estilo da referência. Hoje elas ainda
   usam o estilo antigo, e algumas classes novas do HTML ainda não têm CSS:
   `.sobre`, `.sobre__texto`, `.sobre__selos`, `.etapas`, `.etapa`,
   `.etapa__num`, `.etapa__titulo`, `.cartao__selo`, `.rodape__lema`.
   Seções atuais no HTML: visagismo/sobre, como funciona (3 passos em
   algarismos romanos), serviços e preços (cartão de tabela), galeria,
   horários e endereço, rodapé. Falta também a chamada final com o
   WhatsApp e, se fizer sentido, um mapa.
2. Ajustar tudo para o celular.
3. Trocar os dados de exemplo pelos reais.

**Dados de exemplo que precisam ser confirmados com o Artur:** preços e
tempos dos serviços, horários, endereço, número do WhatsApp, formas de
pagamento e o texto do "sobre".

## Como testar

- Abra `index.html` no Preview e compare com a referência na mesma largura
  (1440×900).
- Para testar a hero com foto antes de ter a do Artur, use qualquer foto
  temporária como `img/capa.jpg`, mas **não faça commit dela**.
- Antes de dar uma seção por terminada, confira as interações (hover, links,
  topo ao rolar) e se não há rolagem horizontal.

## Git

- Branch: `claude/gracious-cray-u8hzch` no repositório
  `brunoDEVfront/brunoDEVfront`.
- Faça commit e push a cada etapa concluída. Não abra pull request sem pedido.
