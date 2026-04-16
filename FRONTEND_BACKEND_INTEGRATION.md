# Integração Frontend-Backend - Oris Cloud

Documentação completa para integração entre o frontend React (Vercel) e backend NestJS (Render).

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      Vercel (Frontend)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React + Vite + TypeScript                           │  │
│  │  - useAuth hook                                      │  │
│  │  - AuthContext                                       │  │
│  │  - API Client (axios)                                │  │
│  │  - OAuth Integration                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS REST API
                       │ JWT Bearer Token
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Render (Backend)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  NestJS + TypeORM + PostgreSQL                       │  │
│  │  - Auth Module (JWT + OAuth)                         │  │
│  │  - Users Module (CRUD)                               │  │
│  │  - Rate Limiting                                     │  │
│  │  - Swagger Documentation                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database                                 │  │
│  │  - Users table                                       │  │
│  │  - OAuth providers                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## 🔧 Configuração

### Frontend (.env)

```env
VITE_API_URL=https://oris-cloud-backend.onrender.com
```

### Backend (.env)

```env
FRONTEND_URL=https://oris-cloud.vercel.app
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://oris-cloud-backend.onrender.com/api/v1/auth/google/callback
```

## 📡 Fluxo de Autenticação

### 1. Login com Google

```
Frontend                          Backend
   │                                 │
   ├─ User clica "Login Google" ─────┤
   │                                 │
   ├─ Redireciona para Google ◄──────┤
   │                                 │
   ├─ User autoriza ────────────────►│
   │                                 │
   │◄─ Google callback ──────────────┤
   │                                 │
   │◄─ Redireciona com token ────────┤
   │                                 │
   ├─ Salva token em localStorage ──┤
   │                                 │
   ├─ Faz requisição autenticada ───►│
   │                                 │
   │◄─ Retorna dados do usuário ─────┤
```

### 2. Requisição Autenticada

```
Frontend                          Backend
   │                                 │
   ├─ GET /api/v1/users/me ────────►│
   │  Header: Authorization: Bearer <token>
   │                                 │
   │◄─ 200 OK ──────────────────────┤
   │  { id, name, email, ... }       │
```

## 🔐 Segurança

### CORS
- ✅ Frontend pode fazer requisições para backend
- ✅ Backend valida origem (FRONTEND_URL)
- ✅ Credenciais incluídas em requisições

### JWT
- ✅ Token armazenado em localStorage
- ✅ Enviado em header Authorization
- ✅ Validado em cada requisição
- ✅ Expiração configurável (3600s padrão)

### OAuth
- ✅ Google OAuth 2.0
- ✅ Callback URL verificado
- ✅ Usuário criado/atualizado automaticamente

## 📚 API Endpoints

### Autenticação
```
GET  /api/v1/auth/google              # Inicia login
GET  /api/v1/auth/google/callback     # Callback (automático)
GET  /api/v1/auth/health              # Health check
```

### Usuários
```
GET    /api/v1/users                  # Listar todos (sem auth)
GET    /api/v1/users/me               # Usuário atual (requer JWT)
GET    /api/v1/users/:id              # Obter por ID (sem auth)
POST   /api/v1/users                  # Criar novo (sem auth)
PUT    /api/v1/users/:id              # Atualizar (requer JWT)
DELETE /api/v1/users/:id              # Deletar (requer JWT)
```

## 🚀 Deploy

### Frontend (Vercel)

1. **Conecte seu repositório GitHub**
2. **Configure variáveis de ambiente:**
   ```
   VITE_API_URL=https://oris-cloud-backend.onrender.com
   ```
3. **Deploy automático** a cada push

### Backend (Render)

1. **Conecte seu repositório GitHub**
2. **Crie PostgreSQL database**
3. **Configure variáveis de ambiente** (copie do `.env`)
4. **Deploy automático** a cada push

## 🧪 Testes Locais

### 1. Inicie o Backend

```bash
cd oris-cloud-backend
pnpm install
# Configure .env
pnpm run start:dev
# Acesse: http://localhost:3001/api/docs
```

### 2. Inicie o Frontend

```bash
cd oris-cloud/client
pnpm install
# Configure .env com VITE_API_URL=http://localhost:3001
pnpm run dev
# Acesse: http://localhost:5173
```

### 3. Teste OAuth

1. Clique em "Login Google" no frontend
2. Autorize no Google
3. Verifique se token foi salvo em localStorage
4. Verifique se usuário foi criado no banco

## 📊 Monitoramento

### Backend
- Logs em tempo real
- Swagger em `/api/docs`
- Health check em `/api/v1/auth/health`

### Frontend
- Console do navegador (F12)
- Network tab para requisições
- Application tab para localStorage

## 🐛 Troubleshooting

### CORS Error
**Problema:** "Access to XMLHttpRequest blocked by CORS policy"

**Solução:**
- Verifique `FRONTEND_URL` no backend
- Verifique `VITE_API_URL` no frontend
- Teste com `curl` do backend

### Token Expirado
**Problema:** "401 Unauthorized"

**Solução:**
- Token foi deletado do localStorage
- Faça login novamente
- Verifique `JWT_EXPIRATION` no backend

### OAuth Callback Error
**Problema:** "Invalid callback URL"

**Solução:**
- Verifique `GOOGLE_CALLBACK_URL` no backend
- Verifique URL registrada no Google Console
- Deve ser exatamente igual

## 📞 Suporte

Para dúvidas ou problemas:
- Email: suporte@oriscloud.com.br
- Discord: https://discord.gg/3pT7NJGZ97

---

**Desenvolvido com ❤️ para Oris Cloud Gaming**
