# 🌐 Configuração de Domínio Customizado - Apimentadas

## Passo 1: Deploy na Vercel

### 1.1 Instalar Vercel CLI

```bash
npm install -g vercel
```

### 1.2 Fazer Login

```bash
vercel login
```

Siga as instruções no navegador para autenticar.

### 1.3 Deploy de Produção

```bash
# Na pasta do projeto
cd /home/user/apimentadas

# Deploy
vercel --prod
```

Você receberá uma URL como: `apimentadas-xxx.vercel.app`

---

## Passo 2: Adicionar Domínio Customizado na Vercel

### 2.1 Acessar Dashboard

1. Acesse: https://vercel.com/dashboard
2. Clique no projeto **apimentadas**
3. Vá em **Settings** → **Domains**

### 2.2 Adicionar Domínio

1. Digite seu domínio (exemplo: `apimentadas.com`)
2. Clique em **Add**
3. A Vercel vai detectar que o domínio não está configurado
4. Anote os registros DNS fornecidos

**Exemplo de registros:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## Passo 3: Configurar DNS na Hostinger

### 3.1 Acessar Painel DNS

1. Faça login em: https://hpanel.hostinger.com
2. Vá em **Domínios**
3. Clique no domínio que você comprou
4. Selecione **DNS / Nameservers**

### 3.2 Limpar Registros Antigos

⚠️ **IMPORTANTE**: Delete os seguintes registros se existirem:
- Registros A apontando para IPs antigos
- Registros CNAME de `@` ou `www` que não sejam da Vercel

### 3.3 Adicionar Novos Registros

**Registro A (domínio raiz)**
```
Type: A
Name: @ (ou deixe vazio)
Points to: 76.76.21.21
TTL: 14400 (ou Automático)
```

**Registro CNAME (subdomínio www)**
```
Type: CNAME
Name: www
Points to: cname.vercel-dns.com
TTL: 14400 (ou Automático)
```

### 3.4 Salvar Alterações

Clique em **Adicionar Registro** ou **Save** para cada registro.

---

## Passo 4: Aguardar Propagação DNS

⏰ **Tempo**: 5 minutos a 48 horas (geralmente 30 minutos)

### 4.1 Verificar Propagação

Use ferramentas online:
- https://dnschecker.org
- Digite seu domínio
- Verifique se os IPs aparecem corretos

### 4.2 Verificar na Vercel

1. Volte para Vercel Dashboard → Settings → Domains
2. Quando configurado corretamente, você verá um ✓ verde
3. Certificado SSL será gerado automaticamente

---

## Passo 5: Configurar SSL/HTTPS (Automático na Vercel)

A Vercel configura SSL automaticamente via Let's Encrypt.

Aguarde alguns minutos após a propagação DNS e seu site estará disponível em:
- `https://seudominio.com` ✓
- `https://www.seudominio.com` ✓

---

## 🔧 Variáveis de Ambiente

### 5.1 Configurar na Vercel

1. Dashboard → Settings → Environment Variables
2. Adicione suas variáveis:

```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://seudominio.com
NEXTAUTH_SECRET=sua-chave-secreta
NEXT_PUBLIC_STORE_PIX_KEY=sua-chave-pix
```

### 5.2 Redesployer

Após adicionar variáveis:
```bash
vercel --prod
```

---

## ✅ Checklist Final

- [ ] Deploy na Vercel concluído
- [ ] Domínio adicionado na Vercel
- [ ] Registro A configurado na Hostinger
- [ ] Registro CNAME configurado na Hostinger
- [ ] DNS propagado (verificar em dnschecker.org)
- [ ] SSL ativo (cadeado verde no navegador)
- [ ] Variáveis de ambiente configuradas
- [ ] Site acessível em https://seudominio.com

---

## 🚨 Problemas Comuns

### Erro: "Invalid Configuration"
**Solução**: Verifique se não há registros A antigos conflitando

### Erro: "SSL Certificate Pending"
**Solução**: Aguarde 5-10 minutos após DNS propagar

### Site não carrega
**Solução**:
1. Verifique DNS em dnschecker.org
2. Limpe cache do navegador (Ctrl+Shift+Del)
3. Tente modo anônimo

### Redirecionamento infinito
**Solução**: Verifique `NEXTAUTH_URL` nas variáveis de ambiente

---

## 📞 Suporte

- **Vercel**: https://vercel.com/support
- **Hostinger**: https://www.hostinger.com.br/tutoriais/
- **Documentação Next.js**: https://nextjs.org/docs/deployment

---

## 🎯 Exemplo Completo

**Domínio**: apimentadas.com

**DNS na Hostinger**:
```
A     @     76.76.21.21     14400
CNAME www   cname.vercel-dns.com   14400
```

**Vercel**:
- Domínio adicionado: apimentadas.com
- Domínio adicionado: www.apimentadas.com
- SSL: Ativo ✓

**Resultado**: Site acessível em:
- https://apimentadas.com ✓
- https://www.apimentadas.com ✓
