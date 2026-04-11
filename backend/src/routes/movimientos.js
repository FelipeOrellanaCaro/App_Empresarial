const { Router } = require('express');
const db = require('../db');

const router = Router();

// GET /api/movimientos?producto_id=&tipo=&desde=&hasta=
router.get('/', (req, res) => {
  const { producto_id, tipo, desde, hasta } = req.query;

  let sql = `
    SELECT m.*, p.nombre AS producto_nombre, p.codigo AS producto_codigo, p.unidad
    FROM movimientos m
    JOIN productos p ON p.id = m.producto_id
    WHERE 1=1
  `;
  const params = [];

  if (producto_id) { sql += ' AND m.producto_id = ?'; params.push(producto_id); }
  if (tipo)        { sql += ' AND m.tipo = ?';        params.push(tipo); }
  if (desde)       { sql += ' AND m.fecha >= ?';      params.push(desde); }
  if (hasta)       { sql += ' AND m.fecha <= ?';      params.push(hasta); }

  sql += ' ORDER BY m.fecha DESC, m.created_at DESC';

  res.json(db.prepare(sql).all(...params));
});

// POST /api/movimientos
router.post('/', (req, res) => {
  const { producto_id, tipo, cantidad, motivo, fecha } = req.body;

  if (!producto_id || !tipo || !cantidad || !fecha) {
    return res.status(400).json({ error: 'producto_id, tipo, cantidad y fecha son obligatorios' });
  }

  if (!['entrada', 'salida'].includes(tipo)) {
    return res.status(400).json({ error: 'tipo debe ser "entrada" o "salida"' });
  }

  const cant = parseInt(cantidad);
  if (isNaN(cant) || cant <= 0) {
    return res.status(400).json({ error: 'La cantidad debe ser un número positivo' });
  }

  const producto = db.prepare('SELECT * FROM productos WHERE id = ?').get(producto_id);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

  if (tipo === 'salida') {
    const stockRow = db.prepare(`
      SELECT COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN cantidad ELSE -cantidad END), 0) AS stock
      FROM movimientos WHERE producto_id = ?
    `).get(producto_id);

    if (cant > stockRow.stock) {
      return res.status(422).json({
        error: `Stock insuficiente. Stock actual: ${stockRow.stock}`,
        stock_actual: stockRow.stock,
      });
    }
  }

  const { lastInsertRowid } = db.prepare(`
    INSERT INTO movimientos (producto_id, tipo, cantidad, motivo, fecha)
    VALUES (?, ?, ?, ?, ?)
  `).run(producto_id, tipo, cant, motivo?.trim() || null, fecha);

  const nuevo = db.prepare(`
    SELECT m.*, p.nombre AS producto_nombre, p.codigo AS producto_codigo, p.unidad
    FROM movimientos m JOIN productos p ON p.id = m.producto_id
    WHERE m.id = ?
  `).get(lastInsertRowid);

  res.status(201).json(nuevo);
});

// DELETE /api/movimientos/:id  (anular movimiento)
router.delete('/:id', (req, res) => {
  const mov = db.prepare('SELECT * FROM movimientos WHERE id = ?').get(req.params.id);
  if (!mov) return res.status(404).json({ error: 'Movimiento no encontrado' });

  // Si es salida, no hay problema. Si es entrada, verificar que no quede stock negativo.
  if (mov.tipo === 'entrada') {
    const stockRow = db.prepare(`
      SELECT COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN cantidad ELSE -cantidad END), 0) AS stock
      FROM movimientos WHERE producto_id = ?
    `).get(mov.producto_id);

    if (stockRow.stock - mov.cantidad < 0) {
      return res.status(422).json({
        error: 'No se puede anular esta entrada: dejaría el stock en negativo',
      });
    }
  }

  db.prepare('DELETE FROM movimientos WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

module.exports = router;
