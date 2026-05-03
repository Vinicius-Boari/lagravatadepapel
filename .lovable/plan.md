O plano de otimização será focado em melhorias internas, performance e qualidade de código, seguindo rigorosamente a checklist sem alterar qualquer aspecto visual ou funcional.

### Performance
- **Rotas:** Implementar lazy loading para as rotas do dashboard administrativo (`src/routes/admin.tsx` e sub-rotas) para reduzir o bundle inicial.
- **Componentes Pesados:** Lazy loading do componente `InstagramCarousel3D` e seções administrativas complexas.
- **Imagens:** Garantir que todas as imagens em `SiteSections` usem `loading="lazy"` e tenham atributos `width`/`height` implícitos ou definidos para evitar saltos de layout (CLS).
- **Memoização:** Aplicar `useMemo` e `useCallback` em manipuladores de eventos e cálculos pesados em `SiteSections.tsx` (como o canvas trail e listeners de scroll/tilt).

### Qualidade de Código & TypeScript
- **Consistência:** Padronizar as funções de utilidade internas (ex: `cn` estava sendo redeclarada em alguns arquivos).
- **Tipagem:** Corrigir tipos `any` em componentes como `SiteContentEditor` e `QuestionarioForm`.
- **Limpeza:** Remover logs de console e variáveis não utilizadas.

### Acessibilidade & SEO
- **Semântica:** Adicionar `aria-label` em botões de ícone (como fechar menu e controles de vídeo).
- **Meta Tags:** Centralizar a lógica de meta tags no `__root.tsx` e garantir que as descrições de SEO em `useSiteContent` sejam aplicadas corretamente.

### Segurança
- **Sanitização:** Revisar a renderização de strings vindas do banco de dados (embora o React já escape por padrão, verificarei se há `dangerouslySetInnerHTML`).
- **External Links:** Adicionar `rel="noopener noreferrer"` onde faltar.

### Mudanças Técnicas Detalhadas

1.  **Refatoração de `useSiteContent`:**
    - Otimizar o listener de Realtime para evitar fetches desnecessários.
    - Tipar estritamente o objeto `SiteContent`.

2.  **Otimização de `SiteSections.tsx`:**
    - Envolver o efeito do canvas e os listeners de scroll em `useMemo`/`useCallback` para evitar recriação em re-renders.
    - Adicionar fallbacks de imagem para o vídeo do Hero.

3.  **Melhoria no Painel Admin:**
    - Otimizar o fetch de dados no `DashboardOverview` e `ActivityLogs`.
    - Garantir que todas as tabelas administrativas tenham estados de loading consistentes.

4.  **Ajustes de Infra:**
    - Remover imports não utilizados detectados pelo linter.
    - Padronizar nomenclaturas de variáveis.

---
**Nota:** Nenhuma cor, margem, texto ou comportamento de interface será alterado. A experiência do usuário final permanecerá idêntica, apenas mais rápida e robusta internamente.