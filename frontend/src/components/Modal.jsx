export function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div style={overlay} onClick={onClose}>
      <div style={box} onClick={e => e.stopPropagation()}>
        {title && <h3 style={{ marginBottom: 16, color: '#111827' }}>{title}</h3>}
        {children}
      </div>
    </div>
  );
}

export function ConfirmModal({ open, message, onConfirm, onCancel }) {
  return (
    <Modal open={open} onClose={onCancel}>
      <p style={{ marginBottom: 20, color: '#374151' }}>{message}</p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn-secondary" onClick={onCancel}>Cancelar</button>
        <button className="btn-danger" onClick={onConfirm}>Eliminar</button>
      </div>
    </Modal>
  );
}

const overlay = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 100,
};

const box = {
  background: 'white',
  borderRadius: 10,
  padding: 28,
  width: '90%',
  maxWidth: 480,
  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
};
