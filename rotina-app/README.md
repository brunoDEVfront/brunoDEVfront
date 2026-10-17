# Rotina — app pessoal de rotina e treino

App Android (Expo SDK 58 + TypeScript) que mostra o que fazer em cada horário, avisa com
notificação + alarme na hora de cada atividade e registra o treino. 100% offline: sem login,
sem servidor; tudo fica salvo no celular (AsyncStorage).

## Telas

| Aba | O que tem |
| --- | --- |
| **Hoje** | AGORA / PRÓXIMO (com contagem regressiva), linha do tempo do dia com cores por tipo, itens passados esmaecidos, botão “Ver outro dia”. |
| **Treino** | Treino do dia com checkbox, “Última vez: 40 kg · 10/9/8”, selo **Sobe o peso hoje** / **Tenta +1 repetição**, timer de descanso (2:30 nos 3 primeiros, 1:30 no resto). Toque no exercício para registrar carga/reps de cada série e ver o histórico. |
| **Semana** | “Semana X de 8”, registro semanal (peso, sono, humor, energia, observação), gráficos de peso e sono, semanas anteriores. |
| **Ajustes** | Notificações por tipo, avisar 0/5/10 min antes, som do alarme, modo despertador, modo adaptação do sono, reagendar, testar notificação, atalhos de permissões e bateria. |

## ⚠️ Antes de usar: complete a sua rotina

A mensagem com a rotina chegou cortada em `05:45 Café da manhã — Ovos,`. Só os dois primeiros
itens de seg/qua/sex são os seus; o resto é **provisório**. Para colocar a sua rotina real:

- **Horários:** `src/data/rotina.ts`
- **Treinos (exercícios, séries, faixa de reps):** `src/data/treinos.ts`

Depois de editar, aumente `VERSAO_ROTINA` em `rotina.ts`: o app reagenda as notificações sozinho
na próxima abertura.

---

## 1. Testar rápido no celular (Expo Go)

Serve para ver as telas e testar as notificações em poucos minutos, sem gerar APK.

1. No computador, instale o [Node.js LTS](https://nodejs.org).
2. No celular, instale o **Expo Go** pela Play Store (precisa ser a versão mais recente, compatível com o SDK 58).
3. No computador:
   ```bash
   cd rotina-app
   npm install
   npx expo start
   ```
4. Abra o Expo Go e escaneie o QR code que aparece no terminal.
   - Celular e computador precisam estar no mesmo Wi-Fi. Se não conectar, use `npx expo start --tunnel`.
5. Aceite a permissão de notificações e vá em **Ajustes → Testar notificação agora**.

**Limitações do Expo Go** (tudo isso funciona no APK):
- Os sons de alarme personalizados não tocam (usa o som padrão).
- As notificações aparecem como sendo do “Expo Go”, e as permissões/otimização de bateria são as do Expo Go.

## 2. Gerar o APK (EAS Build) e instalar

O build roda na nuvem da Expo (grátis), não precisa de Android Studio.

1. Crie uma conta grátis em <https://expo.dev/signup>.
2. No computador, dentro de `rotina-app`:
   ```bash
   npm install
   npx eas-cli@latest login
   npx eas-cli@latest build -p android --profile preview
   ```
   - Na primeira vez ele pergunta se pode **criar um projeto EAS** para o app: responda **Yes** (ele grava o `projectId` no `app.json`; pode commitar essa mudança).
   - Na primeira vez ele pergunta se pode gerar uma **keystore** (chave de assinatura): responda **Yes**. Ela fica guardada na sua conta Expo e é reutilizada nos próximos builds (necessário para atualizar o app sem desinstalar).
   - O perfil `preview` do `eas.json` gera um **.apk** (`"buildType": "apk"`).
3. Espere o build terminar (uns 10–20 min). O terminal mostra um link e um QR code; o build também aparece em <https://expo.dev> → seu projeto → Builds.
4. **No celular**, abra o link (ou escaneie o QR code) e toque em **Download**.
5. Abra o arquivo `.apk` baixado. O Android vai pedir para **permitir instalar apps desta fonte** (Chrome/Arquivos): permita e volte para instalar.
   - Se aparecer o aviso do Play Protect (“app desconhecido”), toque em **Mais detalhes → Instalar assim mesmo**.
6. Abra o app **Rotina** e aceite a permissão de notificações.

Para atualizar depois de mudar algo: rode o mesmo comando de build e instale o novo APK por cima (os dados são mantidos).

## 3. Configurar o celular para os alarmes tocarem SEMPRE

Faça uma vez, depois de instalar o APK. Na aba **Ajustes** há botões que abrem cada tela.

1. **Notificações:** permitidas (o app pede ao abrir pela primeira vez).
2. **Alarmes e lembretes** (Android 12+): o app já declara `USE_EXACT_ALARM`, então no Android 13+ costuma vir liberado. Se em Ajustes aparecer ❌, toque em **Liberar** e ative “Permitir configuração de alarmes e lembretes”.
3. **Bateria sem restrições (Samsung — muito importante):**
   - Ajustes do app → **🔋 Desativar otimização de bateria** → Permitir; **e também**
   - Configurações do celular → **Aplicativos → Rotina → Bateria → Sem restrições**.
   - Configurações → **Assistência do aparelho e bateria → Bateria → Limites de uso em segundo plano**: confira que o Rotina **não** está em “Apps em suspensão” nem em “Apps em suspensão profunda”. Se quiser, adicione em “Apps que nunca são suspensos”.
4. **Canal de notificação:** Configurações → Aplicativos → Rotina → Notificações → toque no canal do som escolhido (ex.: “Rotina — Despertador clássico”) e confira que está como **Alerta / Pop-up**, com som e vibração ligados, e aparecendo na tela de bloqueio.
5. **Volume de ALARME** alto: os sons tocam pelo volume de alarme (não pelo de toque/notificação).
6. **Não perturbe:** se usar, adicione o Rotina às exceções ou libere “Alarmes”.
7. Teste: **Ajustes → Testar com a tela bloqueada (10 s)**, bloqueie a tela e espere.

## Como as notificações funcionam

- Cada item da agenda vira uma notificação local **semanal repetida** (dia da semana + hora + minuto), num canal Android de prioridade máxima com som e vibração, visível na tela de bloqueio.
- **Modo despertador** (ligado por padrão) usa o agendamento de despertador do Android (`setAlarmClock`): toca no minuto exato mesmo com economia de bateria. Efeito colateral: aparece um ícone de alarme na barra de status.
- Os ids das notificações são fixos e tudo é cancelado antes de reagendar, então **nunca duplica**. Qualquer mudança em Ajustes reagenda automaticamente; o app também confere o agendamento toda vez que é aberto.
- **Modo adaptação do sono:** dormir começa às 23:30 e recua 30 min por semana até 21:30 (seg/qua/sex), 21:45 (ter/qui), 22:00 (dom). “Telas desligadas” e “Diário” acompanham, mantendo a mesma distância. Durante a adaptação essas três notificações são agendadas com data marcada (o horário muda toda semana); quando a adaptação termina, voltam a ser semanais.
- Tocar numa notificação de treino abre a aba **Treino**; as outras abrem **Hoje**.
- Os alarmes sobrevivem a reiniciar o celular.

## Estrutura

```
src/
  app/                 telas (Expo Router)
    (tabs)/            Hoje, Treino, Semana, Ajustes
    exercicio/[id].tsx registro + histórico de um exercício
  data/                rotina.ts e treinos.ts  ← edite aqui
  lib/                 agenda, notificações, progressão, datas
  state/               dados salvos (AsyncStorage) e timer de descanso
assets/sounds/         sons de alarme (.wav gerados para o app)
eas.json               perfis de build (preview = APK)
```

Comandos úteis: `npm run typecheck` (TypeScript) · `npx expo-doctor` (confere dependências).
