/**
 * Cliente HTTP para endpoints de conta do Better Auth.
 * Todas as chamadas enviam cookies automaticamente (credentials: include).
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

async function authFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${res.status}: ${body || res.statusText}`);
  }
  return res;
}

/**
 * Atualiza campos do usuário autenticado (nome, image, etc).
 * Better Auth limita os campos que podem ser atualizados via API.
 */
export async function updateProfile(data: {
  name?: string;
  image?: string;
}): Promise<{ status: 'success' }> {
  const res = await authFetch('/api/auth/update-user', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json();
}

export interface UserSession {
  id: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string;
}

/** Lista sessões ativas do usuário autenticado. */
export async function listSessions(): Promise<UserSession[]> {
  const res = await authFetch('/api/auth/list-sessions');
  return res.json();
}

/** Revoga uma sessão específica por token. */
export async function revokeSession(token: string): Promise<void> {
  await authFetch('/api/auth/revoke-session', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

/** Revoga todas as outras sessões (mantém a atual). */
export async function revokeOtherSessions(): Promise<void> {
  await authFetch('/api/auth/revoke-other-sessions', {
    method: 'POST',
  });
}

/**
 * Faz sign-out e redireciona para /login?reauth=1, que força o Google a
 * mostrar a tela de seleção de conta (prompt=select_account) no próximo login.
 *
 * Uso: quando usuário clica "Trocar de conta" nas Configurações.
 */
export async function switchAccount(): Promise<void> {
  try {
    await authFetch('/api/auth/sign-out', { method: 'POST' });
  } catch {
    // Ignora erro - vamos redirecionar de qualquer forma
  }
  window.location.href = '/login?reauth=1';
}

/**
 * Tenta deletar a conta do usuário. Requer user.deleteUser.enabled=true no
 * backend Better Auth. Caso não esteja habilitado, retorna erro 400.
 */
export async function deleteAccount(): Promise<void> {
  await authFetch('/api/auth/delete-user', { method: 'POST' });
}

/**
 * Formata data ISO para string amigável em pt-BR.
 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Extrai informação amigável de um User Agent (ex: "Chrome · Windows").
 */
export function parseUserAgent(ua: string | null): { browser: string; os: string } {
  if (!ua) return { browser: 'Desconhecido', os: '' };

  const browserMatch =
    ua.match(/Edg\/[\d.]+/) ? 'Edge' :
    ua.match(/Chrome\/[\d.]+/) ? 'Chrome' :
    ua.match(/Firefox\/[\d.]+/) ? 'Firefox' :
    ua.match(/Safari\/[\d.]+/) && !ua.includes('Chrome') ? 'Safari' :
    'Browser';

  const osMatch =
    ua.includes('Windows') ? 'Windows' :
    ua.includes('Mac OS') || ua.includes('Macintosh') ? 'macOS' :
    ua.includes('Linux') && !ua.includes('Android') ? 'Linux' :
    ua.includes('Android') ? 'Android' :
    ua.includes('iPhone') || ua.includes('iPad') ? 'iOS' :
    '';

  return { browser: browserMatch, os: osMatch };
}
