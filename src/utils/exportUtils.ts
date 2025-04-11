
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
    
    // Generate Excel file with newer security-enhanced method
    XLSX.writeFile(workbook, `${filename}.xlsx`, { bookType: 'xlsx', bookSST: false, type: 'binary' });
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

// New function to print data directly
export const printData = (
  data: ExportableData[],
  title: string,
  date?: Date
) => {
  try {
    // Create a temporary div to hold the printable content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Unable to open print window. Please check your popup blocker settings.');
    }

    const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
    
    // Calculate totals
    const totalCylinders = data.reduce((sum, row) => sum + row.cylinders, 0);
    const totalKms = data.reduce((sum, row) => sum + row.kms, 0);
    const totalFuelCost = data.reduce((sum, row) => sum + row.fuelCost, 0);

    // Generate HTML content for printing
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { font-size: 24px; margin-bottom: 10px; }
            .date { margin-bottom: 20px; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total-row { font-weight: bold; background-color: #f9f9f9; }
            @media print {
              button { display: none; }
              body { margin: 0; padding: 15px; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${date ? `<div class="date">Date: ${formattedDate}</div>` : ''}
          <table>
            <thead>
              <tr>
                <th>Site Name</th>
                <th>Cylinders</th>
                <th>Distance (km)</th>
                <th>Fuel Cost</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  <td>${row.siteName}</td>
                  <td>${row.cylinders}</td>
                  <td>${row.kms.toFixed(1)}</td>
                  <td>R${row.fuelCost.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td>TOTALS</td>
                <td>${totalCylinders}</td>
                <td>${totalKms.toFixed(1)}</td>
                <td>R${totalFuelCost.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div style="margin-top: 20px;">
            <button onclick="window.print();return false;">Print Report</button>
            <button onclick="window.close();">Close</button>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
  } catch (error) {
    console.error('Error creating print view:', error);
    throw new Error('Failed to print data');
  }
};

// New function to open email client with report data
export const emailData = (
  data: ExportableData[],
  title: string,
  emailSubject: string,
  date?: Date
) => {
  try {
    // Format date if provided
    const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
    
    // Calculate totals
    const totalCylinders = data.reduce((sum, row) => sum + row.cylinders, 0);
    const totalKms = data.reduce((sum, row) => sum + row.kms, 0);
    const totalFuelCost = data.reduce((sum, row) => sum + row.fuelCost, 0);
    
    // Create email body with table in plain text format
    let emailBody = `${title}\n\n`;
    if (date) {
      emailBody += `Date: ${formattedDate}\n\n`;
    }
    
    // Add table header
    emailBody += `Site Name\tCylinders\tDistance (km)\tFuel Cost\n`;
    
    // Add data rows
    data.forEach(row => {
      emailBody += `${row.siteName}\t${row.cylinders}\t${row.kms.toFixed(1)}\tR${row.fuelCost.toFixed(2)}\n`;
    });
    
    // Add totals row
    emailBody += `\nTOTALS\t${totalCylinders}\t${totalKms.toFixed(1)}\tR${totalFuelCost.toFixed(2)}`;
    
    // Encode email subject and body for mailto URL
    const subject = encodeURIComponent(emailSubject);
    const body = encodeURIComponent(emailBody);
    
    // Create mailto link
    const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
    
    // Open default email client
    window.location.href = mailtoLink;
    
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to open email client');
  }
};
