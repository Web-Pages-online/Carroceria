import { Request, Response } from 'express';
import { PedidoService } from '../services/PedidoService';

const pedidoService = new PedidoService();

const IVA = 0.16;

function formatMoney(value: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
}

function baseHtml(titulo: string, body: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>${titulo}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#1a1a1a;background:#fff;padding:40px}
    .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #f97316;padding-bottom:20px;margin-bottom:24px}
    .company-name{font-size:22px;font-weight:800;color:#f97316;text-transform:uppercase;letter-spacing:1px}
    .company-sub{font-size:11px;color:#555;margin-top:2px;text-transform:uppercase;letter-spacing:1px}
    .doc-title{text-align:right}
    .doc-title h1{font-size:20px;font-weight:700;color:#1a1a1a;text-transform:uppercase}
    .doc-title .folio{font-size:13px;color:#f97316;font-weight:600;margin-top:4px}
    .doc-title .fecha{font-size:11px;color:#777;margin-top:2px}
    .section{margin-bottom:20px}
    .section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#f97316;border-bottom:1px solid #f0f0f0;padding-bottom:4px;margin-bottom:10px}
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 24px}
    .info-row{display:flex;gap:6px}
    .info-label{font-weight:600;color:#555;min-width:90px;font-size:12px}
    .info-value{color:#1a1a1a;font-size:12px}
    table{width:100%;border-collapse:collapse;margin-bottom:16px}
    th{background:#f97316;color:#fff;padding:9px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.5px}
    td{padding:9px 12px;border-bottom:1px solid #f0f0f0;font-size:12px}
    tr:nth-child(even) td{background:#fafafa}
    .totals{margin-left:auto;width:280px}
    .total-row{display:flex;justify-content:space-between;padding:5px 0;font-size:13px;border-bottom:1px solid #f0f0f0}
    .total-final{display:flex;justify-content:space-between;padding:8px 0;font-size:16px;font-weight:800;color:#f97316;border-top:2px solid #f97316;margin-top:4px}
    .alert-box{background:#fff8f0;border:1px solid #f97316;border-left:4px solid #f97316;padding:10px 14px;border-radius:4px;font-size:11px;color:#555;margin-bottom:20px}
    .signatures{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:48px}
    .sign-block{border-top:2px solid #1a1a1a;padding-top:8px;text-align:center}
    .sign-title{font-weight:700;font-size:12px;margin-bottom:2px}
    .sign-sub{font-size:11px;color:#777}
    .footer{margin-top:32px;border-top:1px solid #e5e5e5;padding-top:12px;font-size:10px;color:#999;text-align:center}
    .badge{display:inline-block;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600}
    .badge-entregado{background:#fef3c7;color:#92400e}
    @media print{body{padding:20px}.no-print{display:none}}
  </style>
</head>
<body>${body}
<script>window.onload=function(){window.print()}<\/script>
</body></html>`;
}

export class PedidoController {
  static async crear(req: Request, res: Response) {
    try {
      const nuevoPedido = await pedidoService.crearPedido(req.body);
      res.status(201).json(nuevoPedido);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async obtenerTodos(req: Request, res: Response) {
    try {
      const pedidos = await pedidoService.obtenerTodos();
      res.json(pedidos);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async obtenerPorId(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const pedido = await pedidoService.obtenerPorId(id);
      res.json(pedido);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  static async actualizarEstado(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const { estado, fecha_entrega } = req.body;
      const pedidoActualizado = await pedidoService.actualizarEstado(id, estado, fecha_entrega);
      res.json(pedidoActualizado);
    } catch (error: any) {
      const status = error.status || 400;
      res.status(status).json({ error: error.message, faltantes: error.faltantes });
    }
  }

  static async eliminar(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      await pedidoService.eliminarPedido(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  static async generarCotizacion(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const pedido = await pedidoService.obtenerPorId(id) as any;

      const precioBase = pedido.importe != null
        ? parseFloat(pedido.importe)
        : parseFloat(pedido.tipo_carroceria?.precio_base ?? 0);
      const subtotal   = precioBase;
      const iva        = subtotal * IVA;
      const total      = subtotal + iva;

      const emision  = new Date();
      const vigencia = new Date(emision);
      vigencia.setDate(vigencia.getDate() + 15);
      const fmt = (d: Date) => d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });

      const body = `
<div class="header">
  <div>
    <div class="company-name">Multiservicios de Soldadura Torales</div>
    <div class="company-sub">Fabricación profesional de carrocerías</div>
  </div>
  <div class="doc-title">
    <h1>Cotización</h1>
    <div class="folio">Folio: COT-${String(pedido.id).padStart(5,'0')}</div>
    <div class="fecha">Emisión: ${fmt(emision)}</div>
    <div class="fecha">Válida hasta: ${fmt(vigencia)}</div>
  </div>
</div>

<div class="section">
  <div class="section-title">Datos del cliente</div>
  <div class="info-grid">
    <div class="info-row"><span class="info-label">Agencia:</span><span class="info-value">${pedido.agencia?.nombre ?? '—'}</span></div>
    <div class="info-row"><span class="info-label">Contacto:</span><span class="info-value">${pedido.agencia?.contacto ?? '—'}</span></div>
    <div class="info-row"><span class="info-label">Teléfono:</span><span class="info-value">${pedido.agencia?.telefono ?? '—'}</span></div>
    <div class="info-row"><span class="info-label">Dirección:</span><span class="info-value">${pedido.agencia?.direccion ?? '—'}</span></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Detalle del servicio</div>
  <table>
    <thead><tr><th>#</th><th>Descripción</th><th>Cant.</th><th>Precio unitario</th><th>Importe</th></tr></thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>
          <strong>${pedido.tipo_carroceria?.nombre ?? '—'}</strong>
          ${pedido.tipo_carroceria?.descripcion ? `<br/><span style="color:#777;font-size:11px">${pedido.tipo_carroceria.descripcion}</span>` : ''}
        </td>
        <td>1</td>
        <td>${formatMoney(precioBase)}</td>
        <td>${formatMoney(precioBase)}</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row"><span>Subtotal</span><span>${formatMoney(subtotal)}</span></div>
    <div class="total-row"><span>IVA (16%)</span><span>${formatMoney(iva)}</span></div>
    <div class="total-final"><span>TOTAL</span><span>${formatMoney(total)}</span></div>
  </div>
</div>

<div class="alert-box">
  ⚠️ <strong>Nota:</strong> Los precios son válidos por 15 días naturales a partir de la fecha de emisión (${fmt(vigencia)}).
  Multiservicios de Soldadura Torales se reserva el derecho de ajustar los precios si el diseño final sufre modificaciones
  o si existe variación en el costo del acero y materiales.
</div>

<div class="signatures">
  <div class="sign-block">
    <div class="sign-title">Autoriza el cliente</div>
    <div class="sign-sub">${pedido.agencia?.contacto ?? 'Gerente / Representante'}</div>
    <div class="sign-sub">${pedido.agencia?.nombre ?? ''}</div>
  </div>
  <div class="sign-block">
    <div class="sign-title">Elaboró</div>
    <div class="sign-sub">Multiservicios de Soldadura Torales</div>
  </div>
</div>

<div class="footer">Multiservicios de Soldadura Torales — Documento generado el ${fmt(emision)} — Folio COT-${String(pedido.id).padStart(5,'0')}</div>`;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(baseHtml(`Cotización COT-${String(pedido.id).padStart(5,'0')}`, body));
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  static async generarRecibo(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const pedido = await pedidoService.obtenerPorId(id) as any;

      if (!['TERMINADO', 'ENTREGADO'].includes(pedido.estado)) {
        return res.status(400).json({ error: 'Solo se puede generar el recibo para pedidos terminados o entregados.' });
      }

      const precioBase = pedido.importe != null
        ? parseFloat(pedido.importe)
        : parseFloat(pedido.tipo_carroceria?.precio_base ?? 0);
      const iva        = precioBase * IVA;
      const total      = precioBase + iva;

      const fechaEntrega = pedido.fecha_entrega ? new Date(pedido.fecha_entrega) : new Date();
      const fmt = (d: Date) => d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
      const fmtHora = (d: Date) => d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

      const body = `
<div class="header">
  <div>
    <div class="company-name">Multiservicios de Soldadura Torales</div>
    <div class="company-sub">Fabricación profesional de carrocerías</div>
  </div>
  <div class="doc-title">
    <h1>Recibo de Entrega</h1>
    <div class="folio">Folio: SAL-${String(pedido.id).padStart(5,'0')}</div>
    <div class="fecha">Fecha de entrega: ${fmt(fechaEntrega)}</div>
    <div class="fecha">Hora: ${fmtHora(fechaEntrega)}</div>
  </div>
</div>

<div class="section">
  <div class="section-title">Datos del cliente</div>
  <div class="info-grid">
    <div class="info-row"><span class="info-label">Agencia:</span><span class="info-value">${pedido.agencia?.nombre ?? '—'}</span></div>
    <div class="info-row"><span class="info-label">Contacto:</span><span class="info-value">${pedido.agencia?.contacto ?? '—'}</span></div>
    <div class="info-row"><span class="info-label">Teléfono:</span><span class="info-value">${pedido.agencia?.telefono ?? '—'}</span></div>
    <div class="info-row"><span class="info-label">Dirección:</span><span class="info-value">${pedido.agencia?.direccion ?? '—'}</span></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Detalle del trabajo entregado</div>
  <table>
    <thead><tr><th>Folio de pedido</th><th>Descripción</th><th>Estado</th><th>Importe</th></tr></thead>
    <tbody>
      <tr>
        <td><strong>#${String(pedido.id).padStart(4,'0')}</strong></td>
        <td>
          <strong>${pedido.tipo_carroceria?.nombre ?? '—'}</strong>
          ${pedido.tipo_carroceria?.descripcion ? `<br/><span style="color:#777;font-size:11px">${pedido.tipo_carroceria.descripcion}</span>` : ''}
        </td>
        <td><span class="badge badge-entregado">${pedido.estado}</span></td>
        <td>${formatMoney(total)}</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row"><span>Subtotal</span><span>${formatMoney(precioBase)}</span></div>
    <div class="total-row"><span>IVA (16%)</span><span>${formatMoney(iva)}</span></div>
    <div class="total-final"><span>TOTAL</span><span>${formatMoney(total)}</span></div>
  </div>
</div>

<div class="alert-box">
  ✅ La carrocería descrita en este documento ha sido fabricada conforme a las especificaciones acordadas y sale del taller
  de <strong>Multiservicios de Soldadura Torales</strong> en condiciones óptimas.
  La firma de este documento acredita la recepción conforme por parte del cliente.
</div>

<div class="signatures">
  <div class="sign-block">
    <div class="sign-title">Entregado por</div>
    <div class="sign-sub">Multiservicios de Soldadura Torales</div>
    <div class="sign-sub" style="margin-top:4px;font-size:10px;color:#aaa">Firma y sello</div>
  </div>
  <div class="sign-block">
    <div class="sign-title">Recibido de conformidad</div>
    <div class="sign-sub">${pedido.agencia?.contacto ?? 'Gerente / Chofer'}</div>
    <div class="sign-sub">${pedido.agencia?.nombre ?? ''}</div>
    <div class="sign-sub" style="margin-top:4px;font-size:10px;color:#aaa">Firma y nombre legible</div>
  </div>
</div>

<div class="footer">
  Folio SAL-${String(pedido.id).padStart(5,'0')} — Fecha de emisión: ${fmt(new Date())} —
  Este documento es el comprobante oficial de salida del taller.
</div>`;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(baseHtml(`Recibo SAL-${String(pedido.id).padStart(5,'0')}`, body));
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}
