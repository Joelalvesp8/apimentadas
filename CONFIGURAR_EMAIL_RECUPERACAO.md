# Configurar Recuperação de Senha e Emails

## 🐛 Problema Identificado

**Causa:** Emails estavam sendo salvos com maiúsculas/minúsculas inconsistentes, causando falha no login.

**Solução Aplicada:**
- ✅ Normalização de email para lowercase no login (`lib/auth.ts`)
- ✅ Normalização de email para lowercase no registro (`app/api/auth/register/route.ts`)
- ✅ Integração completa do serviço de email de recuperação de senha
- ✅ Template HTML profissional para email de reset

---

## 📧 Passo 1: Normalizar Emails Existentes no Banco

Execute este SQL no **Supabase SQL Editor** para corrigir emails já cadastrados:

```sql
-- Normalizar todos os emails para lowercase
UPDATE users
SET email = LOWER(email)
WHERE email != LOWER(email);

-- Verificar se há duplicatas após normalização (não deveria haver)
SELECT LOWER(email) as email_lower, COUNT(*) as count
FROM users
GROUP BY LOWER(email)
HAVING COUNT(*) > 1;
```

---

## 🔑 Passo 2: Configurar Resend para Envio de Emails

### 2.1. Criar Conta no Resend

1. Acesse: https://resend.com
2. Crie uma conta gratuita (100 emails/dia grátis)
3. Confirme seu email

### 2.2. Gerar API Key

1. No dashboard do Resend, vá em **API Keys**
2. Clique em **Create API Key**
3. Nome: `Apimentadas Production`
4. Permissão: **Full Access** ou **Sending access**
5. Copie a chave (só aparece uma vez!)

### 2.3. Adicionar no Vercel

1. Abra o projeto no Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. Aplique em: **Production**, **Preview**, **Development**
5. Clique em **Save**

### 2.4. Redeploy

Após salvar a variável, faça um redeploy:
- Vá em **Deployments**
- Clique nos 3 pontos do último deploy
- **Redeploy**

---

## 📬 Passo 3: (Opcional) Verificar Domínio Próprio

### Usar Email Próprio (ex: noreply@apimentadas.app)

1. No Resend, vá em **Domains**
2. Clique em **Add Domain**
3. Digite: `apimentadas.app`
4. Copie os registros DNS fornecidos
5. Adicione no **Cloudflare** ou **Vercel DNS**:
   - Tipo: **TXT**
   - Nome: `_resend`
   - Valor: `(fornecido pelo Resend)`
6. Aguarde verificação (pode levar até 48h)

### Atualizar FROM_EMAIL no Código

Após domínio verificado, edite `lib/email-service.ts`:

```typescript
// ANTES (usando resend.dev)
const FROM_EMAIL = 'Apimentadas <onboarding@resend.dev>';

// DEPOIS (usando domínio próprio)
const FROM_EMAIL = 'Apimentadas <noreply@apimentadas.app>';
```

---

## ✅ Passo 4: Testar Recuperação de Senha

### 4.1. Teste Completo

1. Acesse: https://apimentadas.app/forgot-password
2. Digite um email cadastrado
3. Clique em "Enviar link de recuperação"
4. Verifique a caixa de entrada
5. Clique no botão "Redefinir Minha Senha"
6. Digite nova senha
7. Faça login com a nova senha

### 4.2. Verificar Logs

Se não receber o email, verifique os logs no Vercel:
```bash
# Procurar por:
[EMAIL] Password reset email sent successfully
# ou
[EMAIL] Error sending password reset email
```

---

## 🔍 Troubleshooting

### Email não chega

**Possíveis causas:**

1. **RESEND_API_KEY não configurada**
   - Verifique no Vercel se a variável existe
   - Logs mostrarão: `[EMAIL] Resend not configured, skipping email send`

2. **API Key inválida**
   - Regenere no Resend
   - Atualize no Vercel
   - Redeploy

3. **Email na caixa de spam**
   - Verifique a pasta de spam/lixo eletrônico
   - Marque como "Não é spam"

4. **Domínio não verificado**
   - Se usar domínio próprio, verifique status no Resend
   - Use `onboarding@resend.dev` temporariamente

### Login ainda não funciona

**Soluções:**

1. **Execute o SQL de normalização** (Passo 1)
2. **Aguarde próximo deploy** com as correções
3. **Teste com email em lowercase**
   - ✅ Correto: `usuario@email.com`
   - ❌ Errado: `Usuario@Email.COM`

### Token expirado

- Tokens de reset expiram em **1 hora**
- Solicite um novo link se expirou
- Verifique o horário do servidor vs. local

---

## 📝 Templates de Email Disponíveis

O sistema possui 3 templates profissionais:

1. **Lista de Espera** (`getWaitlistConfirmationEmail`)
   - Enviado ao se inscrever na waitlist
   - Confirmação de recebimento

2. **Aprovação** (`getApprovalEmail`)
   - Enviado quando admin aprovar usuário
   - Link direto para criar conta

3. **Recuperação de Senha** (`getPasswordResetEmail`) ✨ NOVO
   - Design moderno dark theme
   - Botão de ação destacado
   - Dicas de segurança
   - Link alternativo em texto
   - Aviso de expiração (1h)

---

## 🎨 Personalização dos Templates

Os templates estão em: `lib/email-templates.ts`

### Cores do Tema
```typescript
Primary: #dc2626 (vermelho)
Dark: #991b1b
Background: #000000 (preto)
Content: #0a0a0a / #1a1a1a (gradiente)
Text: #d4d4d4 (cinza claro)
```

### Modificar Conteúdo

Exemplo - adicionar logo personalizada:

```typescript
.logo {
  font-size: 48px;
  margin-bottom: 10px;
  // Adicione background-image aqui se tiver logo em imagem
}
```

---

## 🚀 Próximos Passos (Opcional)

### Email de Confirmação de Conta

Atualmente, contas são auto-aprovadas. Para adicionar confirmação:

1. Adicionar campo `emailVerified` (já existe no schema)
2. Criar endpoint `/api/auth/verify-email`
3. Criar template de confirmação
4. Enviar email após registro
5. Bloquear login se não verificado

### Notificações por Email

Expandir o sistema de notificações para enviar emails:
- Nova conexão solicitada
- Conexão aceita
- Novo comentário em post
- Convite para sessão de jogo

---

## 📊 Monitoramento

### Logs Importantes

```bash
# Email enviado com sucesso
[EMAIL] Password reset email sent successfully: re_xxxxx

# Resend não configurado (modo dev)
[EMAIL] Resend not configured, skipping email send

# Erro ao enviar
[EMAIL] Error sending password reset email: Invalid API key
```

### Métricas no Resend

Acesse o dashboard para ver:
- Emails enviados
- Taxa de entrega
- Bounces / Rejeições
- Opens / Clicks (se habilitado)

---

## 🔐 Segurança

### Boas Práticas Implementadas

✅ **Tokens seguros** - 32 bytes aleatórios (crypto.randomBytes)
✅ **Expiração** - 1 hora (3600000ms)
✅ **Único uso** - Token deletado após uso
✅ **Anti-enumeration** - Sempre retorna sucesso (mesmo que email não exista)
✅ **HTTPS only** - Links de reset via HTTPS
✅ **Lowercase emails** - Evita duplicatas e problemas de case

### Variáveis de Ambiente Sensíveis

⚠️ **NUNCA commite:**
- `RESEND_API_KEY`
- `DATABASE_URL`
- `NEXTAUTH_SECRET`

✅ **Use apenas:**
- Vercel Environment Variables (produção)
- `.env.local` (desenvolvimento local)

---

**Última Atualização:** 2026-02-22
**Status:** ✅ Implementado e testado
**Build:** Passou sem erros

---

## 📞 Suporte

Se tiver problemas após seguir este guia:

1. Verifique logs no Vercel
2. Teste em modo dev local (`npm run dev`)
3. Confirme variáveis de ambiente
4. Verifique spam na caixa de email
5. Consulte documentação do Resend: https://resend.com/docs
