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
| **Thiago Rodrigues da Mota** | RM 563650 |

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
   ```

---

## Sprint 4 - Entrega final de Banco de Dados

Esta entrega utiliza o backend existente em `../JAVA-ADVANCED/pettrack` e o mesmo
schema Oracle da Sprint 3. A estrutura relacional aprovada foi preservada.
Os arquivos originais SQL e PDF continuam na raiz, sem alterações.

### Entregáveis e validação

| Requisito | Arquivo | Validação |
|---|---|---|
| Modelos lógico e físico (20 pontos, com o SQL original) | `sprint4/modelos/modelos_logico_fisico_sprint4.pdf` | Dois diagramas conferidos visualmente; tabela de auditoria acrescentada à representação |
| Codificação relacional | SQL original da Sprint 3, na raiz | DDL das 13 tabelas compartilhadas coincide com a V1 do Java; base real mantém as tabelas da disciplina |
| Empacotamento (25 pontos) | `sprint4/sql/01_packages_pettrack.sql` | Quatro packages e trigger compilados sem erros; 12 cadastros testados com rollback |
| Procedures chamadas pelo backend | Novas classes `PetProcedureRepository` e `PetProcedureService` no Java | Cadastro pela API e formulário; consultas e erros validados com Oracle real |
| Dataset JSON (20 pontos) | `sprint4/dataset/pets.json` | Exportado pelo controlador Java a partir do Oracle real; 8 documentos, IDs relacionados conferidos |
| MongoDB (25 pontos) | `sprint4/mongo/importar_dataset.js` | 8 documentos importados e conferidos campo a campo; reimportação sem duplicações |
| Demonstração (10 pontos) | Roteiro narrado abaixo | Sequência preparada; vídeo a ser gravado e narrado pelos integrantes |

O PDF atualizado conserva os dois diagramas aprovados e acrescenta a tabela
`TB_AUDITORIA_PETTRACK` que já existia no SQL. A auditoria é uma tabela técnica
sem FK; não foi acrescentado relacionamento à estrutura do banco.

### Packages e contratos

| Package | Conteúdo |
|---|---|
| `PKG_PETTRACK_LOG` | `PRC_INSERT_LOG_ERRO`, com transação autônoma |
| `PKG_PETTRACK_CADASTRO` | As 12 procedures de inserção operacional da Sprint 3 |
| `PKG_PETTRACK_CONSULTA` | Duas funções, listagem JSON e relatório manual de subtotais |
| `PKG_PETTRACK_AUDITORIA` | Lógica do trigger `TRG_AUDITORIA_PET` |

As rotinas standalone da Sprint 3 permanecem disponíveis. As implementações
empacotadas contêm a lógica, e não apenas chamadas às rotinas standalone.
As regras de negócio, tabelas, constraints e relacionamentos foram preservados.

Na versão empacotada, cadastros não executam `COMMIT`: o chamador controla a
transação. Erros são registrados e relançados para impedir que o Java retorne
sucesso em uma inserção rejeitada. O log continua autônomo e a auditoria acompanha
a transação principal. `PRC_INSERT_PET` tem um parâmetro adicional
`P_ID_GERADO OUT`, utilizado pelo Java para consultar e devolver o registro criado.

As duas procedures de consulta devolvem `CLOB` por parâmetro `OUT`. O JSON deixa
de conter títulos e rodapés de console. A serialização continua manual, com
escapes para aspas, barras e caracteres de controle e números independentes da
configuração regional do Oracle. O dataset organiza tutor e clínica como
documentos incorporados, preservando seus IDs relacionais.

`FN_CALCULAR_TAXA_ADESAO` mantém seus retornos anteriores, inclusive `-1`, `0`
e `-99` para os cenários já previstos na Sprint 3.

### Preparação e execução do Oracle/backend

Pré-requisitos: Java 21, conexão ao Oracle da FIAP e a base da Sprint 3 já
existente no mesmo schema indicado em `JAVA-ADVANCED/pettrack/src/main/resources/application.properties`.
A configuração de conexão existente é reutilizada; nenhuma senha deve ser
incluída nos comandos, no dataset ou no vídeo.

1. Abra a pasta `JAVA-ADVANCED/pettrack` no terminal e execute:

   ```powershell
   $env:JAVA_HOME = 'C:\Users\Sbrana\.jdks\ms-21.0.11'
   .\mvnw.cmd -DskipTests package
   # Após BUILD SUCCESS:
   & "$env:JAVA_HOME\bin\java.exe" -jar '.\target\PetTrack-0.0.1-SNAPSHOT.jar'
   ```

   A execução pelo JAR evita a falha de codificação de `spring-boot:run` no
   Windows quando o caminho contém `°`. A classe principal e a aplicação são
   as mesmas. Mantenha o terminal aberto enquanto utilizar o sistema.

2. O Flyway aplica a nova migração `V4__packages_pettrack.sql`, cuja codificação
   é igual ao script `sprint4/sql/01_packages_pettrack.sql` deste repositório.
   No ambiente validado, a V4 já foi aplicada com sucesso pelo próprio Flyway.
   Não edite nem reaplique as migrations V1, V2 e V3.
3. Alternativamente, o script de packages pode ser executado com F5 no SQL
   Developer, conectado à mesma base. Ele não recria tabelas nem carga dados.
   Não execute o script completo da Sprint 3 sobre a base atual: ele começa com
   `DROP TABLE` e `DROP SEQUENCE`.
4. Confira os objetos com:

   ```sql
   SELECT object_name, object_type, status
   FROM user_objects
   WHERE object_name LIKE 'PKG_PETTRACK_%'
      OR object_name = 'TRG_AUDITORIA_PET'
   ORDER BY object_name, object_type;

   SELECT name, type, line, text
   FROM user_errors
   WHERE name LIKE 'PKG_PETTRACK_%'
      OR name = 'TRG_AUDITORIA_PET';
   -- Resultado esperado da segunda consulta: nenhuma linha.
   ```

### Operações existentes e demonstração de procedures

Entre em `http://localhost:8080/login` com as credenciais de avaliação já
documentadas no README do Java. Exportação e relatório exigem perfil ADMIN ou VET.

| Operação | Acesso | Procedure executada |
|---|---|---|
| Cadastro de pet pela API | `POST /pet/novo` | `PKG_PETTRACK_CADASTRO.PRC_INSERT_PET` |
| Cadastro de pet pelo formulário existente | `/admin/pets/novo` → salvar | A mesma procedure de cadastro |
| Download do dataset | `GET /pet/exportar-json` | `PKG_PETTRACK_CONSULTA.PRC_LISTAR_PETS_JSON` |
| Relatório de atividades | `GET /pet/relatorio-atividades` | `PKG_PETTRACK_CONSULTA.PRC_RELATORIO_SUBTOTAIS_MANUAL` |

Edição e exclusão dos pets continuam no fluxo existente. As novas operações de
consulta não alteram as respostas das listagens anteriores. É possível filtrar
a exportação por espécie: `/pet/exportar-json?especie=Cao` (use a grafia dos dados
cadastrados). Filtro com menos de dois caracteres retorna 400; filtro válido sem
resultados devolve `[]`. A importação exige um dataset não vazio.

Baixe o arquivo por `http://localhost:8080/pet/exportar-json` e coloque-o em
`sprint4/dataset/pets.json`. Esse é o mesmo caminho do dataset entregue.

### MongoDB local

O servidor e o shell foram instalados em `%LOCALAPPDATA%\PetTrackMongoDB`.
O servidor usa apenas `127.0.0.1:27017`; os dados ficam na subpasta `data`.
Não é necessário instalar driver MongoDB no backend: a entrega usa o script
de criação e importação no `mongosh`, mantendo o Oracle como banco do backend.

Na raiz deste repositório de banco, em PowerShell:

```powershell
# Instalação reproduzível, caso ainda não exista:
.\sprint4\mongo\mongodb_local.ps1 -Acao Instalar

# Inicializar o servidor local:
.\sprint4\mongo\mongodb_local.ps1 -Acao Iniciar

$mongosh = Join-Path $env:LOCALAPPDATA 'PetTrackMongoDB/mongosh-2.13.0-win32-x64/bin/mongosh.exe'
& $mongosh 'mongodb://127.0.0.1:27017/pettrack_sprint4' --quiet --file '.\sprint4\mongo\importar_dataset.js'

# Abrir o shell para demonstrar as consultas:
& $mongosh 'mongodb://127.0.0.1:27017/pettrack_sprint4'
```

O instalador usa MongoDB Community 8.0.34 e mongosh 2.13.0, com hashes SHA256
conferidos contra o [manifesto oficial do MongoDB](https://downloads.mongodb.org/full.json)
e a [release oficial do mongosh](https://github.com/mongodb-js/mongosh/releases/tag/v2.13.0).
Os binários e os arquivos internos do servidor ficam fora do repositório.

O script cria a coleção `pets`, validador documental e índices por ID do pet,
tutor e clínica. `_id` corresponde ao ID relacional do pet. A importação usa
upsert: repetir o mesmo dataset não duplica documentos e não apaga dados.
Caso futuramente sejam removidos pets no Oracle, uma nova importação não exclui
automaticamente documentos antigos do MongoDB.

No shell:

```javascript
db.pets.countDocuments()
db.pets.find({}, { _id: 0, idPet: 1, nome: 1, tutor: 1, clinica: 1 })
db.pets.find({ 'tutor.id': 3 }) // Substitua pelo ID observado no dataset.
db.pets.aggregate([
  { $group: { _id: '$clinica.id', clinica: { $first: '$clinica.nome' }, pets: { $sum: 1 } } },
  { $sort: { _id: 1 } }
])
```

Para importar um arquivo em outro local, defina `PETTRACK_DATASET` com o caminho
absoluto antes de executar o script. Para encerrar esta instância local, no shell:
`db.getSiblingDB('admin').shutdownServer()`.

### Testes executáveis

Na pasta `JAVA-ADVANCED/pettrack`:

```powershell
# Seis testes unitários, sem banco:
.\mvnw.cmd '-Dtest=PetProcedureServiceTest' test

# Testes de integração reais; exige conexão à FIAP e packages instalados:
$env:PETTRACK_ORACLE_TESTS = 'true'
.\mvnw.cmd '-Dtest=PetProcedureOracleIT' test

# Valida o histórico do Flyway e instala V4 se pendente:
.\mvnw.cmd '-Dtest=PetTrackFlywayOracleIT' test
```

Foram executados **16 testes Java: 6 unitários, 9 de integração com Oracle e
1 de migração Flyway**, todos aprovados. A suíte de integração usa o controlador,
serviços, JDBC/JPA e Oracle reais; somente o initializer de usuários é substituído
para evitar alterações nos usuários durante os testes. A autenticação dos testes
usa os perfis de teste do Spring Security. Cadastros de teste têm rollback.

O teste de integração pode gravar o arquivo devolvido pelo controlador quando
recebe `-Dpettrack.dataset=<caminho-absoluto>`. Foi esse mecanismo que gerou o
dataset real entregue, conferindo os IDs de tutor e clínica contra o Oracle.

No SQL Developer, execute também `sprint4/sql/02_validacao_sprint4.sql` com F5,
habilitando `SET SERVEROUTPUT ON`. Ele exercita os 12 cadastros, funções, consultas
e auditoria, conferindo resultados e desfazendo seus próprios dados ao final.
Sequences avançam normalmente; logs autônomos de erros são preservados.
Esse script foi executado com sucesso. Os 6 pets originais permaneceram na base.

### Roteiro objetivo do vídeo narrado

1. **Apresentação:** mostre os modelos lógico e físico atualizados e os arquivos
   SQL da Sprint 3 e Sprint 4. Explique que a modelagem aprovada foi reutilizada
   e a auditoria existente foi incluída nos diagramas.
2. **Empacotamento:** mostre os quatro packages, a spec e o body, o tratamento
   de erros e a chamada do trigger ao package de auditoria. Execute a consulta
   de `USER_ERRORS`, mostrando que não há erros dos objetos PetTrack.
3. **Backend → procedure → inserção:** abra a aplicação, entre como ADMIN/VET
   e cadastre um pet pelo formulário existente. Mostre no código o caminho
   `AdminWebController → PetProcedureService → PetProcedureRepository → package`.
4. **Persistência e auditoria:** no SQL Developer, consulte o registro recém-criado
   por nome e confira `ID_PET`, `ID_TUTOR` e `ID_CLINICA`. Consulte a auditoria:

   ```sql
   SELECT id_pet, nm_pet, id_tutor, id_clinica FROM tb_pet ORDER BY id_pet DESC;
   SELECT id_auditoria, tp_operacao, ds_valores_novos
   FROM tb_auditoria_pettrack ORDER BY id_auditoria DESC;
   ```

5. **Consultas pelo backend:** abra `/pet/relatorio-atividades` e mostre o
   subtotal por clínica e o total geral. Abra `/pet/exportar-json`, baixe o JSON
   e mostre os dados e os documentos incorporados de tutor/clínica.
6. **Oracle → JSON → MongoDB:** substitua `sprint4/dataset/pets.json` pelo
   download atualizado, execute a importação no `mongosh` e mostre a contagem,
   a consulta por tutor e o agrupamento por clínica. Os números devem acompanhar
   a quantidade atual de pets exportados, inclusive o pet cadastrado no vídeo.
7. **Conclusão:** apresente os testes e os entregáveis. Grave com narração clara;
   confirme que todos os processos demonstrados terminaram sem erro.

O vídeo deve ser executado e narrado pelos integrantes.
