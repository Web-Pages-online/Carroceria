import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const IVA = 0.16;
const ORANGE: [number, number, number] = [249, 115, 22];
const DARK:   [number, number, number] = [26,  26,  26];
const GRAY:   [number, number, number] = [120, 120, 120];
const LIGHT:  [number, number, number] = [245, 245, 245];

function money(val: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
}

async function fetchPedido(id: number) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/pedidos/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('No se pudo obtener el pedido');
  return res.json();
}

// ─── COTIZACIÓN ────────────────────────────────────────────────────────────
export async function descargarCotizacion(pedidoId: number) {
  const pedido = await fetchPedido(pedidoId);

  const cantidad   = pedido.cantidad ?? 1;
  const totalBruto = pedido.importe != null
    ? parseFloat(pedido.importe)
    : parseFloat(pedido.tipo_carroceria?.precio_base ?? 0);
  const precioUnitario = cantidad > 0 ? totalBruto / cantidad : totalBruto;
  const iva  = totalBruto * IVA;
  const total = totalBruto + iva;

  const emision  = new Date();
  const vigencia = new Date(emision);
  vigencia.setDate(vigencia.getDate() + 15);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  let y = 18;

  // ── Encabezado ──────────────────────────────────────────────────────────
  doc.setFillColor(...ORANGE);
  doc.rect(0, 0, W, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('MULTISERVICIOS DE SOLDADURA TORALES', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Fabricación profesional de carrocerías', 14, 17);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('COTIZACIÓN', W - 14, 11, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Folio: COT-${String(pedido.id).padStart(5, '0')}`, W - 14, 17, { align: 'right' });
  doc.text(`Emisión: ${fmtDate(emision)}`, W - 14, 22, { align: 'right' });

  y = 36;

  // ── Datos del cliente ────────────────────────────────────────────────────
  const tieneEntregaEst = !!pedido.fecha_entrega_est;
  const boxH = tieneEntregaEst ? 37 : 30;
  doc.setFillColor(...LIGHT);
  doc.roundedRect(14, y, W - 28, boxH, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...ORANGE);
  doc.text('DATOS DEL CLIENTE', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...DARK);

  const col1x = 18, col2x = W / 2 + 4;
  doc.setFont('helvetica', 'bold');   doc.text('Agencia:',   col1x, y + 13); doc.setFont('helvetica', 'normal'); doc.text(pedido.agencia?.nombre   ?? '—', col1x + 22, y + 13);
  doc.setFont('helvetica', 'bold');   doc.text('Contacto:',  col1x, y + 19); doc.setFont('helvetica', 'normal'); doc.text(pedido.agencia?.contacto ?? '—', col1x + 22, y + 19);
  doc.setFont('helvetica', 'bold');   doc.text('Teléfono:',  col2x, y + 13); doc.setFont('helvetica', 'normal'); doc.text(pedido.agencia?.telefono ?? '—', col2x + 22, y + 13);
  doc.setFont('helvetica', 'bold');   doc.text('Dirección:', col2x, y + 19); doc.setFont('helvetica', 'normal'); doc.text(pedido.agencia?.direccion ?? '—', col2x + 22, y + 19, { maxWidth: W / 2 - 28 });

  doc.setFont('helvetica', 'bold');   doc.text('Fecha emisión:', col1x, y + 25); doc.setFont('helvetica', 'normal'); doc.text(fmtDate(emision), col1x + 32, y + 25);

  if (tieneEntregaEst) {
    doc.setFont('helvetica', 'bold');
    doc.text('Entrega estimada:', col2x, y + 25);
    doc.setFont('helvetica', 'normal');
    doc.text(fmtDate(new Date(pedido.fecha_entrega_est)), col2x + 38, y + 25);
  }

  y += boxH + 8;

  // ── Tabla de servicios ───────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...ORANGE);
  doc.text('DETALLE DEL SERVICIO', 14, y);
  y += 3;

  const descripcion = [
    pedido.tipo_vehiculo || pedido.tipo_carroceria?.nombre || 'Carrocería',
    pedido.ancho && pedido.largo ? `Medidas: ${pedido.ancho}m ancho × ${pedido.largo}m largo` : null,
    pedido.notas_taller ? `Notas: ${pedido.notas_taller}` : null,
  ].filter(Boolean).join('\n');

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [['#', 'Descripción', 'Cantidad', 'Precio unitario', 'Importe']],
    body: [[
      '1',
      descripcion,
      String(cantidad),
      money(precioUnitario),
      money(totalBruto),
    ]],
    headStyles:  { fillColor: ORANGE, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    bodyStyles:  { textColor: DARK, fontSize: 9 },
    columnStyles: { 0: { cellWidth: 10 }, 2: { halign: 'center' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
    alternateRowStyles: { fillColor: [252, 252, 252] },
    didDrawPage: () => {},
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // ── Totales ──────────────────────────────────────────────────────────────
  const txW = 70, txX = W - 14 - txW;
  const rowH = 7;

  doc.setFillColor(...LIGHT);
  doc.rect(txX, y, txW, rowH * 2 + 1, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text('Subtotal',  txX + 4,       y + 5);
  doc.text(money(totalBruto), txX + txW - 4, y + 5, { align: 'right' });

  doc.text('IVA (16%)', txX + 4,       y + rowH + 4);
  doc.text(money(iva),  txX + txW - 4, y + rowH + 4, { align: 'right' });

  y += rowH * 2 + 3;
  doc.setFillColor(...ORANGE);
  doc.rect(txX, y, txW, 9, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL',      txX + 4,       y + 6);
  doc.text(money(total), txX + txW - 4, y + 6, { align: 'right' });

  // ── Firmas — fijadas al fondo de la página ───────────────────────────────
  const pageH = doc.internal.pageSize.getHeight();
  const sigW = (W - 28 - 20) / 2;
  const sigX2 = 14 + sigW + 20;
  y = pageH - 36; // posición fija cerca del pie

  doc.setDrawColor(...DARK);
  doc.setLineWidth(0.5);

  // Bloque 1
  doc.line(14, y + 18, 14 + sigW, y + 18);
  doc.setFont('helvetica', 'bold');   doc.setFontSize(8); doc.setTextColor(...DARK);
  doc.text('Cliente', 14 + sigW / 2, y + 22, { align: 'center' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...GRAY);
  doc.text(pedido.agencia?.contacto ?? '—', 14 + sigW / 2, y + 26, { align: 'center' });
  doc.text(pedido.agencia?.nombre ?? '', 14 + sigW / 2, y + 30, { align: 'center' });

  // Bloque 2
  doc.line(sigX2, y + 18, sigX2 + sigW, y + 18);
  doc.setFont('helvetica', 'bold');   doc.setFontSize(8); doc.setTextColor(...DARK);
  doc.text('Elaboró', sigX2 + sigW / 2, y + 22, { align: 'center' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...GRAY);
  doc.text('Multiservicios de Soldadura Torales', sigX2 + sigW / 2, y + 26, { align: 'center' });

  // ── Pie de página ─────────────────────────────────────────────────────────
  doc.setFillColor(...ORANGE);
  doc.rect(0, pageH - 8, W, 8, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(`Folio COT-${String(pedido.id).padStart(5,'0')}  ·  Emitida el ${fmtDate(emision)}  ·  Multiservicios de Soldadura Torales`, W / 2, pageH - 3, { align: 'center' });

  doc.save(`Cotizacion-COT-${String(pedido.id).padStart(5,'0')}.pdf`);
}

// ─── RECIBO DE ENTREGA (HTML → ventana de impresión) ───────────────────────
async function abrirDocumentoHTML(url: string) {
  const token = localStorage.getItem('token');
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'No se pudo generar el documento');
  }
  const html = await res.text();
  const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  const ventana = window.open(blobUrl, '_blank');
  if (ventana) {
    ventana.addEventListener('load', () => URL.revokeObjectURL(blobUrl), { once: true });
  }
}

export function descargarRecibo(pedidoId: number) {
  return abrirDocumentoHTML(`${API_URL}/pedidos/${pedidoId}/recibo`);
}
