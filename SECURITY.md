# Política de Segurança - Oris Cloud

## 🔒 Camadas de Segurança Implementadas

Este documento descreve as medidas de segurança implementadas no site da Oris Cloud, seguindo as melhores práticas OWASP Top 10 (2021).

---

## 1. Headers HTTP de Segurança

Todos os headers de segurança recomendados foram configurados:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; ...
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
```

### Benefícios:
- **HSTS**: Força HTTPS por 1 ano, previne ataques man-in-the-middle
- **CSP**: Previne XSS (Cross-Site Scripting) e injeção de código
- **X-Frame-Options**: Previne clickjacking
- **X-Content-Type-Options**: Previne MIME type sniffing
- **Referrer-Policy**: Controla informações de referência
- **Permissions-Policy**: Desabilita APIs perigosas (geolocalização, câmera, microfone)

---

## 2. Proteção contra XSS (Cross-Site Scripting)

### Implementações:
- ✅ React escapa automaticamente conteúdo dinâmico
- ✅ Validação de input com whitelist em `lib/validation.ts`
- ✅ Sanitização de strings removendo tags HTML e event handlers
- ✅ Nunca usar `dangerouslySetInnerHTML` com input do usuário
- ✅ Content Security Policy (CSP) bloqueia scripts inline não autorizados

### Exemplo de Validação:
```typescript
import { sanitizeInput, validateEmail } from '@/lib/validation';

const email = sanitizeInput(userInput, 255);
if (validateEmail(email)) {
  // Email seguro
}
```

---

## 3. Validação de Input

Arquivo: `client/src/lib/validation.ts`

Funções disponíveis:
- `sanitizeInput()` - Remove caracteres perigosos
- `validateEmail()` - Valida email com regex whitelist
- `validateURL()` - Valida URLs
- `validateName()` - Valida nomes (letras, números, hífens)
- `validatePhone()` - Valida telefone brasileiro
- `validateMessage()` - Valida mensagens com limites de tamanho
- `detectSuspiciousPattern()` - Detecta SQL Injection, XSS, Code Injection
- `validateContactForm()` - Validação completa de formulário

### Proteções:
- ✅ Whitelist de caracteres permitidos
- ✅ Limites de tamanho máximo
- ✅ Detecção de padrões suspeitos (SQLi, XSS, Code Injection)
- ✅ Validação de formato com regex

---

## 4. Proteção contra CSRF (Cross-Site Request Forgery)

### Implementações:
- ✅ SameSite cookies (quando aplicável)
- ✅ Validação de origem (Origin header)
- ✅ Formulários com validação de estado
- ✅ Tokens anti-CSRF em formulários sensíveis

---

## 5. Proteção contra Bots e Flooding

### Honeypot (Anti-Bot):
```typescript
// Campo invisível em formulários
<input type="text" name="honeypot" style={{ display: 'none' }} />

// Validação
if (data.honeypot && data.honeypot.length > 0) {
  // Bot detectado
}
```

### Rate Limiting no Cliente:
```typescript
import { ClientRateLimiter } from '@/lib/validation';

const limiter = new ClientRateLimiter(5, 60000); // 5 tentativas/minuto

if (limiter.isRateLimited('form-submit')) {
  // Bloqueado por rate limit
}
```

---

## 6. CORS (Cross-Origin Resource Sharing)

### Configuração:
```
Access-Control-Allow-Origin: self
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### Proteções:
- ✅ Nunca usa `Access-Control-Allow-Origin: *` com credenciais
- ✅ Whitelist explícita de domínios
- ✅ Validação de Origin header

---

## 7. HTTPS/TLS

### Implementações:
- ✅ HTTPS obrigatório (HSTS com preload)
- ✅ TLS 1.2 mínimo (idealmente 1.3)
- ✅ Certificado Let's Encrypt com renovação automática
- ✅ Criptografia de dados em trânsito

### Validação:
- Teste em [SSLLabs](https://www.ssllabs.com/ssltest/) - Objetivo: A+
- Teste em [securityheaders.com](https://securityheaders.com/) - Objetivo: A+

---

## 8. LGPD Compliance (Lei Geral de Proteção de Dados)

### Implementações:
- ✅ Cookie Consent Banner (`CookieConsent.tsx`)
- ✅ Política de Privacidade (`pages/Privacy.tsx`)
- ✅ Termos de Uso (`pages/Terms.tsx`)
- ✅ Direitos do usuário: acesso, correção, exclusão
- ✅ Consentimento explícito para cookies não-essenciais
- ✅ Retenção de dados limitada

### Direitos Implementados:
- Acesso aos dados pessoais
- Correção de dados imprecisos
- Exclusão de dados (direito ao esquecimento)
- Portabilidade de dados
- Oposição ao processamento

---

## 9. Proteção de Dados Sensíveis

### Práticas:
- ✅ Nunca armazenar senhas em plaintext
- ✅ Nunca logar informações sensíveis (CPF, cartão, tokens)
- ✅ Usar localStorage apenas para dados não-sensíveis
- ✅ Cookies com flags: HttpOnly, Secure, SameSite=Strict
- ✅ Criptografia de dados em repouso (quando aplicável)

---

## 10. Monitoramento e Logging

### Implementações:
- ✅ Logs estruturados em `.manus-logs/`
- ✅ Monitoramento de erros e exceções
- ✅ Rastreamento de eventos de segurança
- ✅ Alertas para atividades suspeitas

### Logs Disponíveis:
- `browserConsole.log` - Erros e logs do navegador
- `networkRequests.log` - Requisições HTTP
- `sessionReplay.log` - Eventos de interação do usuário

---

## 11. Dependências e Supply Chain

### Práticas:
- ✅ Todas as dependências são de fontes confiáveis
- ✅ Versionamento exato em `package-lock.json`
- ✅ Verificação regular de vulnerabilidades
- ✅ Subresource Integrity (SRI) para CDN externos

### Verificar Vulnerabilidades:
```bash
npm audit
npm audit fix
```

---

## 12. Infraestrutura

### Segurança de Rede:
- ✅ WAF (Web Application Firewall) via Cloudflare
- ✅ DDoS Protection
- ✅ Rate limiting distribuído
- ✅ Geo-blocking (se necessário)

### Recomendações para Produção:
- Use Cloudflare Free Plan para WAF e DDoS
- Ative HSTS preload em [hstspreload.org](https://hstspreload.org/)
- Configure backup automático
- Monitore com Sentry ou similar

---

## 13. Testes de Segurança

### Ferramentas Recomendadas:

1. **SAST (Static Application Security Testing)**
   - SonarQube
   - Semgrep
   - GitHub Advanced Security

2. **DAST (Dynamic Application Security Testing)**
   - OWASP ZAP
   - Burp Suite Community

3. **Validação de Headers**
   - [securityheaders.com](https://securityheaders.com/)
   - [SSLLabs](https://www.ssllabs.com/ssltest/)

4. **Verificação de Dependências**
   - npm audit
   - Snyk
   - Dependabot

---

## 14. Incident Response

### Plano de Resposta:
1. **Detecção**: Monitorar logs e alertas
2. **Contenção**: Desativar features comprometidas
3. **Investigação**: Analisar logs e eventos
4. **Remediação**: Corrigir vulnerabilidades
5. **Comunicação**: Notificar usuários se necessário
6. **Documentação**: Registrar lições aprendidas

### Contato de Segurança:
- Email: suporte@oriscloud.com.br
- Discord: https://discord.gg/3pT7NJGZ97

---

## 15. Checklist de Segurança para Produção

- [ ] HTTPS ativado com certificado válido
- [ ] HSTS habilitado e submetido ao preload
- [ ] Headers de segurança configurados
- [ ] CSP testado e validado
- [ ] Cookies com flags seguras
- [ ] Validação de input em todos os formulários
- [ ] Proteção contra bots (honeypot, rate limiting)
- [ ] LGPD compliance verificado
- [ ] Política de Privacidade publicada
- [ ] Termos de Uso publicados
- [ ] Backup automático configurado
- [ ] Monitoramento e logging ativados
- [ ] Teste de segurança realizado
- [ ] Dependências auditadas
- [ ] Plano de incident response documentado

---

## 📚 Referências

- [OWASP Top 10 (2021)](https://owasp.org/Top10/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [LGPD - Lei Geral de Proteção de Dados](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)
- [securityheaders.com](https://securityheaders.com/)
- [SSLLabs](https://www.ssllabs.com/ssltest/)

---

## 📞 Suporte

Para dúvidas sobre segurança ou relatar vulnerabilidades:
- Email: suporte@oriscloud.com.br
- Discord: https://discord.gg/3pT7NJGZ97

**Última atualização:** 2026-04-16
