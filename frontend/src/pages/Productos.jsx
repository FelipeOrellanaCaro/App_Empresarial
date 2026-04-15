import { useState, useEffect, useCallback } from 'react';
import { productosApi } from '../api/client';
import { ConfirmModal, Modal } from '../components/Modal';
import { useAsync } from '../hooks/useAsync';
import { BarcodeScanner } from '../components/BarcodeScanner';

const EMPTY_FORM = {
  codigo: '', nombre: '', categoria: '', unidad: '', stock_min: '', stock_inicial: '',
};

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [formOpen, setFormOpen]     = useState(false);
  const [editId, setEditId]         = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [deleteId, setDeleteId]     = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const cargar = useCallback(() =>
    productosApi.getAll()
      .then(setProductos)
      .catch(e => setFetchError(e.message))
      .finally(() => setLoading(false)),
  []);

  useEffect(() => { cargar(); }, [cargar]);

  const saveAsync  = useAsync(editId
    ? (body) => productosApi.update(editId, body)
    : (body) => productosApi.create(body)
  );
  const deleteAsync = useAsync((id) => productosApi.remove(id));

  function abrirNuevo() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
    saveAsync.clearError();
  }

  function abrirEditar(p) {
    setEditId(p.id);
    setForm({
      codigo: p.codigo,
      nombre: p.nombre,
      categoria: p.categoria || '',
      unidad: p.unidad || '',
      stock_min: p.stock_min ?? '',
      stock_inicial: '',
    });
    setFormOpen(true);
    saveAsync.clearError();
  }

  async function guardar(e) {
    e.preventDefault();
    try {
      await saveAsync.run({
        codigo: form.codigo,
        nombre: form.nombre,
        categoria: form.categoria,
        unidad: form.unidad,
        stock_min: form.stock_min,
        stock_inicial: form.stock_inicial,
      });
      setFormOpen(false);
      cargar();
    } catch { /* error shown in form */ }
  }

  async function eliminar() {
    try {
      await deleteAsync.run(deleteId);
      setDeleteId(null);
      cargar();
    } catch { /* error handled */ }
  }

  if (loading) return <div className="empty-msg">Cargando...</div>;
  if (fetchError) return <div className="error-msg" style={{ padding: 20 }}>{fetchError}</div>;

  return (
    <section>
      <BarcodeScanner
        open={scannerOpen}
        onScan={codigo => {
          setForm(f => ({ ...f, codigo: codigo.trim().toUpperCase() }));
          setScannerOpen(false);
        }}
        onClose={() => setScannerOpen(false)}
      />

      <div className="section-header">
        <h2>Productos</h2>
        <button className="btn-primary" onClick={abrirNuevo}>+ Nuevo Producto</button>
      </div>

      {/* Modal formulario */}
      <Modal open={formOpen} title={editId ? 'Editar Producto' : 'Nuevo Producto'} onClose={() => setFormOpen(false)}>
        <form onSubmit={guardar}>
          <div className="form-grid">
            <label>Código *
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  style={{ flex: 1 }}
                  value={form.codigo}
                  onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))}
                  disabled={!!editId}
                  placeholder="Ej: P001"
                />
                {!editId && (
                  <button type="button" className="btn-scan" title="Escanear código" onClick={() => setScannerOpen(true)}>
                    📷
                  </button>
                )}
              </div>
            </label>
            <label>Nombre *
              <input
                value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                placeholder="Nombre del producto"
              />
            </label>
            <label>Categoría
              <input
                value={form.categoria}
                onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                placeholder="Ej: Electrónica"
              />
            </label>
            <label>Unidad
              <input
                value={form.unidad}
                onChange={e => setForm(f => ({ ...f, unidad: e.target.value }))}
                placeholder="Ej: unidades, kg, litros"
              />
            </label>
            <label>Stock mínimo
              <input
                type="number" min="0"
                value={form.stock_min}
                onChange={e => setForm(f => ({ ...f, stock_min: e.target.value }))}
                placeholder="0"
              />
            </label>
            {!editId && (
              <label>Stock inicial
                <input
                  type="number" min="0"
                  value={form.stock_inicial}
                  onChange={e => setForm(f => ({ ...f, stock_inicial: e.target.value }))}
                  placeholder="0"
                />
              </label>
            )}
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

      {/* Modal confirmar eliminar */}
      <ConfirmModal
        open={deleteId !== null}
        message="¿Eliminar este producto? Se perderán todos sus movimientos."
        onConfirm={eliminar}
        onCancel={() => setDeleteId(null)}
      />

      {productos.length === 0 ? (
        <p className="empty-msg">No hay productos registrados.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Unidad</th>
                <th>Stock mín.</th>
                <th>Stock actual</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(p => (
                <tr key={p.id}>
                  <td>{p.codigo}</td>
                  <td>{p.nombre}</td>
                  <td>{p.categoria || '—'}</td>
                  <td>{p.unidad || '—'}</td>
                  <td>{p.stock_min}</td>
                  <td>{p.stock_actual}</td>
                  <td>
                    <button className="btn-edit" onClick={() => abrirEditar(p)}>Editar</button>
                    <button className="btn-del"  onClick={() => setDeleteId(p.id)}>Eliminar</button>
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
