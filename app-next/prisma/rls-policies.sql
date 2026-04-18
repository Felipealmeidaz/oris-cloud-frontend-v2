-- Row Level Security Policies para PostgreSQL
-- Execute este arquivo após criar as tabelas com Prisma

-- Habilitar RLS nas tabelas sensíveis

-- 1. Tabela de Subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Política: Usuários só podem ver suas próprias assinaturas
CREATE POLICY subscriptions_select_policy ON subscriptions
    FOR SELECT
    USING (
        "userId" = current_setting('app.current_user_id', true)::text
    );

-- Política: Usuários não podem inserir assinaturas diretamente
CREATE POLICY subscriptions_insert_policy ON subscriptions
    FOR INSERT
    WITH CHECK (false);

-- Política: Usuários não podem atualizar assinaturas
CREATE POLICY subscriptions_update_policy ON subscriptions
    FOR UPDATE
    USING (false);

-- Política: Usuários não podem deletar assinaturas
CREATE POLICY subscriptions_delete_policy ON subscriptions
    FOR DELETE
    USING (false);

-- 2. Tabela de Disks
ALTER TABLE disks ENABLE ROW LEVEL SECURITY;

-- Política: Usuários só podem ver seus próprios discos
CREATE POLICY disks_select_policy ON disks
    FOR SELECT
    USING (
        "userId" = current_setting('app.current_user_id', true)::text
    );

-- Política: Usuários não podem inserir discos diretamente
CREATE POLICY disks_insert_policy ON disks
    FOR INSERT
    WITH CHECK (false);

-- Política: Usuários não podem atualizar discos
CREATE POLICY disks_update_policy ON disks
    FOR UPDATE
    USING (false);

-- Política: Usuários não podem deletar discos
CREATE POLICY disks_delete_policy ON disks
    FOR DELETE
    USING (false);

-- 3. Tabela de Payments
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;

-- Política: Usuários só podem ver seus próprios pagamentos
CREATE POLICY payments_select_policy ON "Payment"
    FOR SELECT
    USING (
        email = current_setting('app.current_user_email', true)::text
    );

-- Política: Usuários não podem inserir pagamentos diretamente
CREATE POLICY payments_insert_policy ON "Payment"
    FOR INSERT
    WITH CHECK (false);

-- Política: Usuários não podem atualizar pagamentos
CREATE POLICY payments_update_policy ON "Payment"
    FOR UPDATE
    USING (false);

-- Política: Usuários não podem deletar pagamentos
CREATE POLICY payments_delete_policy ON "Payment"
    FOR DELETE
    USING (false);

-- 4. Tabela de PurchaseTokens
ALTER TABLE purchase_tokens ENABLE ROW LEVEL SECURITY;

-- Política: Tokens só podem ser vistos após serem resgatados pelo usuário
CREATE POLICY tokens_select_policy ON purchase_tokens
    FOR SELECT
    USING (
        "redeemedBy" = current_setting('app.current_user_id', true)::text
        OR "isRedeemed" = false
    );

-- Política: Usuários não podem inserir tokens
CREATE POLICY tokens_insert_policy ON purchase_tokens
    FOR INSERT
    WITH CHECK (false);

-- Política: Usuários não podem atualizar tokens diretamente
CREATE POLICY tokens_update_policy ON purchase_tokens
    FOR UPDATE
    USING (false);

-- Política: Usuários não podem deletar tokens
CREATE POLICY tokens_delete_policy ON purchase_tokens
    FOR DELETE
    USING (false);

-- 5. Tabela de Users (proteção extra)
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;

-- Política: Usuários só podem ver seu próprio perfil
CREATE POLICY users_select_policy ON "user"
    FOR SELECT
    USING (
        id = current_setting('app.current_user_id', true)::text
    );

-- Política: Usuários não podem inserir usuários diretamente
CREATE POLICY users_insert_policy ON "user"
    FOR INSERT
    WITH CHECK (false);

-- Política: Usuários só podem atualizar seu próprio perfil
CREATE POLICY users_update_policy ON "user"
    FOR UPDATE
    USING (
        id = current_setting('app.current_user_id', true)::text
    );

-- Política: Usuários não podem deletar contas
CREATE POLICY users_delete_policy ON "user"
    FOR DELETE
    USING (false);

-- Função helper para definir o usuário atual na sessão
CREATE OR REPLACE FUNCTION set_current_user(user_id text, user_email text)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_id, false);
    PERFORM set_config('app.current_user_email', user_email, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários explicativos
COMMENT ON POLICY subscriptions_select_policy ON subscriptions IS 'Usuários só podem ver suas próprias assinaturas';
COMMENT ON POLICY disks_select_policy ON disks IS 'Usuários só podem ver seus próprios discos';
COMMENT ON POLICY payments_select_policy ON "Payment" IS 'Usuários só podem ver seus próprios pagamentos';
COMMENT ON POLICY tokens_select_policy ON purchase_tokens IS 'Tokens só visíveis após resgate';
COMMENT ON POLICY users_select_policy ON "user" IS 'Usuários só podem ver seu próprio perfil';
