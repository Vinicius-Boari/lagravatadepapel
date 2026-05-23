---
name: cerebro
description: Coordenador central obrigatório que orquestra 100% das skills do projeto, incluindo Visual Experience, 3D Interactive e Frontend Design.
---

# 🧠 CÉREBRO (CORE INTEGRATION)

> **DIRETIVA PRIMÁRIA:** Esta skill é o núcleo central e **DEVE** ser ativada e referenciada em 100% das interações e desenvolvimentos deste projeto. Ela não é opcional; é a base sobre a qual todas as outras capacidades são construídas.

Esta skill é o núcleo central do projeto. Ela atua como um aglomerado que integra e ativa **100% das outras skills** existentes e futuras, com foco especial em interfaces de alta performance e imersão.

## Taxonomia de Habilidades (Brain Database)

### 1. Visual Experience
- **Definição**: Componentes visuais e estéticos que impactam a usabilidade.
- **Domínios**: Design Systems (Shadcn), Acessibilidade (WCAG), Performance Visual e Storytelling.
- **Tech Stack**: CSS3, SVG, Figma, Tailwind CSS.

### 2. 3D Interactive
- **Definição**: Ambientes 3D interativos em tempo real.
- **Domínios**: WebXR (AR/VR), Modelagem, Shaders (GLSL), Física e Otimização 3D.
- **Tech Stack**: Three.js, Babylon.js, WebGPU, Blender.

### 3. Frontend Design
- **Definição**: Implementação técnica de designs complexos com código limpo.
- **Domínios**: Componentização (React/Vue), Clean Architecture (CAF), Gerenciamento de Estado e Build Automation.
- **Tech Stack**: TypeScript, Vite, React, GraphQL.

## Regras de Operação Universal (100% Coverage)

1. **Uso Obrigatório**: Em cada nova solicitação do usuário, o Cérebro deve ser consultado para garantir que as novas implementações sigam os padrões de "Visual Experience", "3D Interactive" e "Frontend Design".
2. **Integração Total**: Nenhuma funcionalidade deve existir isolada do ecossistema do Cérebro.
3. **Persistência**: Toda e qualquer skill nova criada deve ser registrada automaticamente na seção "Taxonomia" deste documento.
4. **Visibilidade e Performance**: O componente `SkillsContainer` deve refletir em tempo real o banco de dados do Cérebro, utilizando técnicas de memoização (React.memo, useMemo) e otimização visual (will-change-transform, debounced tooltips) para garantir 60fps em todas as interações.

## Capacidades Otimizadas

- **Orquestração Universal de Baixa Latência**: Identifica e utiliza todas as skills instaladas com overhead mínimo de processamento.
- **Gestão de Dependências Inteligente**: Garante o fluxo entre Visual, 3D e Frontend, priorizando recursos críticos.
- **Otimização de Renderização**: Implementa estratégias de lazy-loading e viewport-sensing para o matrix de habilidades.

## Logs de Otimização (v2.1)

- **UI/UX**: Redução de tempo de resposta em tooltips e suavização de animações de entrada.
- **Estrutura**: Separação de componentes de renderização para evitar re-calculos globais.
- **Memória**: Implementação de memoização estática para o banco de dados de habilidades.