# Oris Cloud Backend

Backend Node.js/Express para a plataforma Oris Cloud - Cloud Gaming Platform.

## 🚀 Quick Start

### Instalação

```bash
cd server
npm install
# ou
pnpm install
```

### Configuração

1. Copie `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. Configure as variáveis de ambiente no `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/oris_cloud
JWT_SECRET=your_secret_key
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### Desenvolvimento

```bash
npm run dev
# ou
pnpm dev
```

O servidor estará rodando em `http://localhost:3001`

### Build

```bash
npm run build
# ou
pnpm build
```

### Deploy

```bash
npm start
# ou
pnpm start
```

## 📚 API Endpoints

### Autenticação
- `POST /api/v1/auth/register` - Registrar novo usuário
- `POST /api/v1/auth/login` - Fazer login
- `GET /api/v1/auth/me` - Obter usuário atual (requer JWT)
- `GET /api/v1/auth/health` - Health check

### Usuários
- `GET /api/v1/users` - Listar todos os usuários
- `GET /api/v1/users/:id` - Obter usuário por ID
- `PUT /api/v1/users/:id` - Atualizar usuário (requer JWT)
- `DELETE /api/v1/users/:id` - Deletar usuário (requer JWT)

### Planos
- `GET /api/v1/plans` - Listar planos de cloud gaming
- `GET /api/v1/plans/:id` - Obter plano por ID

### Subscriptions
- `GET /api/v1/subscriptions` - Listar subscriptions do usuário (requer JWT)
- `POST /api/v1/subscriptions` - Criar nova subscription (requer JWT)
- `PUT /api/v1/subscriptions/:id` - Atualizar subscription (requer JWT)
- `DELETE /api/v1/subscriptions/:id` - Cancelar subscription (requer JWT)

## 🔐 Autenticação

### JWT Token

O backend usa JWT para autenticação. Após fazer login, você receberá um token que deve ser enviado em todas as requisições autenticadas:

```bash
Authorization: Bearer <seu_token_aqui>
```

### Exemplo de Login

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

Resposta:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

## 🗄️ Banco de Dados

### PostgreSQL

O backend usa PostgreSQL para armazenar dados. Certifique-se de que:

1. PostgreSQL está instalado e rodando
2. Você criou um banco de dados chamado `oris_cloud`
3. As variáveis de ambiente estão configuradas corretamente

### Migrations

```bash
npm run db:migrate
```

## 🧪 Testes

```bash
npm run test
npm run test:watch
npm run test:cov
```

## 📝 Documentação

- [Integração Frontend-Backend](../FRONTEND_BACKEND_INTEGRATION.md)
- [Segurança](../SECURITY.md)

## 🐛 Troubleshooting

### Erro de conexão com banco de dados

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solução:**
- Verifique se PostgreSQL está rodando
- Verifique `DATABASE_URL` no `.env`
- Teste a conexão: `psql postgresql://user:password@localhost:5432/oris_cloud`

### CORS Error

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solução:**
- Verifique `FRONTEND_URL` no `.env`
- Certifique-se de que o frontend está acessando a URL correta

### JWT Token Expirado

```
401 Unauthorized
```

**Solução:**
- Faça login novamente para obter um novo token
- Verifique `JWT_EXPIRATION` no `.env`

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no GitHub ou entre em contato.

---

**Desenvolvido com ❤️ para Oris Cloud Gaming**
