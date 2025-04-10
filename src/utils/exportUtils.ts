
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

// Extend jsPDF with autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ExportableData {
  siteName: string;
  cylinders: number;
  kms: number;
  fuelCost: number;
  [key: string]: any;
}

export const exportToExcel = (data: ExportableData[], filename: string) => {
  try {
    // Format data for Excel
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Deliveries');
    
    // Add totals row
    const totalCylinders = data.reduce((sum, row) => sum + row.cylinders, 0);
    const totalKms = data.reduce((sum, row) => sum + row.kms, 0);
    const totalFuelCost = data.reduce((sum, row) => sum + row.fuelCost, 0);
    
    XLSX.utils.sheet_add_json(worksheet, [
      { siteName: 'TOTALS', cylinders: totalCylinders, kms: totalKms, fuelCost: totalFuelCost }
    ], { skipHeader: true, origin: -1 });
    
    // Generate Excel file
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export data to Excel');
  }
};

export const exportToPDF = (
  data: ExportableData[], 
  filename: string, 
  title: string, 
  date?: Date
) => {
  try {
    // Create PDF document
    const doc = new jsPDF();
    
    // Add title
    const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    
    if (date) {
      doc.setFontSize(12);
      doc.text(`Date: ${formattedDate}`, 14, 25);
    }
    
    // Calculate totals
    const totalCylinders = data.reduce((sum, row) => sum + row.cylinders, 0);
    const totalKms = data.reduce((sum, row) => sum + row.kms, 0);
    const totalFuelCost = data.reduce((sum, row) => sum + row.fuelCost, 0);
    
    // Prepare table data
    const tableData = data.map(row => [
      row.siteName,
      row.cylinders.toString(),
      row.kms.toFixed(1),
      `R${row.fuelCost.toFixed(2)}`
    ]);
    
    // Add totals row
    tableData.push([
      'TOTALS',
      totalCylinders.toString(),
      totalKms.toFixed(1),
      `R${totalFuelCost.toFixed(2)}`
    ]);
    
    // Add table to PDF
    doc.autoTable({
      head: [['Site Name', 'Cylinders', 'Distance (km)', 'Fuel Cost']],
      body: tableData,
      startY: date ? 30 : 20,
      theme: 'striped',
      headStyles: { fillColor: [0, 0, 0] },
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
    });
    
    // Save the PDF
    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export data to PDF');
  }
};
