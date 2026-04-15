import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Exporta un array de objetos a un archivo Excel.
 * @param {object[]} datos - Filas de datos
 * @param {Array<{key: string, label: string}>} columnas - Columnas a incluir
 * @param {string} nombreArchivo - Nombre del archivo (sin extensión)
 */
export function exportarExcel(datos, columnas, nombreArchivo = 'exportacion') {
  const filas = datos.map(row =>
    Object.fromEntries(columnas.map(c => [c.label, row[c.key] ?? '']))
  );
  const ws = XLSX.utils.json_to_sheet(filas);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Datos');
  XLSX.writeFile(wb, `${nombreArchivo}.xlsx`);
}

/**
 * Exporta un array de objetos a un archivo PDF con tabla.
 * @param {object[]} datos - Filas de datos
 * @param {Array<{key: string, label: string}>} columnas - Columnas a incluir
 * @param {string} titulo - Título del reporte
 * @param {string} nombreArchivo - Nombre del archivo (sin extensión)
 */
export function exportarPDF(datos, columnas, titulo = 'Reporte', nombreArchivo = 'reporte') {
  const doc = new jsPDF({ orientation: 'landscape' });

  // Encabezado
  doc.setFontSize(16);
  doc.setTextColor(26, 86, 219);
  doc.text(titulo, 14, 16);

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Generado: ${new Date().toLocaleString('es-CL')}`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [columnas.map(c => c.label)],
    body: datos.map(row => columnas.map(c => row[c.key] ?? '')),
    headStyles: { fillColor: [26, 86, 219], fontSize: 9, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 250, 255] },
    margin: { left: 14, right: 14 },
  });

  doc.save(`${nombreArchivo}.pdf`);
}
