const VARIANTS = {
  ok:       { bg: '#d1fae5', color: '#065f46', label: 'OK' },
  bajo:     { bg: '#fef3c7', color: '#92400e', label: 'Stock bajo' },
  agotado:  { bg: '#fee2e2', color: '#991b1b', label: 'Agotado' },
  entrada:  { bg: '#d1fae5', color: '#065f46', label: 'Entrada' },
  salida:   { bg: '#fee2e2', color: '#991b1b', label: 'Salida' },
};

export function Badge({ variant, children }) {
  const v = VARIANTS[variant] || VARIANTS.ok;
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      background: v.bg,
      color: v.color,
    }}>
      {children ?? v.label}
    </span>
  );
}

export function stockVariant(stock, stockMin) {
  if (stock <= 0) return 'agotado';
  if (stock <= stockMin) return 'bajo';
  return 'ok';
}
