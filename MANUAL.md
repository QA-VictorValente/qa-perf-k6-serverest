# 📖 Manual Descomplicado: A Multidão Virtual e o Teste da Black Friday com Grafana k6

> **Para quem é este manual?**  
> Este documento foi escrito para pessoas leigas que querem entender como testamos a velocidade, a força e a resistência de um sistema quando centenas de pessoas tentam acessá-lo ao mesmo tempo!

---

## 🚇 A Analogia da Catraca do Metrô: O que é Teste de Performance?

Imagine uma estação de metrô em um domingo de manhã:

```text
  [ DOMINGO DE MANHÃ ]               [ HORA DO RUSH / BLACK FRIDAY ]
  Passa 1 pessoa por minuto         Chegam 500 pessoas CORRENDO juntas
          ⬇                                         ⬇
    Catraca gira lisa                     A catraca aguenta ou quebra?
     Ninguém espera fila                  A fila vai dobrar a esquina?
```

- Quando você está sozinho usando um aplicativo, ele parece super rápido.
- Mas o que acontece no primeiro dia de inscrições do ENEM ou à meia-noite da **Black Friday**, quando milhares de pessoas tentam clicar em "Comprar" no mesmo segundo?

👉 **O Grafana k6 é um gerador de multidões virtuais!**  
Ele é um programa capaz de criar robôs fantasmas chamados de **VUs (Virtual Users)**. Cada robô finge ser uma pessoa de verdade navegando, cadastrando usuários e fazendo compras na velocidade da luz para ver se o servidor aguenta o tranco!

---

## 🏋️ Os 3 Níveis de Treino: Tipos de Teste

Neste projeto, colocamos a API ServeRest para fazer 3 tipos de exercícios:

```text
  1. SMOKE TEST            2. LOAD TEST             3. STRESS TEST
  "O Teste da Caminhada"   "A Corrida de Rua"       "O Levantamento de Peso Extremo"
       (1 a 2 pessoas)         (10 a 20 pessoas)        (Uma multidão com pico súbito)
  Só para ver se a porta   Carga normal do dia a    Descobrir em qual peso o sistema
   do shopping abre.        dia para ver se cansa.   começa a tremer as pernas!
```

---

## 🗺️ Mapa do Projeto: O que faz cada pasta e arquivo?

```text
04-perf-k6/
├── src/
│   ├── config/
│   │   ├── environments.js    ➡️ "O Mapa das Ruas (Endereços da API)"
│   │   └── thresholds.js      ➡️ "As Regras de Ouro / Padrão de Qualidade"
│   ├── payloads/              ➡️ "A Fábrica de Crachás da Multidão"
│   │   └── user.payload.js    ➡️ Inventa nomes e e-mails para cada pessoa fantasma
│   ├── scenarios/             ➡️ "Os Scripts dos 3 Treinos"
│   │   ├── smoke-test.js      ➡️ O Teste Rápido (1 pessoa)
│   │   ├── load-test.js       ➡️ O Teste de Movimento Contínuo
│   │   └── stress-test.js     ➡️ O Teste de Limite Máximo
│   └── utils/helpers.js       ➡️ "O Cronômetro e o Apito do Juiz"
├── package.json               ➡️ "Os Comandos Fáceis de Rodar"
└── README.md                  ➡️ Documentação técnica para engenheiros
```

---

## 🔍 Entendendo os Arquivos em Detalhes

### 1. `src/config/thresholds.js` — O Cronômetro do Juiz (SLAs)
Imagine um restaurante que promete: *"Sua pizza chega em 30 minutos ou você não paga nada!"*.

Aqui no código nós definimos promessas parecidas:
- **`p(95) < 500ms`:** Significa que 95% de todas as pessoas da multidão devem receber a resposta do sistema em menos de meio segundo (500 milissegundos).
- **`rate < 0.01`:** Menos de 1% das tentativas podem dar erro. Se der mais de 1 erro a cada 100 pedidos, o teste apita vermelho e reprova o sistema!

---

### 2. `src/payloads/user.payload.js` — Os Documentos da Multidão
Se temos 50 robôs tentando se cadastrar ao mesmo tempo, cada um precisa de um e-mail diferente. Este arquivo gera dados na velocidade da luz para que ninguém use a identidade de ninguém.

---

### 3. `src/utils/helpers.js` — A Telemetria e o Tempo para Pensar
Dois recursos muito inteligentes moram aqui:
- **Métricas Customizadas:** Medidores específicos que mostram exatamente quanto tempo demorou apenas o clique do botão de login e quanto tempo demorou para listar os produtos.
- **`thinkTime` (Tempo para pensar):** Na vida real, nenhum ser humano clica em 5 botões em 0,001 segundo. As pessoas leem a tela e pensam um pouquinho. O `thinkTime` coloca pequenas pausas de 0,5 a 1 segundo entre as ações para simular o comportamento humano real!

---

### 4. `src/scenarios/smoke-test.js` — O Teste da Fumacinha
Um teste de 10 segundos com apenas 1 pessoa virtual. Serve para rodar de manhã cedo e garantir que o sistema não acordou quebrado antes de gastar tempo com testes mais pesados.

---

### 5. `src/scenarios/load-test.js` — O Teste de Carga Normal
Simula um fluxo sustentado: começa com poucas pessoas, sobe a rampa suavemente até um número confortável, mantém o ritmo por alguns segundos e depois diminui gradualmente. O objetivo é ver se o tempo de resposta se mantém estável sem esquentar demais.

---

### 6. `src/scenarios/stress-test.js` — O Teste de Estresse da Black Friday
Aqui nós apertamos o acelerador! O teste joga ondas sucessivas de pessoas em cima da API:
- Onda 1: 10 pessoas.
- Onda 2: 20 pessoas.
- Onda 3: 30 pessoas simultâneas!
O objetivo é identificar o **ponto de gargalo**: a partir de quantas pessoas o sistema começa a ficar lento ou a responder com erros?

---

## 📊 Como ler o resultado no final?

Quando o teste termina, o k6 imprime um painel no terminal:
- Se tudo estiver com **tique verde (✓)**, o sistema é um foguete e passou no teste de esforço!
- Se aparecer alguma cruz vermelha (✗), sabemos exatamente qual operação ficou lenta e precisa de otimização na infraestrutura.
