const express = require('express');
const cors = require('cors');

const productosRouter = require('./routes/productos');
const movimientosRouter = require('./routes/movimientos');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/productos',    productosRouter);
app.use('/api/movimientos',  movimientosRouter);

// Manejo centralizado de errores
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
