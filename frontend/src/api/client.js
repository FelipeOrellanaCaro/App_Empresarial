const BASE = '/api';

function getToken() {
  return localStorage.getItem('inv_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  if (res.status === 204) return null;

  const data = await res.json();

  if (!res.ok) {
    // Token expirado o inválido → cerrar sesión y redirigir al login
    if (res.status === 401) {
      localStorage.removeItem('inv_token');
      localStorage.removeItem('inv_usuario');
      window.location.href = '/login';
      return;
    }
    const err = new Error(data.error || 'Error desconocido');
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// Auth
export const authApi = {
  login:          (body)    => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me:             ()        => request('/auth/me'),
  getUsuarios:    ()        => request('/auth/usuarios'),
  crearUsuario:   (body)    => request('/auth/usuarios', { method: 'POST', body: JSON.stringify(body) }),
  eliminarUsuario:(id)      => request(`/auth/usuarios/${id}`, { method: 'DELETE' }),
};

// Productos
export const productosApi = {
  getAll: ()         => request('/productos'),
  getOne: (id)       => request(`/productos/${id}`),
  create: (body)     => request('/productos', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/productos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id)       => request(`/productos/${id}`, { method: 'DELETE' }),
};

// Movimientos
export const movimientosApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString();
    return request(`/movimientos${qs ? '?' + qs : ''}`);
  },
  create: (body) => request('/movimientos', { method: 'POST', body: JSON.stringify(body) }),
  remove: (id)   => request(`/movimientos/${id}`, { method: 'DELETE' }),
};

// Stats
export const statsApi = {
  get: () => request('/stats'),
};
