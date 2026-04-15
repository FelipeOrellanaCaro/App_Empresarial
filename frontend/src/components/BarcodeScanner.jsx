import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { NotFoundException } from '@zxing/library';

/**
 * Modal que activa la cámara y escanea códigos de barras/QR.
 * @param {boolean}        open     - Si el scanner está abierto
 * @param {function}       onScan   - Callback con el texto escaneado
 * @param {function}       onClose  - Callback para cerrar
 */
export function BarcodeScanner({ open, onScan, onClose }) {
  const videoRef  = useRef(null);
  const readerRef = useRef(null);
  const [error, setError]   = useState(null);
  const [activo, setActivo] = useState(false);

  useEffect(() => {
    if (!open) return;

    setError(null);
    setActivo(false);
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    reader.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
      if (result) {
        onScan(result.getText());
      }
      if (err && !(err instanceof NotFoundException)) {
        // NotFoundException es normal cuando no hay código en frame, ignorar
      }
    })
    .then(() => setActivo(true))
    .catch(e => {
      if (e?.name === 'NotAllowedError') {
        setError('Permiso de cámara denegado. Permite el acceso en tu navegador.');
      } else {
        setError('No se pudo iniciar la cámara: ' + e.message);
      }
    });

    return () => {
      BrowserMultiFormatReader.releaseAllStreams();
    };
  }, [open]); // eslint-disable-line

  function cerrar() {
    BrowserMultiFormatReader.releaseAllStreams();
    setActivo(false);
    onClose();
  }

  if (!open) return null;

  return (
    <div style={overlay} onClick={cerrar}>
      <div style={box} onClick={e => e.stopPropagation()}>
        <div style={header}>
          <span style={{ fontWeight: 700, color: '#1a56db' }}>📷 Escanear código</span>
          <button onClick={cerrar} style={btnClose}>✕</button>
        </div>

        <div style={videoWrap}>
          <video ref={videoRef} style={videoStyle} />
          {activo && <div style={scanLine} />}
          {!activo && !error && (
            <div style={overlay2}>
              <span style={{ color: 'white', fontSize: 13 }}>Iniciando cámara...</span>
            </div>
          )}
        </div>

        {error ? (
          <p style={{ color: '#dc2626', fontSize: 13, marginTop: 10, textAlign: 'center' }}>{error}</p>
        ) : (
          <p style={{ color: '#6b7280', fontSize: 12, marginTop: 10, textAlign: 'center' }}>
            Apunta la cámara al código de barras o QR
          </p>
        )}
      </div>
    </div>
  );
}

// ── Estilos inline ────────────────────────────────────────────────────────────
const overlay = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.6)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 200,
};

const box = {
  background: 'white',
  borderRadius: 12,
  padding: '1rem',
  width: '90%', maxWidth: 420,
  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
};

const header = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  marginBottom: '0.75rem',
};

const btnClose = {
  background: 'none', border: 'none', fontSize: 18,
  cursor: 'pointer', color: '#6b7280', lineHeight: 1,
};

const videoWrap = {
  position: 'relative',
  width: '100%', aspectRatio: '4/3',
  background: '#000',
  borderRadius: 8, overflow: 'hidden',
};

const videoStyle = {
  width: '100%', height: '100%',
  objectFit: 'cover', display: 'block',
};

const scanLine = {
  position: 'absolute',
  left: '10%', right: '10%',
  top: '50%',
  height: 2,
  background: '#1a56db',
  boxShadow: '0 0 8px #1a56db',
  animation: 'scan 2s linear infinite',
};

const overlay2 = {
  position: 'absolute', inset: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(0,0,0,0.4)',
};
