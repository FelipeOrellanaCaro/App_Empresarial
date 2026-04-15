const { Router } = require('express');
const db = require('../db');
const { autenticar, soloAdmin } = require('../middleware/auth');

const router = Router();

// Todas las rutas requieren estar autenticado
router.use(autenticar);

// Helpers
const getStockActual = (productoId) => {
  const row = db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN cantidad ELSE -cantidad END), 0) AS stock
    FROM movimientos
    WHERE producto_id = ?
  `).get(productoId);
  return row.stock;
};

// GET /api/productos
router.get('/', (req, res) => {
  const productos = db.prepare('SELECT * FROM productos ORDER BY nombre').all();
  const result = productos.map(p => ({
    ...p,
    stock_actual: getStockActual(p.id),
  }));
  res.json(result);
});

// GET /api/productos/:id
router.get('/:id', (req, res) => {
  const producto = db.prepare('SELECT * FROM productos WHERE id = ?').get(req.params.id);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json({ ...producto, stock_actual: getStockActual(producto.id) });
});

// POST /api/productos  (solo admin)
router.post('/', soloAdmin, (req, res) => {
  const { codigo, nombre, categoria, unidad, stock_min = 0, stock_inicial = 0 } = req.body;

  if (!codigo?.trim() || !nombre?.trim()) {
    return res.status(400).json({ error: 'Código y nombre son obligatorios' });
  }

  const existe = db.prepare('SELECT id FROM productos WHERE codigo = ?').get(codigo.trim().toUpperCase());
  if (existe) return res.status(409).json({ error: 'Ya existe un producto con ese código' });

  const { lastInsertRowid } = db.prepare(`
    INSERT INTO productos (codigo, nombre, categoria, unidad, stock_min)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    codigo.trim().toUpperCase(),
    nombre.trim(),
    categoria?.trim() || null,
    unidad?.trim() || null,
    parseInt(stock_min) || 0,
  );

  // Stock inicial → entrada automática
  if (stock_inicial > 0) {
    db.prepare(`
      INSERT INTO movimientos (producto_id, tipo, cantidad, motivo, fecha)
      VALUES (?, 'entrada', ?, 'Stock inicial', date('now'))
    `).run(lastInsertRowid, parseInt(stock_inicial));
  }

  const nuevo = db.prepare('SELECT * FROM productos WHERE id = ?').get(lastInsertRowid);
  res.status(201).json({ ...nuevo, stock_actual: getStockActual(lastInsertRowid) });
});

// PUT /api/productos/:id  (solo admin)
router.put('/:id', soloAdmin, (req, res) => {
  const { nombre, categoria, unidad, stock_min } = req.body;

  const producto = db.prepare('SELECT * FROM productos WHERE id = ?').get(req.params.id);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

  if (!nombre?.trim()) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }

  db.prepare(`
    UPDATE productos SET nombre = ?, categoria = ?, unidad = ?, stock_min = ?
    WHERE id = ?
  `).run(
    nombre.trim(),
    categoria?.trim() || null,
    unidad?.trim() || null,
    parseInt(stock_min) || 0,
    req.params.id,
  );

  const actualizado = db.prepare('SELECT * FROM productos WHERE id = ?').get(req.params.id);
  res.json({ ...actualizado, stock_actual: getStockActual(actualizado.id) });
});

// DELETE /api/productos/:id  (solo admin)
router.delete('/:id', soloAdmin, (req, res) => {
  const producto = db.prepare('SELECT * FROM productos WHERE id = ?').get(req.params.id);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

  db.prepare('DELETE FROM productos WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

module.exports = router;
