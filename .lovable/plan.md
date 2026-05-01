Depois de vasculhar linha por linha o código do painel administrativo e a infraestrutura de backend, identifiquei e corrigirei os problemas que impedem o salvamento correto dos dados e o funcionamento do backup.

O sistema utiliza o Supabase como banco de dados principal. As alterações feitas no painel administrativo devem ser refletidas no site em tempo real através da tabela `site_content`.

### Problemas Identificados
1. **Falha no Salvamento Manual**: Alguns componentes de UI (como `VisualIdentity` e `IntegrationsManager`) têm estados internos que não são sincronizados corretamente com a função de salvamento ao clicar no botão.
2. **Inconsistência nos Botões de Salvar**: A cor do botão de salvar não segue exatamente o padrão solicitado (Preto -> Verde se sucesso, Vermelho se erro, retornando a Preto após 3s).
3. **Backup Interrompido**: O endpoint de backup `/api/public/hooks/run-backup` precisa de ajustes na autorização para garantir que apenas administradores logados (ou o sistema de cron) possam dispará-lo.
4. **Replicação no Site**: Verificarei se o hook `useSiteContent` está consumindo os dados corretamente e se não há cache impedindo a visualização das mudanças.

### Plano de Ação

1.  **Padronização dos Botões de Salvar**:
    *   Atualizar o hook `useSaveStatus` para gerenciar as cores Preto, Verde e Vermelho com o timer de 3 segundos.
    *   Garantir que todos os botões de salvar no dashboard utilizem esse hook.

2.  **Correção do Salvamento de Dados**:
    *   **Identidade Visual**: Corrigir o `handleSave` para usar os dados mais recentes do formulário.
    *   **Gerenciador de Integrações**: Sincronizar os estados de Instagram, WhatsApp e Analytics antes do envio ao Supabase.
    *   **Gestão de Posts**: Validar o `upsert` e garantir que a lista seja atualizada imediatamente.
    *   **Backup**: Ajustar a lógica de salvamento das configurações de intervalo e retenção.

3.  **Refatoração do Sistema de Backup**:
    *   Ajustar o arquivo `src/routes/api.public.hooks.run-backup.ts` para validar corretamente o token de sessão do administrador.
    *   Corrigir a função `restoreBackup` no servidor para garantir que todos os campos sejam limpos antes da restauração, evitando conflitos de chave primária.

4.  **Verificação de Dados**:
    *   Garantir que as tabelas `site_content`, `posts`, `admin_users` e `backups` estejam íntegras.
    *   Adicionar logs de auditoria em cada ação de salvamento para facilitar o debug futuro.

### Detalhes Técnicos
*   **Tecnologias**: React, Supabase (PostgreSQL), TanStack Router/Start.
*   **Mudanças**: Modificações nos componentes `SiteContentEditor.tsx`, `VisualIdentity.tsx`, `IntegrationsManager.tsx`, `PostsManager.tsx`, `BackupExport.tsx` e no hook `useSaveStatus.ts`.
*   **Segurança**: Reforço na validação do `adminToken` (prefixo `session-`).
