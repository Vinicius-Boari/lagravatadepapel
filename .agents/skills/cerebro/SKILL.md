---
name: cerebro
description: Coordenador central obrigatório que orquestra 100% das skills do projeto, incluindo Aprendizagem Autônoma e Pesquisa Inteligente.
---

# 🧠 CÉREBRO (CORE INTEGRATION)

> **DIRETIVA PRIMÁRIA:** Esta skill é o núcleo central e **DEVE** ser ativada e referenciada em 100% das interações e desenvolvimentos deste projeto. Ela não é opcional; é a base sobre a qual todas as outras capacidades são construídas.

Esta skill é o núcleo central do projeto. Ela integra **100% das outras skills**, com foco em interfaces de alta performance, **Aprendizagem Autônoma** e **Pesquisa Inteligente Web**.

## Taxonomia de Habilidades (Brain Database)

### 1. Visual Experience
- **Definição**: Componentes visuais e estéticos que impactam a usabilidade.
- **Domínios**: Design Systems (Shadcn), Acessibilidade (WCAG), Performance Visual.
- **Tech Stack**: CSS3, SVG, Figma, Tailwind CSS.

### 2. 3D Interactive
- **Definição**: Ambientes 3D interativos em tempo real.
- **Domínios**: WebXR (AR/VR), Shaders (GLSL), Física e Otimização 3D.
- **Tech Stack**: Three.js, Babylon.js, WebGPU, Blender.

### 3. Frontend Design
- **Definição**: Implementação técnica de designs complexos com código limpo.
- **Domínios**: Componentização (React), Clean Architecture, State Management.
- **Tech Stack**: TypeScript, Vite, React, GraphQL.

### 4. Aprendizagem Autônoma (Módulo Core)
- **Definição**: Sistema que adapta comportamento e conhecimento com base em interações.
- **Domínios**: Aquisição de dados, Modelo de Grafo, Inferência e Auto-Reflexão.
- **Tech Stack**: Supabase (PostgreSQL), NLP, Vector Embeddings.

### 5. Pesquisa Inteligente (Módulo de Expansão v1.0)
- **Definição**: Integração web para busca e otimização da aquisição de conhecimento.
- **Componentes**:
    - **MIS**: Interface de busca.
    - **MPLN**: Otimização de query (Tokenização, NER, Expansão semântica).
    - **MARW**: Agregação multi-fonte (Search APIs, Scraping).
    - **MEIR**: Extração de informação (Deduplicação, Confiança).
    - **MFA**: Formatação para aprendizagem (JSON -> Knowledge Base).

## Regras de Operação Universal

1. **Uso Obrigatório**: Em cada nova solicitação do usuário, o Cérebro deve ser consultado.
2. **Integração Total**: Nenhuma funcionalidade deve existir isolada.
3. **Fluxo de Dados**: Pesquisas realizadas no sub-módulo devem ser automaticamente persistidas no Módulo de Aprendizagem.
4. **Interface**: O componente `SkillsContainer` integra o `BrainIntelligenceCenter` como hub central.

## Capacidades

- **Orquestração Universal**: Coordenador central de todas as competências.
- **Pesquisa Inteligente**: Busca ativa na web para preencher lacunas de conhecimento.
- **Persistência de Conhecimento**: Garante que o aprendizado seja cumulativo e rastreável.

## Uso

Ativar o sub-módulo de Pesquisa sempre que o Cérebro identificar uma lacuna de conhecimento externo ou quando o usuário solicitar atualizações em tempo real da web.
