import { useCallback } from 'react';
import jsPDF from 'jspdf';

interface PDFGeneratorOptions {
  filename?: string;
  title?: string;
  orientation?: 'portrait' | 'landscape';
  userName?: string;
  reportData?: {
    monitores?: Array<{
      nombre: string;
      username: string;
      asistencias_presentes: number;
      total_asistencias: number;
      total_horas: number;
      horas_programadas?: number;
    }>;
  };
}

export const usePDFGenerator = () => {
  const generatePDF = useCallback(async (
    elementId: string, 
    options: PDFGeneratorOptions = {}
  ) => {
    const {
      filename = 'reporte-asistencias.pdf',
      title = 'Reporte de Asistencias',
      orientation = 'portrait',
      userName = ''
    } = options;

    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Elemento no encontrado para generar PDF');
      }

      // Crear PDF
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Colores del tema
      const primaryColor = [79, 70, 229]; // Indigo
      const secondaryColor = [107, 114, 128]; // Gray
      const successColor = [34, 197, 94]; // Green
      const warningColor = [245, 158, 11]; // Yellow

      // Función para agregar línea separadora
      const addSeparator = (y: number) => {
        pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.setLineWidth(0.5);
        pdf.line(20, y, pdfWidth - 20, y);
        return y + 5;
      };

      // Función para agregar texto con estilo
      const addStyledText = (text: string, x: number, y: number, options: any = {}) => {
        const { fontSize = 12, fontStyle = 'normal', color = [0, 0, 0], align = 'left' } = options;
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', fontStyle);
        pdf.setTextColor(color[0], color[1], color[2]);
        pdf.text(text, x, y, { align });
        return y + fontSize * 0.4;
      };

      // Header con fondo de color
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.rect(0, 0, pdfWidth, 30, 'F');
      
      // Título principal
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, pdfWidth / 2, 18, { align: 'center' });

      yPosition = 40;

      // Fecha de generación
      const fechaGeneracion = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      yPosition = addStyledText(`Generado el: ${fechaGeneracion}`, pdfWidth - 20, yPosition, { 
        fontSize: 10, 
        color: [secondaryColor[0], secondaryColor[1], secondaryColor[2]], 
        align: 'right' 
      });

      yPosition = addSeparator(yPosition);

      // Función para extraer y formatear datos del reporte
      const extractReportData = (el: Element) => {
        const data: any = {
          estadisticas: {},
          asistencias: []
        };

        // Buscar estadísticas
        const statElements = element.querySelectorAll('[class*="text-xl"], [class*="text-2xl"], [class*="text-3xl"]');
        statElements.forEach(stat => {
          const text = stat.textContent?.trim();
          if (text && text.match(/^\d+$|^\d+\.\d+h$|^\d+\.\d+%$/)) {
            let label = '';
            const parent = stat.closest('[class*="bg-gradient-to-br"]') || stat.closest('[class*="bg-white"]');
            if (parent) {
              const labelEl = parent.querySelector('[class*="text-blue-100"], [class*="text-green-100"], [class*="text-purple-100"], [class*="text-yellow-100"], [class*="text-gray-600"], [class*="text-sm"]');
              if (labelEl) {
                label = labelEl.textContent?.trim() || '';
              }
            }
            
            if (label && text) {
              (data.estadisticas as any)[label] = text;
            }
          }
        });

        return data;
      };

      const reportData = extractReportData(element);
      
      // Agregar monitores si se proporcionaron en las opciones
      if (options.reportData?.monitores) {
        (reportData as any).monitores = options.reportData.monitores;
      }

      // Sección de estadísticas
      yPosition = addStyledText('ESTADÍSTICAS GENERALES', 20, yPosition, { 
        fontSize: 16, 
        fontStyle: 'bold', 
        color: [primaryColor[0], primaryColor[1], primaryColor[2]]
      });
      yPosition += 5;

      // Crear tabla de estadísticas
      const stats = Object.entries(reportData.estadisticas);
      if (stats.length > 0) {
        const colWidth = (pdfWidth - 40) / 2;
        let col = 0;
        let row = 0;

        stats.forEach(([label, value], index) => {
          const x = 20 + (col * colWidth);
          const y = yPosition + (row * 15);

          if (row % 2 === 0) {
            pdf.setFillColor(248, 250, 252);
            pdf.rect(x, y - 8, colWidth - 5, 12, 'F');
          }

          addStyledText(label, x + 5, y - 2, { fontSize: 10, color: [secondaryColor[0], secondaryColor[1], secondaryColor[2]] });
          addStyledText(String(value), x + 5, y + 3, { fontSize: 14, fontStyle: 'bold', color: [primaryColor[0], primaryColor[1], primaryColor[2]] });

          col++;
          if (col >= 2) {
            col = 0;
            row++;
          }
        });

        yPosition += (Math.ceil(stats.length / 2) * 15) + 10;
      }

      yPosition = addSeparator(yPosition);

      // Sección de información de monitores
      if (reportData.monitores && Array.isArray(reportData.monitores) && reportData.monitores.length > 0) {
        yPosition = addStyledText('INFORMACIÓN DE MONITORES', 20, yPosition, { 
          fontSize: 14, 
          fontStyle: 'bold', 
          color: [primaryColor[0], primaryColor[1], primaryColor[2]]
        });
        yPosition += 5;

        reportData.monitores.forEach((monitor: any, index: number) => {
          if (yPosition > pdfHeight - 30) {
            pdf.addPage();
            yPosition = 20;
          }

          const horasTrabajadas = typeof monitor.total_horas === 'number' ? monitor.total_horas : 0;
          const horasProgramadas = typeof monitor.horas_programadas === 'number' ? monitor.horas_programadas : 0;
          
          const horas = horasProgramadas > 0 || horasTrabajadas > 0
            ? `${horasTrabajadas.toFixed(1)}h / ${horasProgramadas.toFixed(1)}h`
            : '0.0h / 0.0h';

          yPosition = addStyledText(`${index + 1}. ${monitor.nombre} (@${monitor.username})`, 20, yPosition, { 
            fontSize: 11, 
            fontStyle: 'bold', 
            color: [primaryColor[0], primaryColor[1], primaryColor[2]]
          });
          yPosition = addStyledText(`   Asistencias: ${monitor.asistencias_presentes}/${monitor.total_asistencias} | Horas: ${horas}`, 30, yPosition, { 
            fontSize: 10, 
            color: [secondaryColor[0], secondaryColor[1], secondaryColor[2]]
          });
          yPosition += 3;
        });
      }

      // Pie de página
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        
        pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.setLineWidth(0.3);
        pdf.line(20, pdfHeight - 15, pdfWidth - 20, pdfHeight - 15);
        
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        pdf.text(`Página ${i} de ${pageCount}`, pdfWidth - 20, pdfHeight - 10, { align: 'right' });
        pdf.text('Sistema de Monitoreo de Asistencias', 20, pdfHeight - 10);
      }

      pdf.save(filename);

    } catch (error) {
      console.error('Error al generar PDF:', error);
      throw error;
    }
  }, []);

  return { generatePDF };
};

