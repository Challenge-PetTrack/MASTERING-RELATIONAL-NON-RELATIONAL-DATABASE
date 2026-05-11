# 🐾 PetTrack — Banco de Dados Oracle

> Sistema operacional do cuidado contínuo de pets — FIAP Challenge 2026 · 1º Semestre · 2TDS

---

## 📋 Sobre o Projeto

O **PetTrack** é uma plataforma que conecta tutores, pets e clínicas veterinárias em uma jornada contínua de saúde animal. A solução acompanha eventos clínicos, protocolos preventivos, adesão terapêutica, dados de IoT via collar inteligente e análise de condição corporal por IA.

Este repositório contém a camada de **Banco de Dados Relacional Oracle**, cobrindo modelagem, DDL, procedures de carga, relatórios PL/SQL e blocos analíticos.

---

## 🏗️ Arquitetura de Integração

```
React Native App
      │
      ▼
Spring Boot API (JPA/Hibernate)
      │              │              │
      ▼              ▼              ▼
  Oracle DB     Node-RED        Python FastAPI
  (este repo)  (IoT/MQTT →      (BCS via IA →
               TB_ALERTA)      TB_BCS_HISTORICO)
```

**Conexão Oracle:** `oracle.fiap.com.br:1521:ORCL`

---

## 🗂️ Estrutura do Repositório

```
📁 pettrack-db/
├── 📄 README.md
├── 📁 ddl/
│   └── 01_create_tables.sql       -- Sequences + todas as tabelas + constraints
├── 📁 procedures/
│   └── 02_procedures_carga.sql    -- 1 procedure por tabela + TB_LOG_ERRO
├── 📁 dados/
│   └── 03_carga_dados_teste.sql   -- Chamadas das procedures com dados reais
├── 📁 relatorios/
│   ├── 04_blocos_join.sql         -- Blocos anônimos com JOIN/GROUP BY/ORDER BY
│   ├── 05_bloco_lag_lead.sql      -- Análise temporal do health score
│   └── 06_cursores_explicitos.sql -- 4 relatórios com cursor + IF/CASE
```

---

## 🗃️ Entidades do Modelo

| Tabela | Descrição |
|---|---|
| `TB_TUTOR` | Responsável pelo pet |
| `TB_CLINICA` | Clínica veterinária parceira |
| `TB_PET` | Animal cadastrado, vinculado a tutor e clínica |
| `TB_EVENTO_CLINICO` | Consultas, cirurgias, retornos, exames |
| `TB_PROTOCOLO_PREVENTIVO` | Vacinas, vermífugo, check-ups agendados |
| `TB_MEDICAMENTO` | Medicamentos prescritos por evento clínico |
| `TB_ADESAO_MEDICAMENTO` | Confirmações de dose administrada |
| `TB_NOTIFICACAO` | Notificações enviadas ao tutor |
| `TB_SCORE_HISTORICO` | Evolução do health score (0–100) por pet |
| `TB_BCS_HISTORICO` | Histórico de Body Condition Score (1–9) por foto + IA |
| `TB_COLLAR_LEITURA` | Leituras de temperatura e atividade via IoT/MQTT |
| `TB_ALERTA` | Alertas gerados pelo Node-RED (febre, sedentarismo) |
| `TB_LOG_ERRO` | Registro de erros das procedures (auditoria) |

---

## ✅ Requisitos Implementados

### 1. Modelagem (10 pts)
- DER Lógico em notação Barker (Oracle Data Modeler)
- MER Físico gerado pelo Oracle Data Modeler
- Todas as tabelas na 3ª Forma Normal (3FN)

### 2. Scripts DDL (10 pts)
- `CREATE TABLE` com `PK`, `FK`, `NOT NULL`, `CHECK` e `UNIQUE`
- Sequences para todas as PKs
- Executável no Oracle FIAP

### 3. Procedures de Carga (20 pts)
- Uma procedure por tabela, carga por parâmetro (sem hard-code)
- Todas com `EXCEPTION WHEN OTHERS` + 2 tratamentos específicos
- Erros persistidos em `TB_LOG_ERRO` com: procedure, usuário, data, código e mensagem

### 4. Blocos Anônimos com JOINs (20 pts)
- Mínimo 3 consultas com `JOIN` + `GROUP BY` + `ORDER BY`
- Exemplos: média de health score por clínica, adesão por tutor, alertas por tipo

### 5. Bloco LAG/LEAD (20 pts)
- `TB_SCORE_HISTORICO`: score atual, anterior e próximo por pet
- Exibe `"Vazio"` quando não há linha anterior ou próxima
- Mínimo 5 linhas de dados por pet

### 6. Cursores Explícitos (20 pts)
- 4 blocos anônimos com cursor explícito + `IF`/`CASE`
- Inclui relatório de health score com classificação:
  - 🔴 `Crítico` → score < 40
  - 🟡 `Atenção` → score entre 40 e 70
  - 🟢 `Saudável` → score > 70

---

## 🚀 Como Executar

### Pré-requisitos
- Acesso à rede FIAP (ou VPN)
- SQL Developer, DBeaver ou sqlplus configurado
- Credenciais de acesso ao Oracle FIAP

### Ordem de execução

```bash
# 1. Criar tabelas e sequences
@ddl/01_create_tables.sql

# 2. Criar procedures
@procedures/02_procedures_carga.sql

# 3. Inserir dados de teste
@dados/03_carga_dados_teste.sql

# 4. Executar relatórios
@relatorios/04_blocos_join.sql
@relatorios/05_bloco_lag_lead.sql
@relatorios/06_cursores_explicitos.sql
```

> ⚠️ Execute sempre nesta ordem. As procedures dependem das tabelas; os dados de teste dependem das procedures.

### String de conexão

```
Host:     oracle.fiap.com.br
Porta:    1521
SID:      ORCL
Usuário:  [seu RM]
Senha:    [sua senha FIAP]
```

---

## 🔗 Integração com o restante do projeto

| Serviço | Tecnologia | Tabelas utilizadas |
|---|---|---|
| API principal | Spring Boot + JPA/Hibernate | Todas |
| IoT / Automação | Node-RED + MQTT | `TB_COLLAR_LEITURA`, `TB_ALERTA` |
| Análise de imagem | Python FastAPI + IA | `TB_BCS_HISTORICO` |
| App mobile | React Native | Consome a API Spring |

---

## Integrantes

Nome | RM
--- | ---
Gabriel Sbrana Campos | 565849
Moisés Waidemann Molinillo Júnior | 563719
Richard Freitas | 566127
Thiago Rodrigues da Mota | 563650

---

## 📚 Disciplina

**Mastering Relational and Non-Relational Database** — FIAP 2026 · 1º Semestre · Turma 2TDS Fevereiro  
Challenge parceiro: **Clyvo Vet**
