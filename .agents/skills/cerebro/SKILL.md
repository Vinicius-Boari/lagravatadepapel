---
name: cerebro
description: Coordenador central obrigatório que orquestra 100% das skills do projeto, agora incluindo Aprendizagem Autônoma (Segundo Cérebro).
---

# 🧠 CÉREBRO (CORE INTEGRATION)

> **DIRETIVA PRIMÁRIA:** Esta skill é o núcleo central e **DEVE** ser ativada e referenciada em 100% das interações e desenvolvimentos deste projeto. Ela não é opcional; é a base sobre a qual todas as outras capacidades são construídas.

Esta skill é o núcleo central do projeto. Ela atua como um aglomerado que integra e ativa **100% das outras skills** existentes e futuras, com foco especial em interfaces de alta performance e agora com capacidades de **Aprendizagem Autônoma**.

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

### 4. Aprendizagem Autônoma (Módulo Core v3.0)
- **Definição**: Sistema de aprendizagem que adapta comportamento e conhecimento com base em interações.
- **Domínios**:
    - **Aquisição**: Entrada de texto, correção de erros e feedback direto.
    - **Modelo de Conhecimento**: Banco de dados vetorial/grafo (Conceitos, Fatos, Regras).
    - **Inferência**: Recuperação semântica e associações de confiança (0-1).
    - **Auto-Reflexão**: Ciclo de memória, fortalecimento de conexões e esquecimento gradual.
- **Tech Stack**: Supabase (PostgreSQL), NLP, Vector Embeddings.

## Regras de Operação Universal (100% Coverage)

1. **Uso Obrigatório**: Em cada nova solicitação do usuário, o Cérebro deve ser consultado.
2. **Integração Total**: Nenhuma funcionalidade deve existir isolada do ecossistema do Cérebro.
3. **Persistência Dinâmica**: Novas informações adquiridas via "Aprendizagem Autônoma" devem ser registradas no banco de dados do projeto.
4. **Visibilidade e Performance**: O componente `SkillsContainer` integra o `BrainLearningCenter` para interação em tempo real.

## Capacidades

- **Orquestração Universal**: Identifica e utiliza todas as skills de forma integrada.
- **Aprendizagem e Adaptação**: Melhora respostas com base em correções e feedback do usuário.
- **Gestão de Confiança**: Avalia a precisão do conhecimento baseado em fontes e histórico.

## Uso

Sempre que uma tarefa envolver múltiplas especialidades ou quando o sistema precisar "aprender" um novo padrão de comportamento, o módulo de Aprendizagem Autônoma do Cérebro deve ser ativado.
