# 🐾 PetTrack — Mastering Relational and Non-Relational Database

> **FIAP Challenge 2026 · 2º Ano ADS · Turma 2TDSPF**  
> **Disciplina:** Mastering Relational and Non-Relational Database  
> **Parceiro de Negócio:** Clyvo Vet  
> **Sistema:** PetTrack — *O Sistema Operacional do Cuidado Contínuo de Pets*  

---

## 👥 Integrantes do Grupo

| Nome Completo | RM |
| :--- | :--- |
| **Gabriel Sbrana Campos** | RM 565849 |
| **Moisés Waidemann** | RM 563719 |
| **Richard Freitas** | RM 566127 |
| **Thiago Rodrigues da Mota** | RM 563765 |

---

## 📋 Sobre o Projeto PetTrack

O **PetTrack** é um ecossistema integrado para monitoramento contínuo da saúde animal, conectando tutores, pets e clínicas veterinárias em uma jornada proativa. O sistema centraliza prontuários clínicos, vacinas, telemetria de sensores IoT acoplados a coleiras inteligentes, análise de escore de condição corporal (BCS) via Inteligência Artificial e acompanhamento diário de adesão medicamentosa.

Este repositório contém a infraestrutura completa de **Banco de Dados Relacional Oracle (19c)**, abrangendo modelagem dimensional e relacional na **3ª Forma Normal (3FN)**, scripts DDL com constraints estritas, procedures de carga parametrizadas com tratamento autônomo de exceções, consultas analíticas com funções de janela (`LAG`/`LEAD`), cursores explícitos, além de **Trigger de Auditoria DML, Funções e Procedimentos com saída em JSON e Relatórios com Subtotais Manuais**.

---

## 🏗️ Arquitetura de Integração

         ┌────────────────────────┐
           │ React Native (Mobile)  │
           └───────────┬────────────┘
                       │ HTTP REST
                       ▼
           ┌────────────────────────┐
           │ Spring Boot API (JPA)  │
           └───────────┬────────────┘
                       │ JDBC / OJDBC11
                       ▼
 ┌─────────────────────────────────────────────────────┐
 │      Oracle Database 19c (oracle.fiap.com.br)        │
 │                 Schema: RM563719                    │
 │ ─────────────────────────────────────────────────── │
 │  • 14 Tabelas Relacionais (3FN)                     │
 │  • Triggers de Auditoria DML (:OLD e :NEW)          │
 │  • Procedures de Carga & Log Autônomo               │
 │  • Funções de Regra de Negócio e Geração de JSON    │
 │  • Relatórios com Quebra de Subtotais Manuais       │
 └─────────────────────────────────────────────────────┘
      ▲                                    ▲
      │ HTTP / REST                        │ HTTP / REST
      ┌─────────┴───────────────┐ ┌─────────┴───────────────┐ │ Node-RED (IoT / MQTT) │ │ Python FastAPI (IA/BCS) │ │ Ingestão de Coleira IoT │ │ Análise de Fotos de Pets│ └─────────────────────────┘ └─────────────────────────┘
      

**Parâmetros de Conexão:**
* **Host / Porta / SID:** `oracle.fiap.com.br:1521:ORCL`
* **Usuário:** `RM563719`

---

## 🗃️ Entidades do Modelo de Dados (14 Tabelas)

| Tabela | Descrição e Papel no Sistema |
| :--- | :--- |
| `TB_TUTOR` | Cadastro dos proprietários dos pets (nome, e-mail único, telefone, endereço). |
| `TB_CLINICA` | Clínicas e hospitais veterinários parceiros da rede Clyvo Vet (CNPJ único). |
| `TB_PET` | Animais cadastrados vinculados a um tutor e a uma clínica principal. |
| `TB_EVENTO_CLINICO` | Prontuário médico: histórico de consultas, cirurgias, exames e retornos. |
| `TB_PROTOCOLO_PREVENTIVO` | Gestão preventiva: vacinas (V10, Antirrábica), vermífugos, antipulgas e check-ups. |
| `TB_MEDICAMENTO` | Prescrições medicamentosas originadas de eventos clínicos com dosagem e frequência. |
| `TB_ADESAO_MEDICAMENTO` | Confirmação diária pelo tutor se a dose prescrita foi administrada (`S`/`N`). |
| `TB_NOTIFICACAO` | Notificações push e lembretes direcionados ao aplicativo móvel do tutor. |
| `TB_SCORE_HISTORICO` | Evolução temporal do Health Score geral do animal (pontuação de 0 a 100). |
| `TB_BCS_HISTORICO` | Histórico de Body Condition Score (1 a 9) calculado via visão computacional por foto. |
| `TB_COLLAR_LEITURA` | Leituras de telemetria IoT da coleira inteligente (temperatura e atividade). |
| `TB_ALERTA` | Alertas clínicos disparados pelo sistema (febre, sedentarismo, atraso de dose, BCS crítico). |
| `TB_LOG_ERRO` | Tabela técnica para persistência autônoma de exceções capturadas nas procedures. |
| `TB_AUDITORIA_PETTRACK` | Auditoria DML detalhada com histórico de alterações em `TB_PET` (`:OLD` e `:NEW`). |

---

## 🏆 Requisitos da Disciplina Atendidos (100 Pontos + Sprint 3)

### 1. Modelagem de Dados (10 pts)
* **DER Lógico (Notação de Barker)** e **MER Físico** desenvolvidos no **Oracle SQL Developer Data Modeler**.
* Estrutura relacional 100% normalizada na **3ª Forma Normal (3FN)**, eliminando dependências parciais e transitivas.

### 2. Scripts DDL e Constraints (10 pts)
* 14 Sequences para autoincremento de chaves primárias (`START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE`).
* Chaves Primárias (`PK`), Chaves Estrangeiras (`FK`), Restrições de Nulo (`NOT NULL`), Validações de Domínio (`CHECK`) e Integridade Exclusiva (`UNIQUE`).

### 3. Procedures de Carga com Tratamento de Exceções (20 pts)
* 13 Stored Procedures de inserção cobrindo todas as tabelas do sistema.
* Carga totalmente parametrizada (sem valores fixos *hard-coded*).
* Tratamento robusto com `EXCEPTION WHEN OTHERS` + tratamentos específicos (`DUP_VAL_ON_INDEX`, `VALUE_ERROR`, `NO_DATA_FOUND`).
* Gravação autônoma via procedure `PRC_INSERT_LOG_ERRO` com `PRAGMA AUTONOMOUS_TRANSACTION`.

### 4. Consultas com JOINs e Agrupamento (20 pts)
* Blocos anônimos contendo no mínimo 3 `JOINs` com `GROUP BY` e `ORDER BY`:
  * *Bloco 1:* Média de Health Score agrupada por Clínica.
  * *Bloco 2:* Totalização de alertas críticos nos últimos 30 dias por Pet e Tutor.
  * *Bloco 3:* Rastreamento de adesão medicamentosa relacionando Tutor, Pet e Medicamento.

### 5. Funções Analíticas LAG / LEAD (20 pts)
* Bloco anônimo comparativo em `TB_SCORE_HISTORICO` utilizando `LAG` (score anterior) e `LEAD` (próximo score) particionado por pet.
* Tratamento com `NVL` exibindo `"Vazio"` quando não há registro anterior ou posterior.

### 6. Cursores Explícitos e Condicionais (20 pts)
* 4 blocos anônimos com cursor explícito e estruturas `IF/THEN/ELSE`:
  * Classificação e sumarização por faixas de Health Score (< 40 crítico, 40-70 atenção, > 70 saudável).
  * Filtragem de alertas de febre.
  * Verificação de protocolos preventivos com status pendente.
  * Detecção de leituras térmicas anômalas acima de 38.0°C.

---

## ⚡ Objetos Avançados do 2º Semestre (Sprint 3)

### 🛡️ 1. Tabela e Trigger de Auditoria DML
* **Tabela:** `TB_AUDITORIA_PETTRACK`
* **Trigger:** `TRG_AUDITORIA_PET` (em `TB_PET`)
* **Funcionalidade:** Monitora todas as operações de `INSERT`, `UPDATE` e `DELETE`. Registra o nome da tabela, usuário Oracle (`USER`), data/hora (`SYSDATE`), tipo da operação e os payloads completos dos valores anteriores (`:OLD`) e novos (`:NEW`).

### ⚙️ 2. Função 1: Transformação Relacional para JSON Manual
* **Nome:** `FN_MONTAR_JSON_PET`
* **Funcionalidade:** Recebe dados relacionais de um pet e monta manualmente uma string formatada em JSON com escape de caracteres (`REPLACE`), sem bibliotecas externas.
* **Tratamento de 4 Exceções:**
  1. `EX_DADOS_OBRIGATORIOS` (Identificador, nome ou tutor nulos);
  2. `EX_PESO_INVALIDO` (Peso menor ou igual a zero);
  3. `VALUE_ERROR` (Erro de conversão de dados);
  4. `WHEN OTHERS` (Falhas inesperadas com log em `TB_LOG_ERRO`).

### 💊 3. Função 2: Regra de Negócio — Taxa de Adesão Medicamentosa
* **Nome:** `FN_CALCULAR_TAXA_ADESAO`
* **Funcionalidade:** Calcula o percentual exato ($0.00\%$ a $100.00\%$) de doses tomadas (`ST_TOMOU = 'S'`) em relação ao total prescrito para um medicamento.
* **Tratamento de 4 Exceções:**
  1. `EX_MEDICAMENTO_INEXISTENTE` (Medicamento não cadastrado no banco);
  2. `EX_SEM_DOSES_REGISTRADAS` (Ausência de histórico de doses);
  3. `ZERO_DIVIDE` (Prevenção de divisão por zero);
  4. `WHEN OTHERS` (Falhas genéricas persistidas no log).

### 📄 4. Procedimento 1: JOIN Relacional com Saída em JSON
* **Nome:** `PRC_LISTAR_PETS_JSON`
* **Funcionalidade:** Executa `INNER JOIN` entre `TB_PET`, `TB_TUTOR` e `TB_CLINICA`, processa cada linha através da `FN_MONTAR_JSON_PET` e imprime a coleção completa de objetos JSON no console via `DBMS_OUTPUT`.
* **Tratamento de 4 Exceções:** `EX_PARAMETRO_INVALIDO`, `EX_NENHUM_REGISTRO`, `NO_DATA_FOUND` e `WHEN OTHERS`.

### 📊 5. Procedimento 2: Relatório com Quebra de Subtotais e Total Geral
* **Nome:** `PRC_RELATORIO_SUBTOTAIS_MANUAL`
* **Funcionalidade:** Gera um relatório formatado em colunas contendo 2 categorias (`NM_CLINICA` e `NM_PET`) e 1 métrica numérica (`NR_ATIVIDADE` da coleira). Implementa lógica de quebra de controle manual para imprimir o **Sub Total por Clínica** e o **Total Geral** ao final.
* **Tratamento de 4 Exceções:** `EX_SEM_DADOS_FATOS`, `EX_VALOR_NEGATIVO`, `VALUE_ERROR` e `WHEN OTHERS`.

---

## 🚀 Como Executar o Script no Oracle SQL Developer

1. Abra o **Oracle SQL Developer** ou **PL/SQL Developer**.
2. Conecte-se ao seu schema da FIAP (`oracle.fiap.com.br:1521:ORCL`).
3. Abra o arquivo SQL:
   `2TDSF_2026_CodigoSql_Moises_GabrielSbrana_Thiago_RIchard.sql.sql`.
4. Certifique-se de que a saída do console está habilitada:
   ```sql
   SET SERVEROUTPUT ON SIZE UNLIMITED;
