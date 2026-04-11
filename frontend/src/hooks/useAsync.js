import { useState, useCallback } from 'react';

/**
 * Ejecuta una función async y expone { loading, error, run }.
 * - run(...args) ejecuta fn con esos args y devuelve el resultado.
 * - Si la llamada falla, error se setea con el mensaje.
 */
export function useAsync(fn) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const run = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn(...args);
      return result;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [fn]);

  return { loading, error, run, clearError: () => setError(null) };
}
