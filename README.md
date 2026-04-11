# Control de Inventario

Aplicación web full-stack para gestionar inventario: productos, entradas/salidas de stock y visualización en tiempo real.

## Tecnologías

- **Backend:** Node.js + Express + SQLite (nativo)
- **Frontend:** React + Vite + React Router

## Requisitos previos

- [Node.js](https://nodejs.org/) v22 o superior

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/FelipeOrellanaCaro/App_Empresarial.git
   cd App_Empresarial
   ```

2. Instalar dependencias del backend:
   ```bash
   cd backend
   npm install
   ```

3. Instalar dependencias del frontend:
   ```bash
   cd ../frontend
   npm install
   ```

## Uso

### Opción A — Windows (recomendado)
Doble clic en `iniciar.bat` en la raíz del proyecto.

### Opción B — Manual (dos terminales)

Terminal 1 – Backend:
```bash
cd backend
npm run dev
```

Terminal 2 – Frontend:
```bash
cd frontend
npm run dev
```

Abrir en el navegador: [http://localhost:5173](http://localhost:5173)

## Funcionalidades

- Registrar productos con código, categoría, unidad y stock mínimo
- Registrar entradas y salidas de stock con fecha y motivo
- Visualizar stock actual con alertas de stock bajo o agotado
- Anular movimientos con validación de consistencia
