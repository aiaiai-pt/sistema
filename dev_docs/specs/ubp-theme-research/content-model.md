# UBP Theme — Content Model

Realistic Portuguese municipal content for stress-testing the UBP dark theme demo. All copy in PT-PT. No placeholders. Data designed to exercise overflow, truncation, empty states, and length variance.

**Scope:** Urban-management backoffice serving multiple Portuguese municipalities on a shared SaaS platform operated by Ubiwhere. Verticals represent domains of urban data/services the municipalities manage.

---

## 1. Verticals (Domínios de Gestão Urbana)

15 verticals across 5 categories. Includes edge cases flagged inline.

| # | Nome | Categoria | Descrição | Estado | Entidades | Edge Case |
|---|------|-----------|-----------|--------|-----------|-----------|
| V-01 | Autocarros | Mobilidade | Gestão da frota de autocarros urbanos, horários, ocupação em tempo real e integração com a rede intermodal. | Activo | 248 | — |
| V-02 | Trânsito | Mobilidade | Monitorização de fluxo viário, incidentes e tempos de percurso nas principais artérias do município. | Activo | 1.432 | — |
| V-03 | Estacionamento Público Rotativo | Mobilidade | Lugares de estacionamento tarifado, ocupação por zona e gestão de infracções. | Activo | 86 | Nome longo (34 chars) |
| V-04 | Bicicletas Partilhadas | Micro Mobilidade | Rede de bicicletas de uso partilhado, docas e disponibilidade em tempo real. | Activo | 512 | — |
| V-05 | Trotinetes | Micro Mobilidade | Frota de trotinetes eléctricas em regime free-floating com geo-cercas de operação. | Rascunho | 0 | **Vertical nova, 0 entidades** |
| V-06 | Meteorologia | Ambiente | Estações meteorológicas municipais com leituras de temperatura, humidade, vento e precipitação. | Activo | 24 | — |
| V-07 | Qualidade do Ar | Ambiente | Sensores de poluentes atmosféricos (PM2.5, PM10, NO₂, O₃) distribuídos pela malha urbana. | Activo | 38 | — |
| V-08 | Ruído Ambiente | Ambiente |  | Activo | 17 | **Descrição vazia** |
| V-09 | Resíduos Sólidos Urbanos | Ambiente | Contentores com sensores de enchimento, rotas de recolha e indicadores de reciclagem por freguesia. | Activo | 3.204 | — |
| V-10 | Iluminação Pública | Infraestrutura | Inventário de pontos de luz, consumo energético e gestão de avarias. | Activo | 18.976 | — |
| V-11 | Rede de Águas e Saneamento | Infraestrutura | Contadores inteligentes, pressão na rede e deteção de fugas em tempo real. | Inactivo | 452 | Inactivo |
| V-12 | Espaços Verdes | Infraestrutura | Cadastro de jardins, parques e árvores em arruamento com estado fitossanitário. | Activo | 874 | — |
| V-13 | Pontos de Interesse Turístico | Turismo e Cultura | Monumentos, miradouros e equipamentos culturais com horários e afluência estimada. | Activo | 193 | — |
| V-14 | Eventos Culturais Municipais | Turismo e Cultura | Agenda de eventos promovidos ou apoiados pelo município com localização e público estimado. | Activo | 67 | — |
| V-15 | Wi-Fi Municipal | Infraestrutura | Hotspots de acesso público gratuito, utilização e estado operacional dos equipamentos. | Activo | 142 | — |

**Edge case summary:**
- **Nome longo:** V-03 "Estacionamento Público Rotativo" (34 chars)
- **Descrição vazia:** V-08 "Ruído Ambiente" — rendered as placeholder or em dash
- **Rascunho / 0 entidades:** V-05 "Trotinetes" — tests empty-state of attached-entities widget
- **Inactivo:** V-11 "Rede de Águas e Saneamento" — tests muted/disabled row styling

---

## 2. Municípios

9 municipalities. Includes compound-name truncation case.

| Código | Nome Completo | Curto | Domínio Email |
|--------|---------------|-------|----------------|
| M-LIS | Câmara Municipal de Lisboa | CM Lisboa | cm-lisboa.pt |
| M-PRT | Câmara Municipal do Porto | CM Porto | cm-porto.pt |
| M-VNG | Câmara Municipal de Vila Nova de Gaia | CM V. N. Gaia | cm-gaia.pt |
| M-SNT | Câmara Municipal de Sintra | CM Sintra | cm-sintra.pt |
| M-LRS | Câmara Municipal de Loures | CM Loures | cm-loures.pt |
| M-CBR | Câmara Municipal de Coimbra | CM Coimbra | cm-coimbra.pt |
| M-AVR | Câmara Municipal de Aveiro | CM Aveiro | cm-aveiro.pt |
| M-BRG | Câmara Municipal de Braga | CM Braga | cm-braga.pt |
| M-PDL | Câmara Municipal de Ponta Delgada | CM P. Delgada | cm-pontadelgada.pt |

**Edge cases:**
- **Nome composto com truncagem:** "Câmara Municipal de Vila Nova de Gaia" (38 chars) — needs `text-overflow: ellipsis` or multi-line strategy
- **Domínio longo:** `cm-pontadelgada.pt` — stresses email column width

**Service provider (not a municipality):**
- **Ubiwhere** — domínio `ubiwhere.com`. Operador da plataforma; alguns utilizadores pertencem à Ubiwhere com papel de suporte/admin técnico.

---

## 3. Utilizadores

17 users. Realistic PT names, mixed genders, state distribution: 14 Activo / 2 Bloqueado / 1 Inactivo.

| ID | Nome Completo | Email | Organização | Grupos | Estado | Último Acesso |
|----|---------------|-------|-------------|--------|--------|----------------|
| U-001 | Ana Rita Fonseca | ana.fonseca@cm-lisboa.pt | CM Lisboa | Admin Municipal, Gestor Ambiental | Activo | há 2 min |
| U-002 | João Miguel Carvalho | joao.carvalho@cm-lisboa.pt | CM Lisboa | Técnico de SIG | Activo | há 14 min |
| U-003 | Maria Leonor Albuquerque Pinheiro | maria.pinheiro@cm-porto.pt | CM Porto | Admin Municipal, Gestor de Obras Públicas, Gestor Ambiental, Auditor Interno, Aprovador de Contratos | Activo | há 1 h | **5 grupos — chip overflow "+3"** |
| U-004 | Pedro Nuno Ribeiro | pedro.ribeiro@cm-porto.pt | CM Porto | Gestor de Mobilidade | Activo | há 3 h |
| U-005 | Catarina Sousa Mendes | catarina.mendes@cm-gaia.pt | CM V. N. Gaia | Técnico de SIG, Colaborador Temporário | Activo | há 1 dia |
| U-006 | Francisco Xavier Meneses da Silveira | francisco.silveira@cm-sintra.pt | CM Sintra | Admin Municipal | Activo | há 3 dias | **Nome extremamente longo (37 chars)** |
| U-007 | Inês Almeida | ines.almeida@cm-sintra.pt | CM Sintra | Gestor Ambiental | Activo | há 2 h |
| U-008 | Rui Manuel Tavares | rui.tavares@cm-loures.pt | CM Loures | Gestor de Mobilidade, Técnico de SIG | Activo | há 47 min |
| U-009 | Sofia Beatriz Nogueira | sofia.nogueira@cm-loures.pt | CM Loures | Colaborador Temporário | Inactivo | há 94 dias |
| U-010 | Tiago Esteves | tiago.esteves@cm-coimbra.pt | CM Coimbra | Admin Municipal, Aprovador de Contratos | Activo | há 26 min |
| U-011 | Margarida Oliveira Duarte | margarida.duarte@cm-coimbra.pt | CM Coimbra | Gestor de Obras Públicas | Bloqueado | há 18 dias |
| U-012 | Nuno Filipe Gonçalves | nuno.goncalves@cm-aveiro.pt | CM Aveiro | Técnico de SIG, Gestor Ambiental | Activo | há 5 h |
| U-013 | Beatriz Saraiva | beatriz.saraiva@cm-braga.pt | CM Braga | Gestor de Mobilidade | Activo | há 12 min |
| U-014 | Henrique Machado Cordeiro | henrique.cordeiro@cm-braga.pt | CM Braga | Admin Municipal | Bloqueado | há 7 dias |
| U-015 | Joana Vasconcelos Antunes | joana.antunes@cm-pontadelgada.pt | CM P. Delgada | Gestor Ambiental, Auditor Interno | Activo | há 2 dias | **Email longo — envolve/wrap** |
| U-016 | Ricardo Machado | ricardo.machado@ubiwhere.com | Ubiwhere | IT Admin, Admin Municipal | Activo | há 4 min |
| U-017 | Diogo Pereira Lampreia | diogo.lampreia@ubiwhere.com | Ubiwhere | IT Admin | Activo | nunca |

**Edge cases called out:**
- **U-003 Maria Leonor Albuquerque Pinheiro** — 5 grupos. Renderização: mostrar 2 chips + `+3` pill.
- **U-006 Francisco Xavier Meneses da Silveira** — 37 chars. Stress-test cell width; decide truncate-vs-wrap.
- **U-015** — email `joana.antunes@cm-pontadelgada.pt` (32 chars) — maior risco de wrap na coluna email.
- **U-017 Diogo** — `Último acesso: nunca` — estado de "nunca acedeu"; deve ter estilo distintivo (muted) sem parecer erro.
- **U-009 Sofia** — Inactivo com último acesso há 94 dias; linha inteira deve aparecer esmaecida.
- **U-011, U-014** — Bloqueado: badge de aviso, ícone de cadeado, acção "Desbloquear" visível em hover.

---

## 4. Grupos / Papéis

9 groups. Ordered roughly by privilege level, descending.

| ID | Nome | Descrição | Membros |
|----|------|-----------|---------|
| G-01 | Admin Municipal | Acesso total à configuração do município, gestão de utilizadores e de verticais. | 6 |
| G-02 | IT Admin | Administração técnica da plataforma, tokens, integrações e logs de sistema. | 2 |
| G-03 | Gestor de Obras Públicas | Gere projectos de obras, empreitadas e impacto em arruamentos e trânsito. | 2 |
| G-04 | Gestor de Mobilidade | Responsável por autocarros, micro-mobilidade, estacionamento e corredores BUS. | 3 |
| G-05 | Gestor Ambiental | Supervisiona qualidade do ar, ruído, resíduos e espaços verdes. | 5 |
| G-06 | Técnico de SIG | Produz e mantém cartografia, camadas geoespaciais e dados de cadastro. | 4 |
| G-07 | Auditor Interno | Acesso só-leitura a logs, alterações e pedidos de aprovação. | 2 |
| G-08 | Aprovador de Contratos | Aprova formalmente contratos, adjudicações e renovações de serviços. | 2 |
| G-09 | Colaborador Temporário | Acesso limitado, com expiração automática ao fim de 90 dias. | 2 |

**Edge cases:**
- **G-03 "Gestor de Obras Públicas"** — 24 chars, o mais longo dos nomes de grupo.
- **G-09 "Colaborador Temporário"** — descrição menciona expiração; a UI deve indicar TTL no grupo (ícone de relógio, por exemplo).

---

## 5. Tokens de Acesso (API)

6 tokens. Scopes reflect the verticals e domínios reais da plataforma.

| Nome | Prefixo + Sufixo | Criado por | Último uso | Expira | Scopes |
|------|-------------------|-------------|------------|--------|--------|
| Integração SIG Lisboa | `ubp_live_a8f3…2c19` | Ana Rita Fonseca (U-001) | há 3 min | 2026-12-31 | `sig:read`, `sig:write`, `verticais:read` |
| Export Meteorologia Porto | `ubp_live_4d71…9ef0` | Pedro Nuno Ribeiro (U-004) | há 2 h | 2026-09-15 | `meteorologia:read` |
| Webhook Resíduos Gaia | `ubp_live_0b22…7a4e` | Catarina Sousa Mendes (U-005) | há 1 dia | 2027-04-01 | `residuos:read`, `residuos:write` |
| Plataforma Turismo Sintra | `ubp_test_9c1e…3b88` | Inês Almeida (U-007) | há 11 dias | 2026-06-30 | `turismo:read` |
| Supervisão Iluminação Aveiro | `ubp_live_f5a0…1d27` | Nuno Filipe Gonçalves (U-012) | há 38 min | 2026-11-20 | `iluminacao:read`, `iluminacao:write`, `alertas:write` |
| Suporte Técnico Ubiwhere (global) | `ubp_live_e2b7…5f33` | Ricardo Machado (U-016) | há 6 h | 2027-12-31 | `admin:*` |

**Design notes for tokens:**
- **Prefixo `ubp_live_` vs `ubp_test_`** — um dos tokens é `test`; o chip de ambiente deve ter cor distinta (amarelo/alerta) versus `live` (verde/neutro).
- **Scope `admin:*`** — wildcard: deve ser visivelmente destacado como privilegiado.
- **Expiração próxima:** nenhum a expirar nos próximos 30 dias neste conjunto — para testar o estado "a expirar em breve", antecipar a data de `Plataforma Turismo Sintra` para ver o badge "Expira em X dias".
- **Nome longo:** "Supervisão Iluminação Aveiro" (28 chars) e "Suporte Técnico Ubiwhere (global)" (33 chars) — testam truncagem na coluna nome.

---

## 6. Tabela de Stress de Comprimento

Resumo do pior caso por tipo de campo. Planear truncagem/wrap nestas colunas.

| Tipo de Campo | Valor Mais Longo | Chars | Recomendação |
|---------------|-------------------|-------|---------------|
| Nome de vertical | "Estacionamento Público Rotativo" | 31 | 1-line truncate com tooltip; reservar ~24ch visíveis |
| Nome de município (completo) | "Câmara Municipal de Vila Nova de Gaia" | 37 | Usar nome curto em tabelas densas; completo em detalhe |
| Nome curto de município | "CM V. N. Gaia" | 13 | Cabe sem truncagem |
| Domínio de email | "cm-pontadelgada.pt" | 18 | Cabe; mas somado ao local-part dá 32+ |
| Nome de utilizador | "Francisco Xavier Meneses da Silveira" | 36 | Truncate em listas; full em cartão/detalhe |
| Email completo | "joana.antunes@cm-pontadelgada.pt" | 32 | Coluna com `min-width: 24ch`; truncate com tooltip |
| Nome de grupo | "Gestor de Obras Públicas" | 24 | Chip com truncate a ~16ch ou wrap em 2 linhas |
| Descrição de vertical | V-09 Resíduos Sólidos Urbanos (~110 chars) | 110 | `line-clamp: 2` em listas; full em detalhe |
| Chips de grupos por utilizador | U-003 com 5 grupos | 5 grupos | Mostrar 2 + `+3`; tooltip lista os restantes |
| Nome de token | "Suporte Técnico Ubiwhere (global)" | 33 | Truncate com tooltip; monospace no prefixo/sufixo |
| Scopes num token | `iluminacao:read`, `iluminacao:write`, `alertas:write` | 3 chips | Mostrar 2 + `+1`; hover revela todos |

**Campos especiais (não-longos mas com estado):**
- **Descrição vazia** (V-08): renderizar `—` esmaecido, nunca deixar célula em branco.
- **`Último acesso: nunca`** (U-017): variante muted do mesmo componente de relative-time.
- **Estado `Rascunho`** (V-05) + 0 entidades: linha com badge "Rascunho" e contagem `0` esmaecida.
- **Estado `Inactivo`** (V-11, U-009): linha inteira a ~60% opacidade; acções primárias desabilitadas.
- **Estado `Bloqueado`** (U-011, U-014): badge vermelho/aviso + ícone cadeado; acção "Desbloquear" em hover.
- **Token `test` vs `live`**: chip de ambiente colorido diferentemente; `admin:*` wildcard destacado.

---

## Notas de Implementação

- Todos os IDs (`V-NN`, `M-XXX`, `U-NNN`, `G-NN`) são estáveis e podem servir de chaves em demos com múltiplas tabelas cruzadas (ex.: token → criado por → utilizador → organização → município).
- Contagens de membros por grupo somam 28, que é maior que os 17 utilizadores — correcto, porque utilizadores pertencem a múltiplos grupos.
- Timestamps relativos cobrem a gama: `há 2 min` / `há 14 min` / `há 1 h` / `há 3 h` / `há 1 dia` / `há 7 dias` / `há 94 dias` / `nunca`. Chega para testar a formatação em todas as bandas.
- Datas absolutas de expiração de tokens usam ISO `YYYY-MM-DD`; a UI pode formatar para `31 Dez 2026` conforme convenção do sistema.
