const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, 'inventario.db'));

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

// ── Schema ───────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre     TEXT    NOT NULL,
    email      TEXT    UNIQUE NOT NULL,
    password   TEXT    NOT NULL,
    rol        TEXT    NOT NULL DEFAULT 'operador' CHECK(rol IN ('admin', 'operador')),
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS productos (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo     TEXT    UNIQUE NOT NULL,
    nombre     TEXT    NOT NULL,
    categoria  TEXT,
    unidad     TEXT,
    stock_min  INTEGER NOT NULL DEFAULT 0,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS movimientos (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER NOT NULL,
    usuario_id  INTEGER,
    tipo        TEXT    NOT NULL CHECK(tipo IN ('entrada', 'salida')),
    cantidad    INTEGER NOT NULL CHECK(cantidad > 0),
    motivo      TEXT,
    fecha       TEXT    NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)  ON DELETE SET NULL
  );
`);

// ── Seed: admin por defecto si no hay usuarios ────────────────────────────────
const hayUsuarios = db.prepare('SELECT COUNT(*) AS n FROM usuarios').get();
if (hayUsuarios.n === 0) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare(`
    INSERT INTO usuarios (nombre, email, password, rol)
    VALUES ('Administrador', 'admin@inventario.com', ?, 'admin')
  `).run(hash);
  console.log('Usuario admin creado: admin@inventario.com / admin123');
}

module.exports = db;
