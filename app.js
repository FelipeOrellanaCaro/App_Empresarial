// ─── ESTADO ─────────────────────────────────────────────────────────────────
let productos = JSON.parse(localStorage.getItem('inv_productos') || '[]');
let movimientos = JSON.parse(localStorage.getItem('inv_movimientos') || '[]');
let editandoCodigo = null;
let eliminarCodigo = null;

// ─── PERSISTENCIA ────────────────────────────────────────────────────────────
function guardarDatos() {
  localStorage.setItem('inv_productos', JSON.stringify(productos));
  localStorage.setItem('inv_movimientos', JSON.stringify(movimientos));
}

// ─── STOCK CALCULADO ─────────────────────────────────────────────────────────
function calcularStock(codigo) {
  const prod = productos.find(p => p.codigo === codigo);
  const inicial = prod ? (prod.stockInicial || 0) : 0;
  return movimientos
    .filter(m => m.producto === codigo)
    .reduce((acc, m) => acc + (m.tipo === 'entrada' ? m.cantidad : -m.cantidad), inicial);
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'stock') renderStock();
    if (btn.dataset.tab === 'productos') renderProductos();
    if (btn.dataset.tab === 'movimientos') {
      actualizarSelectProductos();
      renderMovimientos();
    }
  });
});

// ─── RENDER STOCK ─────────────────────────────────────────────────────────────
function renderStock(filtro = '') {
  const tbody = document.getElementById('cuerpo-stock');
  const vacio = document.getElementById('stock-vacio');
  tbody.innerHTML = '';

  const lista = productos.filter(p =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    p.codigo.toLowerCase().includes(filtro.toLowerCase())
  );

  if (lista.length === 0) {
    vacio.style.display = 'block';
    document.getElementById('tabla-stock').style.display = 'none';
    return;
  }

  vacio.style.display = 'none';
  document.getElementById('tabla-stock').style.display = 'table';

  lista.forEach(p => {
    const stock = calcularStock(p.codigo);
    const min = p.stockMin || 0;
    let estadoClass = 'badge-ok', estadoTxt = 'OK';
    let numClass = 'stock-ok';

    if (stock <= 0) {
      estadoClass = 'badge-agotado'; estadoTxt = 'Agotado'; numClass = 'stock-agotado';
    } else if (stock <= min) {
      estadoClass = 'badge-bajo'; estadoTxt = 'Stock bajo'; numClass = 'stock-bajo';
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.codigo}</td>
      <td>${p.nombre}</td>
      <td>${p.categoria || '—'}</td>
      <td class="${numClass}">${stock}</td>
      <td>${p.unidad || '—'}</td>
      <td><span class="badge ${estadoClass}">${estadoTxt}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

document.getElementById('buscar-stock').addEventListener('input', e => {
  renderStock(e.target.value);
});

// ─── RENDER PRODUCTOS ─────────────────────────────────────────────────────────
function renderProductos() {
  const tbody = document.getElementById('cuerpo-productos');
  const vacio = document.getElementById('productos-vacio');
  tbody.innerHTML = '';

  if (productos.length === 0) {
    vacio.style.display = 'block';
    document.getElementById('tabla-productos').style.display = 'none';
    return;
  }

  vacio.style.display = 'none';
  document.getElementById('tabla-productos').style.display = 'table';

  productos.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.codigo}</td>
      <td>${p.nombre}</td>
      <td>${p.categoria || '—'}</td>
      <td>${p.unidad || '—'}</td>
      <td>${p.stockMin ?? '—'}</td>
      <td>
        <button class="btn-edit" onclick="editarProducto('${p.codigo}')">Editar</button>
        <button class="btn-del" onclick="confirmarEliminar('${p.codigo}')">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ─── FORM PRODUCTO ────────────────────────────────────────────────────────────
document.getElementById('btn-nuevo-producto').addEventListener('click', () => {
  editandoCodigo = null;
  limpiarFormProducto();
  document.getElementById('form-producto-titulo').textContent = 'Nuevo Producto';
  document.getElementById('prod-codigo').disabled = false;
  document.getElementById('form-producto').classList.remove('hidden');
});

document.getElementById('btn-cancelar-producto').addEventListener('click', () => {
  document.getElementById('form-producto').classList.add('hidden');
});

document.getElementById('btn-guardar-producto').addEventListener('click', () => {
  const codigo = document.getElementById('prod-codigo').value.trim().toUpperCase();
  const nombre = document.getElementById('prod-nombre').value.trim();
  const categoria = document.getElementById('prod-categoria').value.trim();
  const unidad = document.getElementById('prod-unidad').value.trim();
  const stockMin = parseInt(document.getElementById('prod-stock-min').value) || 0;
  const stockInicial = parseInt(document.getElementById('prod-stock-inicial').value) || 0;
  const errorEl = document.getElementById('error-producto');

  if (!codigo || !nombre) {
    errorEl.textContent = 'Código y nombre son obligatorios.';
    return;
  }

  if (!editandoCodigo && productos.find(p => p.codigo === codigo)) {
    errorEl.textContent = 'Ya existe un producto con ese código.';
    return;
  }

  errorEl.textContent = '';

  if (editandoCodigo) {
    const idx = productos.findIndex(p => p.codigo === editandoCodigo);
    productos[idx] = { ...productos[idx], nombre, categoria, unidad, stockMin };
  } else {
    productos.push({ codigo, nombre, categoria, unidad, stockMin, stockInicial });
  }

  guardarDatos();
  document.getElementById('form-producto').classList.add('hidden');
  renderProductos();
});

function editarProducto(codigo) {
  const p = productos.find(x => x.codigo === codigo);
  if (!p) return;
  editandoCodigo = codigo;
  document.getElementById('prod-codigo').value = p.codigo;
  document.getElementById('prod-codigo').disabled = true;
  document.getElementById('prod-nombre').value = p.nombre;
  document.getElementById('prod-categoria').value = p.categoria || '';
  document.getElementById('prod-unidad').value = p.unidad || '';
  document.getElementById('prod-stock-min').value = p.stockMin ?? '';
  document.getElementById('prod-stock-inicial').value = p.stockInicial ?? '';
  document.getElementById('form-producto-titulo').textContent = 'Editar Producto';
  document.getElementById('error-producto').textContent = '';
  document.getElementById('form-producto').classList.remove('hidden');
  document.getElementById('form-producto').scrollIntoView({ behavior: 'smooth' });
}

function limpiarFormProducto() {
  ['prod-codigo','prod-nombre','prod-categoria','prod-unidad','prod-stock-min','prod-stock-inicial']
    .forEach(id => document.getElementById(id).value = '');
  document.getElementById('error-producto').textContent = '';
}

// ─── ELIMINAR PRODUCTO ────────────────────────────────────────────────────────
function confirmarEliminar(codigo) {
  eliminarCodigo = codigo;
  document.getElementById('modal-eliminar').classList.remove('hidden');
}

document.getElementById('btn-confirmar-eliminar').addEventListener('click', () => {
  productos = productos.filter(p => p.codigo !== eliminarCodigo);
  movimientos = movimientos.filter(m => m.producto !== eliminarCodigo);
  guardarDatos();
  document.getElementById('modal-eliminar').classList.add('hidden');
  renderProductos();
});

document.getElementById('btn-cancelar-eliminar').addEventListener('click', () => {
  document.getElementById('modal-eliminar').classList.add('hidden');
});

// ─── RENDER MOVIMIENTOS ───────────────────────────────────────────────────────
function renderMovimientos() {
  const tbody = document.getElementById('cuerpo-movimientos');
  const vacio = document.getElementById('movimientos-vacio');
  const filtroTipo = document.getElementById('filtro-tipo').value;
  const filtroProd = document.getElementById('filtro-producto-mov').value;
  tbody.innerHTML = '';

  let lista = [...movimientos].reverse();
  if (filtroTipo) lista = lista.filter(m => m.tipo === filtroTipo);
  if (filtroProd) lista = lista.filter(m => m.producto === filtroProd);

  if (lista.length === 0) {
    vacio.style.display = 'block';
    document.getElementById('tabla-movimientos').style.display = 'none';
    return;
  }

  vacio.style.display = 'none';
  document.getElementById('tabla-movimientos').style.display = 'table';

  lista.forEach(m => {
    const prod = productos.find(p => p.codigo === m.producto);
    const nombreProd = prod ? prod.nombre : m.producto;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${m.fecha}</td>
      <td>${nombreProd}</td>
      <td><span class="badge badge-${m.tipo}">${m.tipo === 'entrada' ? 'Entrada' : 'Salida'}</span></td>
      <td>${m.cantidad}</td>
      <td>${m.motivo || '—'}</td>
    `;
    tbody.appendChild(tr);
  });
}

document.getElementById('filtro-tipo').addEventListener('change', renderMovimientos);
document.getElementById('filtro-producto-mov').addEventListener('change', renderMovimientos);

// ─── FORM MOVIMIENTO ──────────────────────────────────────────────────────────
document.getElementById('btn-nuevo-movimiento').addEventListener('click', () => {
  if (productos.length === 0) {
    alert('Primero debes registrar al menos un producto.');
    return;
  }
  actualizarSelectProductos();
  limpiarFormMovimiento();
  document.getElementById('form-movimiento').classList.remove('hidden');
});

document.getElementById('btn-cancelar-movimiento').addEventListener('click', () => {
  document.getElementById('form-movimiento').classList.add('hidden');
});

document.getElementById('btn-guardar-movimiento').addEventListener('click', () => {
  const producto = document.getElementById('mov-producto').value;
  const tipo = document.getElementById('mov-tipo').value;
  const cantidad = parseInt(document.getElementById('mov-cantidad').value);
  const fecha = document.getElementById('mov-fecha').value;
  const motivo = document.getElementById('mov-motivo').value.trim();
  const errorEl = document.getElementById('error-movimiento');

  if (!producto || !cantidad || cantidad < 1 || !fecha) {
    errorEl.textContent = 'Producto, cantidad y fecha son obligatorios.';
    return;
  }

  if (tipo === 'salida') {
    const stockActual = calcularStock(producto);
    if (cantidad > stockActual) {
      errorEl.textContent = `Stock insuficiente. Stock actual: ${stockActual}.`;
      return;
    }
  }

  errorEl.textContent = '';
  movimientos.push({ producto, tipo, cantidad, fecha, motivo });
  guardarDatos();
  document.getElementById('form-movimiento').classList.add('hidden');
  renderMovimientos();
});

function limpiarFormMovimiento() {
  document.getElementById('mov-producto').value = '';
  document.getElementById('mov-tipo').value = 'entrada';
  document.getElementById('mov-cantidad').value = '';
  document.getElementById('mov-fecha').value = new Date().toISOString().split('T')[0];
  document.getElementById('mov-motivo').value = '';
  document.getElementById('error-movimiento').textContent = '';
}

function actualizarSelectProductos() {
  const selects = [
    document.getElementById('mov-producto'),
    document.getElementById('filtro-producto-mov')
  ];
  selects.forEach((sel, i) => {
    const val = sel.value;
    sel.innerHTML = i === 0
      ? '<option value="">-- Seleccionar --</option>'
      : '<option value="">Todos los productos</option>';
    productos.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.codigo;
      opt.textContent = `${p.codigo} - ${p.nombre}`;
      sel.appendChild(opt);
    });
    sel.value = val;
  });
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
renderStock();
