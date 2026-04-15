import { useState, useEffect } from 'react';
import { productosApi } from '../api/client';
import { Badge, stockVariant } from '../components/Badge';
import { exportarExcel, exportarPDF } from '../utils/exportar';

const COLUMNAS_EXPORT = [
  { key: 'codigo',       label: 'Código' },
  { key: 'nombre',       label: 'Producto' },
  { key: 'categoria',    label: 'Categoría' },
  { key: 'stock_actual', label: 'Stock' },
  { key: 'stock_min',    label: 'Stock mínimo' },
  { key: 'unidad',       label: 'Unidad' },
];

export default function Stock() {
  const [productos, setProductos] = useState([]);
  const [buscar, setBuscar]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    productosApi.getAll()
      .then(setProductos)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
    p.codigo.toLowerCase().includes(buscar.toLowerCase())
  );

  if (loading) return <div className="empty-msg">Cargando...</div>;
  if (error)   return <div className="error-msg" style={{ padding: 20 }}>{error}</div>;

  return (
    <section>
      <div className="section-header">
        <h2>Stock Actual</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            className="input-search"
            placeholder="Buscar producto..."
            value={buscar}
            onChange={e => setBuscar(e.target.value)}
          />
          <button className="btn-export" onClick={() => exportarExcel(filtrados, COLUMNAS_EXPORT, 'stock-inventario')}>
            ⬇ Excel
          </button>
          <button className="btn-export" onClick={() => exportarPDF(filtrados, COLUMNAS_EXPORT, 'Stock de Inventario', 'stock-inventario')}>
            ⬇ PDF
          </button>
        </div>
      </div>

      {filtrados.length === 0 ? (
        <p className="empty-msg">No hay productos{buscar ? ' que coincidan' : ' registrados'}.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Unidad</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => {
                const v = stockVariant(p.stock_actual, p.stock_min);
                return (
                  <tr key={p.id}>
                    <td>{p.codigo}</td>
                    <td>{p.nombre}</td>
                    <td>{p.categoria || '—'}</td>
                    <td className={`stock-${v}`}>{p.stock_actual}</td>
                    <td>{p.unidad || '—'}</td>
                    <td><Badge variant={v} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
