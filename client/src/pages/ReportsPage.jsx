import React, { useState } from 'react';
import { Input, Button, message, Modal } from 'antd';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import apiService from '../services/api';

const ReportsPage = () => {
  // Estado para paz y salvo
  const [docNumber, setDocNumber] = useState('');
  const [userStatus, setUserStatus] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Estado para reportes generales (estructura base)
  const [reportType, setReportType] = useState('loans');
  const [reportData, setReportData] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);

  // Estado para filtros de mes y año
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Consultar paz y salvo
  const handleCheckClearance = async () => {
    setLoading(true);
    setUserStatus(null);
    setUserInfo(null);
    try {
      // Buscar usuario por documento
      const users = await apiService.getUsers();
      const user = users.find(u => u.document_number === docNumber);
      if (!user) {
        message.error('Usuario no encontrado');
        setLoading(false);
        return;
      }
      setUserInfo(user);
      // Verificar estado de préstamos
      const status = await apiService.checkUserStatus(user.id);
      setUserStatus(status);
      setModalVisible(true);
    } catch (err) {
      message.error('Error al consultar el estado del usuario');
    }
    setLoading(false);
  };

  // Generar PDF de paz y salvo
  const handleGeneratePDF = async () => {
    if (!userInfo || !userStatus) return;
    // Obtener historial de préstamos del usuario
    let loans = [];
    try {
      loans = await apiService.getLoansByUser(userInfo.id);
    } catch (e) {
      loans = [];
    }
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 25;

    // Título centrado
    doc.setFontSize(18);
    doc.text('Certificado de Paz y Salvo', pageWidth / 2, y, { align: 'center' });
    y += 10;
    doc.setFontSize(14);
    doc.text('Biblioteca SENA', pageWidth / 2, y, { align: 'center' });
    y += 18;

    // Información del usuario
    doc.setFontSize(12);
    doc.text('Información del Usuario', 25, y);
    y += 8;
    doc.setFontSize(11);
    doc.text(`Nombre: ${userInfo.full_name || ''}`, 25, y);
    y += 6;
    doc.text(`Documento: ${userInfo.document_number || ''}`, 25, y);
    y += 6;
    doc.text(`Email: ${userInfo.email || ''}`, 25, y);
    y += 6;
    if (userInfo.phone) {
      doc.text(`Teléfono: ${userInfo.phone}`, 25, y);
      y += 6;
    }
    y += 4;

    // Estado de préstamos
    doc.setFontSize(12);
    doc.text('Estado de Préstamos', 25, y);
    y += 8;
    doc.setFontSize(11);
    const totalPrestamos = loans.length;
    const prestamosDevueltos = loans.filter(l => l.status === 'devuelto').length;
    doc.text(`Total de préstamos realizados: ${totalPrestamos}`, 25, y);
    y += 6;
    doc.text(`Préstamos devueltos: ${prestamosDevueltos}`, 25, y);
    y += 6;
    if (userStatus.isInGoodStanding && userStatus.activeLoansCount === 0) {
      doc.text('Se certifica que el usuario se encuentra a PAZ Y SALVO con la biblioteca.', 25, y);
      y += 6;
      doc.text('No registra préstamos pendientes ni vencidos a la fecha.', 25, y);
    } else {
      doc.text('El usuario tiene préstamos pendientes o vencidos.', 25, y);
    }
    y += 10;

    // Historial de préstamos (tabla)
    doc.setFontSize(12);
    doc.text('Historial de Préstamos', 25, y);
    y += 8;

    // Encabezado de tabla azul
    const tableX = 25;
    const colWidths = [70, 35, 35, 25];
    const headers = ['Libro', 'Fecha Préstamo', 'Fecha Devolución', 'Estado'];
    let colX = tableX;
    doc.setFillColor(0, 112, 192); // Azul
    doc.setTextColor(255, 255, 255);
    headers.forEach((header, i) => {
      doc.rect(colX, y, colWidths[i], 8, 'F');
      doc.text(header, colX + 2, y + 6);
      colX += colWidths[i];
    });
    y += 8;
    doc.setTextColor(60, 60, 60);

    // Filas de la tabla
    loans.forEach((loan, idx) => {
      colX = tableX;
      // Alternar color de fondo
      if (idx % 2 === 0) {
        doc.setFillColor(240, 240, 240);
        doc.rect(colX, y, colWidths.reduce((a, b) => a + b, 0), 8, 'F');
      }
      doc.text(loan.book?.title?.toString() || '', colX + 2, y + 6, { maxWidth: colWidths[0] - 4 });
      colX += colWidths[0];
      doc.text(loan.loan_date ? new Date(loan.loan_date).toLocaleDateString() : '', colX + 2, y + 6);
      colX += colWidths[1];
      doc.text(loan.due_date ? new Date(loan.due_date).toLocaleDateString() : '', colX + 2, y + 6);
      colX += colWidths[2];
      doc.text(loan.status === 'devuelto' ? 'Devuelto' : (loan.status || ''), colX + 2, y + 6);
      y += 8;
      if (y > 260) { doc.addPage(); y = 25; }
    });

    // Fecha de expedición
    y += 10;
    doc.setFontSize(11);
    doc.text(`Fecha de expedición: ${new Date().toLocaleDateString()}`, 25, y);

    doc.save(`paz_y_salvo_${userInfo.document_number}_${new Date().toISOString()}.pdf`);
  };

  // Consultar y exportar reportes generales (estructura base)
  const handleFetchReport = async () => {
    setReportLoading(true);
    setReportData([]);
    try {
      let data = [];
      if (reportType === 'loans') {
        let rawData = await apiService.getLoans();
        rawData = rawData.filter(loan => {
          if (!loan.loan_date) return false;
          const date = new Date(loan.loan_date);
          return (
            date.getMonth() + 1 === selectedMonth &&
            date.getFullYear() === selectedYear
          );
        });
        data = rawData.map(loan => ({
          'Título del libro': loan.book?.title || '',
          'ISBN': loan.book?.isbn || '',
          'Usuario': loan.user?.full_name || '',
          'Documento': loan.user?.document_number || '',
          'Email': loan.user?.email || '',
          'Fecha de préstamo': loan.loan_date ? new Date(loan.loan_date).toLocaleDateString() : '',
          'Fecha de devolución': loan.due_date ? new Date(loan.due_date).toLocaleDateString() : '',
          'Fecha de retorno': loan.return_date ? new Date(loan.return_date).toLocaleDateString() : '',
          'Estado': loan.status || '',
        }));
      } else if (reportType === 'books') {
        let rawData = await apiService.getBooks();
        rawData = rawData.filter(book => {
          if (!book.created_at) return false;
          const date = new Date(book.created_at);
          return (
            date.getMonth() + 1 === selectedMonth &&
            date.getFullYear() === selectedYear
          );
        });
        data = rawData.map(book => ({
          'Título': book.title || '',
          'Autor': book.author?.name || '',
          'Categoría': book.category?.name || '',
          'Editorial': book.publisher?.name || '',
          'Año': book.publication_year || '',
          'ISBN': book.isbn || '',
          'Estado': book.state === 1 ? 'Activo' : 'Inactivo',
        }));
      } else if (reportType === 'users') {
        let rawData = await apiService.getUsers();
        rawData = rawData.filter(user => {
          if (!user.created_at) return false;
          const date = new Date(user.created_at);
          return (
            date.getMonth() + 1 === selectedMonth &&
            date.getFullYear() === selectedYear
          );
        });
        data = rawData.map(user => ({
          'Nombre': user.full_name || '',
          'Documento': user.document_number || '',
          'Email': user.email || '',
          'Rol': user.role || '',
          'Estado': user.active ? 'Activo' : 'Inactivo',
        }));
      }
      setReportData(data);
    } catch (err) {
      message.error('Error al obtener el reporte');
    }
    setReportLoading(false);
  };

  const handleExportExcel = () => {
    if (!reportData.length) return;
    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    XLSX.writeFile(wb, `reporte_${reportType}_${Date.now()}.xlsx`);
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Reportes y Paz y Salvo</h1>
      {/* Sección Paz y Salvo */}
      <div className="bg-white p-10 rounded shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">Certificado de Paz y Salvo</h2>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Número de documento"
            value={docNumber}
            onChange={e => setDocNumber(e.target.value)}
            style={{ maxWidth: 200 }}
          />
          <Button type="primary" loading={loading} onClick={handleCheckClearance}>
            Consultar
          </Button>
        </div>
        <Modal
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          title="Resultado Paz y Salvo"
        >
          {userStatus && userInfo && (
            <div>
              <p><strong>Usuario:</strong> {userInfo.full_name || userInfo.email}</p>
              <p><strong>Documento:</strong> {userInfo.document_number}</p>
              <p><strong>Estado:</strong> {userStatus.isInGoodStanding && userStatus.activeLoansCount === 0 ? (
                <span className="text-green-600 font-semibold">A Paz y Salvo</span>
              ) : (
                <span className="text-red-600 font-semibold">Con Deudas o Préstamos Activos</span>
              )}</p>
              <p><strong>Préstamos activos:</strong> {userStatus.activeLoansCount}</p>
              {userStatus.isInGoodStanding && userStatus.activeLoansCount === 0 && (
                <Button type="primary" className="mt-4" onClick={handleGeneratePDF}>
                  Descargar Certificado PDF
                </Button>
              )}
            </div>
          )}
        </Modal>
      </div>

      {/* Sección Reportes Generales */}
      <div className="bg-white p-10 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Reportes de la Biblioteca</h2>
        <div className="flex gap-2 mb-4">
          <select
            value={reportType}
            onChange={e => setReportType(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="loans">Préstamos del mes</option>
            <option value="books">Listado de libros</option>
            <option value="users">Listado de usuarios</option>
          </select>
          {/* Selectores de mes y año para todos los reportes */}
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {[
              'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
              'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ].map((m, idx) => (
              <option key={idx + 1} value={idx + 1}>{m}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <Button onClick={handleFetchReport} loading={reportLoading}>
            Consultar
          </Button>
          <Button onClick={handleExportExcel} disabled={!reportData.length}>
            Exportar a Excel
          </Button>
        </div>
        {/* Tabla simple de resultados */}
        {reportData.length > 0 && (
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full text-xs border">
              <thead>
                <tr>
                  {Object.keys(reportData[0]).map(key => (
                    <th key={key} className="border px-2 py-1 bg-gray-100">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="border px-2 py-1">{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage; 