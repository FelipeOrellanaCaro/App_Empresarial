const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, 'inventario.db'));

// Configuración de rendimiento y consistencia
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

// Schema inicial / migraciones
db.exec(`
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
    tipo        TEXT    NOT NULL CHECK(tipo IN ('entrada', 'salida')),
    cantidad    INTEGER NOT NULL CHECK(cantidad > 0),
    motivo      TEXT,
    fecha       TEXT    NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
  );
`);

module.exports = db;
