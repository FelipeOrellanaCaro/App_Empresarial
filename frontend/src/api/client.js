const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (res.status === 204) return null;

  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.error || 'Error desconocido');
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// Productos
export const productosApi = {
  getAll: ()               => request('/productos'),
  getOne: (id)             => request(`/productos/${id}`),
  create: (body)           => request('/productos', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body)       => request(`/productos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id)             => request(`/productos/${id}`, { method: 'DELETE' }),
};

// Movimientos
export const movimientosApi = {
  getAll: (params = {})   => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString();
    return request(`/movimientos${qs ? '?' + qs : ''}`);
  },
  create: (body)           => request('/movimientos', { method: 'POST', body: JSON.stringify(body) }),
  remove: (id)             => request(`/movimientos/${id}`, { method: 'DELETE' }),
};
