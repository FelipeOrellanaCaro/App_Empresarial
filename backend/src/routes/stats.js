const { Router } = require('express');
const db = require('../db');
const { autenticar } = require('../middleware/auth');

const router = Router();

// GET /api/stats
router.get('/', autenticar, (req, res) => {
  // KPIs
  const totalProductos = db.prepare('SELECT COUNT(*) AS n FROM productos').get().n;

  const stockPorProducto = db.prepare(`
    SELECT p.id, p.stock_min,
      COALESCE(SUM(CASE WHEN m.tipo='entrada' THEN m.cantidad ELSE -m.cantidad END), 0) AS stock
    FROM productos p
    LEFT JOIN movimientos m ON m.producto_id = p.id
    GROUP BY p.id
  `).all();

  const productosCriticos = stockPorProducto.filter(p => p.stock <= p.stock_min && p.stock_min > 0).length;
  const productosAgotados = stockPorProducto.filter(p => p.stock <= 0).length;

  const mesActual = new Date().toISOString().slice(0, 7); // YYYY-MM
  const movsMes = db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN tipo='entrada' THEN cantidad ELSE 0 END), 0) AS entradas,
      COALESCE(SUM(CASE WHEN tipo='salida'  THEN cantidad ELSE 0 END), 0) AS salidas
    FROM movimientos
    WHERE strftime('%Y-%m', fecha) = ?
  `).get(mesActual);

  // Stock por categoría
  const stockPorCategoria = db.prepare(`
    SELECT
      COALESCE(p.categoria, 'Sin categoría') AS categoria,
      COALESCE(SUM(CASE WHEN m.tipo='entrada' THEN m.cantidad ELSE -m.cantidad END), 0) AS stock_total
    FROM productos p
    LEFT JOIN movimientos m ON m.producto_id = p.id
    GROUP BY p.categoria
    ORDER BY stock_total DESC
  `).all();

  // Movimientos por mes (últimos 6 meses)
  const movsPorMes = db.prepare(`
    SELECT
      strftime('%Y-%m', fecha) AS mes,
      SUM(CASE WHEN tipo='entrada' THEN cantidad ELSE 0 END) AS entradas,
      SUM(CASE WHEN tipo='salida'  THEN cantidad ELSE 0 END) AS salidas
    FROM movimientos
    WHERE fecha >= date('now', '-6 months')
    GROUP BY mes
    ORDER BY mes ASC
  `).all();

  res.json({
    kpis: {
      total_productos:    totalProductos,
      productos_criticos: productosCriticos,
      productos_agotados: productosAgotados,
      entradas_mes:       movsMes.entradas,
      salidas_mes:        movsMes.salidas,
    },
    stock_por_categoria: stockPorCategoria,
    movimientos_por_mes: movsPorMes,
  });
});

module.exports = router;
