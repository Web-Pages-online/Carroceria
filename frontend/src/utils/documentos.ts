const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function abrirDocumento(url: string) {
  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'No se pudo generar el documento');
  }

  const html = await res.text();
  const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  const ventana = window.open(blobUrl, '_blank');

  // Liberar la URL de objeto una vez que la ventana la cargó
  if (ventana) {
    ventana.addEventListener('load', () => URL.revokeObjectURL(blobUrl), { once: true });
  }
}

export function descargarCotizacion(pedidoId: number) {
  return abrirDocumento(`${API_URL}/pedidos/${pedidoId}/cotizacion`);
}

export function descargarRecibo(pedidoId: number) {
  return abrirDocumento(`${API_URL}/pedidos/${pedidoId}/recibo`);
}
