const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { autenticar, soloAdmin, JWT_SECRET } = require('../middleware/auth');

const router = Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });

  const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email.trim().toLowerCase());
  if (!usuario || !bcrypt.compareSync(password, usuario.password)) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const token = jwt.sign(
    { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } });
});

// GET /api/auth/me
router.get('/me', autenticar, (req, res) => {
  const u = db.prepare('SELECT id, nombre, email, rol, created_at FROM usuarios WHERE id = ?').get(req.usuario.id);
  if (!u) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(u);
});

// GET /api/auth/usuarios  (solo admin)
router.get('/usuarios', autenticar, soloAdmin, (req, res) => {
  const usuarios = db.prepare('SELECT id, nombre, email, rol, created_at FROM usuarios ORDER BY nombre').all();
  res.json(usuarios);
});

// POST /api/auth/usuarios  (solo admin)
router.post('/usuarios', autenticar, soloAdmin, (req, res) => {
  const { nombre, email, password, rol = 'operador' } = req.body;
  if (!nombre?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
  }
  if (!['admin', 'operador'].includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }
  const existe = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email.trim().toLowerCase());
  if (existe) return res.status(409).json({ error: 'Ya existe un usuario con ese email' });

  const hash = bcrypt.hashSync(password, 10);
  const { lastInsertRowid } = db.prepare(
    'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)'
  ).run(nombre.trim(), email.trim().toLowerCase(), hash, rol);

  const nuevo = db.prepare('SELECT id, nombre, email, rol, created_at FROM usuarios WHERE id = ?').get(lastInsertRowid);
  res.status(201).json(nuevo);
});

// DELETE /api/auth/usuarios/:id  (solo admin)
router.delete('/usuarios/:id', autenticar, soloAdmin, (req, res) => {
  if (parseInt(req.params.id) === req.usuario.id) {
    return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
  }
  const u = db.prepare('SELECT id FROM usuarios WHERE id = ?').get(req.params.id);
  if (!u) return res.status(404).json({ error: 'Usuario no encontrado' });
  db.prepare('DELETE FROM usuarios WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

module.exports = router;
