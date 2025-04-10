
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
    // Create PDF document with explicit unit
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
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
    const tableColumns = ['Site Name', 'Cylinders', 'Distance (km)', 'Fuel Cost'];
    const tableRows = data.map(row => [
      row.siteName,
      row.cylinders.toString(),
      row.kms.toFixed(1),
      `R${row.fuelCost.toFixed(2)}`
    ]);
    
    // Add totals row
    tableRows.push([
      'TOTALS',
      totalCylinders.toString(),
      totalKms.toFixed(1),
      `R${totalFuelCost.toFixed(2)}`
    ]);
    
    // Define an autoTable function with explicit typing
    try {
      // @ts-ignore - Using ts-ignore here because we know autoTable exists on jsPDF
      doc.autoTable({
        head: [tableColumns],
        body: tableRows,
        startY: date ? 30 : 20,
        theme: 'striped',
        headStyles: { fillColor: [0, 0, 0] },
        footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
      });
      
      // Save the PDF
      doc.save(`${filename}.pdf`);
    } catch (tableError) {
      console.error('Error adding table to PDF:', tableError);
      
      // Alternative approach if autotable fails
      if (!doc.autoTable) {
        console.log('AutoTable not available, using basic text output');
        let y = date ? 40 : 30;
        const lineHeight = 8;
        
        // Draw header manually
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        tableColumns.forEach((col, index) => {
          doc.text(col, 14 + (index * 40), y);
        });
        
        // Draw rows manually
        doc.setFont('helvetica', 'normal');
        tableRows.forEach(row => {
          y += lineHeight;
          row.forEach((cell, index) => {
            doc.text(cell, 14 + (index * 40), y);
          });
        });
        
        // Save the PDF
        doc.save(`${filename}.pdf`);
      } else {
        throw tableError;
      }
    }
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export data to PDF');
  }
};
