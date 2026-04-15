import { useState, useEffect, useCallback } from 'react';
import { movimientosApi, productosApi } from '../api/client';
import { Badge } from '../components/Badge';
import { Modal, ConfirmModal } from '../components/Modal';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import { exportarExcel, exportarPDF } from '../utils/exportar';
import { BarcodeScanner } from '../components/BarcodeScanner';

const COLUMNAS_EXPORT = [
  { key: 'fecha',            label: 'Fecha' },
  { key: 'producto_nombre',  label: 'Producto' },
  { key: 'tipo',             label: 'Tipo' },
  { key: 'cantidad',         label: 'Cantidad' },
  { key: 'motivo',           label: 'Motivo' },
];

const TODAY = new Date().toISOString().split('T')[0];
const EMPTY_FORM = { producto_id: '', tipo: 'entrada', cantidad: '', fecha: TODAY, motivo: '' };

export default function Movimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState(null);
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'admin';

  const [filtroTipo,    setFiltroTipo]    = useState('');
  const [filtroProducto, setFiltroProducto] = useState('');

  const [formOpen, setFormOpen]     = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [deleteId, setDeleteId]     = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const cargarMovimientos = useCallback(() =>
    movimientosApi.getAll({ tipo: filtroTipo, producto_id: filtroProducto })
      .then(setMovimientos)
      .catch(e => setFetchError(e.message)),
  [filtroTipo, filtroProducto]);

  useEffect(() => {
    Promise.all([
      productosApi.getAll(),
      movimientosApi.getAll(),
    ])
      .then(([prods, movs]) => { setProductos(prods); setMovimientos(movs); })
      .catch(e => setFetchError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) cargarMovimientos();
  }, [filtroTipo, filtroProducto]); // eslint-disable-line

  const saveAsync   = useAsync((body) => movimientosApi.create(body));
  const deleteAsync = useAsync((id)   => movimientosApi.remove(id));

  async function guardar(e) {
    e.preventDefault();
    try {
      await saveAsync.run({
        producto_id: form.producto_id,
        tipo: form.tipo,
        cantidad: form.cantidad,
        fecha: form.fecha,
        motivo: form.motivo,
      });
      setFormOpen(false);
      setForm(EMPTY_FORM);
      cargarMovimientos();
    } catch { /* error shown */ }
  }

  async function anular() {
    try {
      await deleteAsync.run(deleteId);
      setDeleteId(null);
      cargarMovimientos();
    } catch { /* error handled */ }
  }

  if (loading)    return <div className="empty-msg">Cargando...</div>;
  if (fetchError) return <div className="error-msg" style={{ padding: 20 }}>{fetchError}</div>;

  function handleScan(codigo) {
    // Buscar el producto por código
    const prod = productos.find(p => p.codigo === codigo.trim().toUpperCase());
    if (prod) {
      setForm(f => ({ ...f, producto_id: String(prod.id) }));
      setScannerOpen(false);
    } else {
      alert(`Código "${codigo}" no encontrado en los productos registrados.`);
    }
  }

  return (
    <section>
      <BarcodeScanner
        open={scannerOpen}
        onScan={handleScan}
        onClose={() => setScannerOpen(false)}
      />
      <div className="section-header">
        <h2>Movimientos</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn-export" onClick={() => exportarExcel(movimientos, COLUMNAS_EXPORT, 'movimientos')}>⬇ Excel</button>
          <button className="btn-export" onClick={() => exportarPDF(movimientos, COLUMNAS_EXPORT, 'Historial de Movimientos', 'movimientos')}>⬇ PDF</button>
          <button
            className="btn-primary"
            onClick={() => {
              if (productos.length === 0) { alert('Primero registra un producto.'); return; }
              setForm(EMPTY_FORM);
            saveAsync.clearError();
            setFormOpen(true);
          }}
        >
          + Registrar Movimiento
          </button>
        </div>
      </div>

      {/* Modal formulario */}
      <Modal open={formOpen} title="Registrar Movimiento" onClose={() => setFormOpen(false)}>
        <form onSubmit={guardar}>
          <div className="form-grid">
            <label>Producto *
              <div style={{ display: 'flex', gap: 6 }}>
                <select
                  style={{ flex: 1 }}
                  value={form.producto_id}
                  onChange={e => setForm(f => ({ ...f, producto_id: e.target.value }))}
                >
                  <option value="">-- Seleccionar --</option>
                  {productos.map(p => (
                    <option key={p.id} value={p.id}>{p.codigo} – {p.nombre}</option>
                  ))}
                </select>
                <button
                  type="button"
                  title="Escanear código de barras"
                  className="btn-scan"
                  onClick={() => setScannerOpen(true)}
                >
                  📷
                </button>
              </div>
            </label>
            <label>Tipo *
              <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
              </select>
            </label>
            <label>Cantidad *
              <input
                type="number" min="1"
                value={form.cantidad}
                onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))}
                placeholder="0"
              />
            </label>
            <label>Fecha *
              <input
                type="date"
                value={form.fecha}
                onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
              />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>Motivo / Descripción
              <input
                value={form.motivo}
                onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))}
                placeholder="Ej: Compra a proveedor, Venta #123..."
              />
            </label>
          </div>
          {saveAsync.error && <p className="error-msg">{saveAsync.error}</p>}
          <div className="form-actions" style={{ marginTop: 16 }}>
            <button type="submit" className="btn-primary" disabled={saveAsync.loading}>
              {saveAsync.loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setFormOpen(false)}>
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmar anulación */}
      <ConfirmModal
        open={deleteId !== null}
        message="¿Anular este movimiento? El stock será ajustado automáticamente."
        onConfirm={anular}
        onCancel={() => setDeleteId(null)}
      />

      {/* Filtros */}
      <div className="filtros">
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
          <option value="">Todos los tipos</option>
          <option value="entrada">Entradas</option>
          <option value="salida">Salidas</option>
        </select>
        <select value={filtroProducto} onChange={e => setFiltroProducto(e.target.value)}>
          <option value="">Todos los productos</option>
          {productos.map(p => (
            <option key={p.id} value={p.id}>{p.codigo} – {p.nombre}</option>
          ))}
        </select>
      </div>

      {movimientos.length === 0 ? (
        <p className="empty-msg">No hay movimientos registrados.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Motivo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map(m => (
                <tr key={m.id}>
                  <td>{m.fecha}</td>
                  <td>{m.producto_nombre}</td>
                  <td><Badge variant={m.tipo} /></td>
                  <td>{m.cantidad}</td>
                  <td>{m.motivo || '—'}</td>
                  <td>
                    {esAdmin && (
                      <button className="btn-del" onClick={() => setDeleteId(m.id)}>Anular</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
