# ⚡ 04-perf-k6 | Testes de Performance & Carga com Grafana k6

Módulo de engenharia de performance e testes de carga automatizados desenvolvido com **Grafana k6 (JavaScript ES6)** contra a API RESTful **ServeRest**. O projeto implementa arquitetura modular, definição rigorosa de **SLAs (Thresholds)**, controle de estágios de carga (**Stages / Ramp-up & Ramp-down**), métricas customizadas de telemetria e múltiplos cenários de teste (Smoke, Load e Stress).

---

## 🎯 API Alvo
- **Nome:** ServeRest API
- **Base URL:** `https://serverest.dev`

---

## 🏗️ Arquitetura do Projeto

```text
04-perf-k6/
├── src/
│   ├── config/
│   │   ├── environments.js    # URLs, endpoints e cabeçalhos padrão
│   │   └── thresholds.js      # Definição de SLAs e critérios de aprovação/reprovação
│   ├── payloads/              # Geradores de massa de teste em tempo de execução
│   │   └── user.payload.js    # Fábrica de usuários e produtos aleatórios para VUs
│   ├── scenarios/             # Scripts executáveis de teste
│   │   ├── smoke-test.js      # Verificação rápida de sanidade (1 a 2 VUs)
│   │   ├── load-test.js       # Teste de carga com rampa e estabilidade sustentada
│   │   └── stress-test.js     # Identificação de pontos de saturação e degradação
│   └── utils/
│       └── helpers.js         # Métricas customizadas (Trend, Counter, Rate) e think time
├── package.json               # Scripts NPM para facilitar execução
└── README.md                  # Documentação técnica do módulo
```

---

## 📊 Matriz de SLAs e Thresholds

| Cenário | Métrica | Critério de Aceite (SLA) | Objetivo |
|---|---|---|---|
| **Smoke** | `http_req_duration` | `p(95) < 500ms`, `p(99) < 1000ms` | Garantir que a API responde dentro do limite aceitável sob carga mínima |
| **Smoke** | `http_req_failed` | `rate < 0.01` (< 1%) | Validar integridade e ausência de falhas técnicas |
| **Smoke** | `checks` | `rate > 0.99` (> 99%) | Validar assertividade dos contratos e dados retornados |
| **Load** | `http_req_duration` | `p(95) < 800ms`, `p(99) < 1500ms` | Validar tempo de resposta sustentado durante o platô de usuários simultâneos |
| **Load** | `http_req_failed` | `rate < 0.02` (< 2%) | Garantir estabilidade com tráfego simultâneo |
| **Stress** | `http_req_duration` | `p(95) < 2000ms`, `p(99) < 3500ms` | Mensurar o comportamento sob pico e identificar tempo de recuperação |
| **Stress** | `http_req_failed` | `rate < 0.05` (< 5%) | Monitorar taxa de erros em condições extremas |

---

## 📈 Métricas Customizadas Implementadas

- **`login_duration_ms` (Trend):** Mede especificamente o tempo gasto na autenticação e geração do token JWT.
- **`users_api_duration_ms` (Trend):** Mede a latência das operações da entidade de usuários (listagem e cadastro).
- **`products_api_duration_ms` (Trend):** Mede a latência da consulta ao catálogo de produtos.
- **`successful_logins_total` (Counter):** Total acumulado de logins concluídos com êxito.
- **`custom_error_rate` (Rate):** Taxa percentual customizada de falhas ou anomalias nas respostas.

---

## 🚀 Como Executar

### Pré-requisitos
- Ter o [Grafana k6](https://k6.io/docs/get-started/installation/) instalado.
  - Windows: `winget install Grafana.k6` ou executável portátil `k6.exe` no PATH.
  - Mac: `brew install k6`
  - Linux: `sudo apt-get install k6`

### Execução via NPM (na pasta `04-perf-k6`):

```bash
cd 04-perf-k6

# 1. Executar Smoke Test (Verificação rápida - 1 VU)
npm run test:smoke

# 2. Executar Load Test (Carga sustentada com ramp-up)
npm run test:load

# 3. Executar Stress Test (Picos de carga e identificação de gargalo)
npm run test:stress
```

### Execução direta via binário k6:
```bash
k6 run src/scenarios/smoke-test.js
k6 run src/scenarios/load-test.js
k6 run src/scenarios/stress-test.js
```
