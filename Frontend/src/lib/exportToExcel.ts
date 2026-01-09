import * as XLSX from 'xlsx';
import type { Order } from '../hooks/useOrders';

export function exportOrdersToExcel(orders: Order[], filename: string = 'reservas') {
  // Preparar los datos para Excel
  const excelData = orders.map((order) => {
    // Formatear fecha
    const createdDate = new Date(order.created_at);
    const formattedDate = createdDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Formatear productos
    const productsList = order.order_items
      .map(item => `${item.products.name} (x${item.quantity})`)
      .join('; ');

    // Formatear totales de productos
    const totalItems = order.order_items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      'ID Reserva': order.id,
      'Código de Barras': order.barcode || 'N/A',
      'Cliente': order.customer_name || 'Sin nombre',
      'Email': order.customer_email || 'Sin email',
      'Teléfono': order.customer_phone || order.clients?.phone || 'Sin teléfono',
      'Dirección': order.clients?.address || 'Sin dirección',
      'Estado': order.status.charAt(0).toUpperCase() + order.status.slice(1),
      'Pagado': order.is_paid ? 'Sí' : 'No',
      'Total': order.total,
      'Cantidad de Productos': totalItems,
      'Productos': productsList,
      'Fecha de Creación': formattedDate,
      'Fecha de Actualización': new Date(order.updated_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  });

  // Crear workbook y worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reservas');

  // Ajustar ancho de columnas
  const columnWidths = [
    { wch: 10 }, // ID Reserva
    { wch: 20 }, // Código de Barras
    { wch: 25 }, // Cliente
    { wch: 30 }, // Email
    { wch: 15 }, // Teléfono
    { wch: 30 }, // Dirección
    { wch: 12 }, // Estado
    { wch: 8 },  // Pagado
    { wch: 12 }, // Total
    { wch: 18 }, // Cantidad de Productos
    { wch: 50 }, // Productos
    { wch: 20 }, // Fecha de Creación
    { wch: 20 }, // Fecha de Actualización
  ];
  worksheet['!cols'] = columnWidths;

  // Generar nombre de archivo con fecha
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0];
  const finalFilename = `${filename}_${dateStr}.xlsx`;

  // Descargar archivo
  XLSX.writeFile(workbook, finalFilename);
}

