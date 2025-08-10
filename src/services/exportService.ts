import { PrizeStats, PrizeDistribution, TimeStats } from './prizeStatsService';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toPng } from 'html-to-image';

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  includeCharts?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

class ExportService {
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private async generateCSV(data: any[], headers: string[]): Promise<string> {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');

    return csvContent;
  }

  private async generateExcel(data: any[][], sheetName: string): Promise<Uint8Array> {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  }

  private async captureChart(chartId: string): Promise<string> {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) return '';
    
    try {
      const dataUrl = await toPng(chartElement);
      return dataUrl;
    } catch (error) {
      console.error('Error al capturar el gráfico:', error);
      return '';
    }
  }

  private downloadFile(content: string | Uint8Array, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  async exportDistribution(distribution: PrizeDistribution[], options: ExportOptions): Promise<void> {
    const headers = ['name', 'count', 'claimed', 'pending', 'percentage'];
    const filename = `premios-distribucion-${this.formatDate(new Date())}`;

    switch (options.format) {
      case 'csv': {
        const csv = await this.generateCSV(distribution, headers);
        this.downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
        break;
      }
      case 'excel': {
        const data = [
          headers,
          ...distribution.map(item => [
            item.name,
            item.count,
            item.claimed,
            item.pending,
            `${item.percentage}%`
          ])
        ];
        const excelBuffer = await this.generateExcel(data, 'Distribución');
        this.downloadFile(excelBuffer, `${filename}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        break;
      }
      case 'pdf': {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Distribución de Premios', 14, 20);

        if (options.includeCharts) {
          const chartImage = await this.captureChart('distribution-chart');
          if (chartImage) {
            doc.addImage(chartImage, 'PNG', 14, 30, 180, 100);
          }
        }

        (doc as any).autoTable({
          head: [headers.map(h => h.charAt(0).toUpperCase() + h.slice(1))],
          body: distribution.map(item => [
            item.name,
            item.count,
            item.claimed,
            item.pending,
            `${item.percentage}%`
          ]),
          startY: options.includeCharts ? 140 : 30,
          theme: 'grid',
          styles: { fontSize: 10 },
          headStyles: { fillColor: [41, 128, 185] }
        });

        doc.save(`${filename}.pdf`);
        break;
      }
    }
  }

  async exportTimeStats(timeStats: TimeStats[], options: ExportOptions): Promise<void> {
    const headers = ['date', 'total', 'claimed', 'claimRate'];
    const filename = `premios-evolucion-${this.formatDate(new Date())}`;

    switch (options.format) {
      case 'csv': {
        const csv = await this.generateCSV(timeStats, headers);
        this.downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
        break;
      }
      case 'excel': {
        const data = [
          headers,
          ...timeStats.map(stat => [
            new Date(stat.date).toLocaleDateString(),
            stat.total,
            stat.claimed,
            `${Math.round((stat.claimed / stat.total) * 100)}%`
          ])
        ];
        const excelBuffer = await this.generateExcel(data, 'Evolución');
        this.downloadFile(excelBuffer, `${filename}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        break;
      }
      case 'pdf': {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Evolución de Premios', 14, 20);

        if (options.includeCharts) {
          const chartImage = await this.captureChart('evolution-chart');
          if (chartImage) {
            doc.addImage(chartImage, 'PNG', 14, 30, 180, 100);
          }
        }

        (doc as any).autoTable({
          head: [headers.map(h => h.charAt(0).toUpperCase() + h.slice(1))],
          body: timeStats.map(stat => [
            new Date(stat.date).toLocaleDateString(),
            stat.total,
            stat.claimed,
            `${Math.round((stat.claimed / stat.total) * 100)}%`
          ]),
          startY: options.includeCharts ? 140 : 30,
          theme: 'grid',
          styles: { fontSize: 10 },
          headStyles: { fillColor: [41, 128, 185] }
        });

        doc.save(`${filename}.pdf`);
        break;
      }
    }
  }

  async exportFullReport(
    stats: PrizeStats,
    distribution: PrizeDistribution[],
    timeStats: TimeStats[],
    options: ExportOptions
  ): Promise<void> {
    const filename = `reporte-completo-${this.formatDate(new Date())}`;
    
    switch (options.format) {
      case 'csv': {
        const sections = [
          '# Estadísticas Generales',
          `Total de Premios,${stats.totalPrizes}`,
          `Premios Canjeados,${stats.claimedPrizes}`,
          `Premios Pendientes,${stats.pendingPrizes}`,
          `Premios Vencidos,${stats.expiredPrizes}`,
          '',
          '# Distribución de Premios',
          await this.generateCSV(distribution, ['name', 'count', 'claimed', 'pending', 'percentage']),
          '',
          '# Evolución Temporal',
          await this.generateCSV(timeStats, ['date', 'total', 'claimed'])
        ].join('\n');

        this.downloadFile(sections, `${filename}.csv`, 'text/csv;charset=utf-8;');
        break;
      }
      case 'excel': {
        const wb = XLSX.utils.book_new();

        // Hoja de Estadísticas Generales
        const generalStats = [
          ['Estadísticas Generales', ''],
          ['Total de Premios', stats.totalPrizes],
          ['Premios Canjeados', stats.claimedPrizes],
          ['Premios Pendientes', stats.pendingPrizes],
          ['Premios Vencidos', stats.expiredPrizes]
        ];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(generalStats), 'General');

        // Hoja de Distribución
        const distributionData = [
          ['Premio', 'Total', 'Canjeados', 'Pendientes', 'Porcentaje'],
          ...distribution.map(item => [
            item.name,
            item.count,
            item.claimed,
            item.pending,
            `${item.percentage}%`
          ])
        ];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(distributionData), 'Distribución');

        // Hoja de Evolución
        const evolutionData = [
          ['Fecha', 'Total', 'Canjeados', 'Tasa de Canje'],
          ...timeStats.map(stat => [
            new Date(stat.date).toLocaleDateString(),
            stat.total,
            stat.claimed,
            `${Math.round((stat.claimed / stat.total) * 100)}%`
          ])
        ];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(evolutionData), 'Evolución');

        const excelBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
        this.downloadFile(excelBuffer, `${filename}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        break;
      }
      case 'pdf': {
        const doc = new jsPDF();
        let currentY = 20;

        // Título
        doc.setFontSize(20);
        doc.text('Reporte de Premios', 14, currentY);
        currentY += 20;

        // Estadísticas Generales
        doc.setFontSize(16);
        doc.text('Estadísticas Generales', 14, currentY);
        currentY += 10;

        // doc.autoTable({
        //   body: [
        //     ['Total de Premios', stats.totalPrizes],
        //     ['Premios Canjeados', stats.claimedPrizes],
        //     ['Premios Pendientes', stats.pendingPrizes],
        //     ['Premios Vencidos', stats.expiredPrizes]
        //   ],
        //   startY: currentY,
        //   theme: 'plain',
        //   styles: { fontSize: 12 }
        // });
        // currentY = (doc as any).lastAutoTable.finalY + 20;
        currentY += 50;

        // Gráficos
        if (options.includeCharts) {
          const distributionChart = await this.captureChart('distribution-chart');
          if (distributionChart) {
            doc.addImage(distributionChart, 'PNG', 14, currentY, 180, 100);
            currentY += 110;
          }

          const evolutionChart = await this.captureChart('evolution-chart');
          if (evolutionChart) {
            doc.addImage(evolutionChart, 'PNG', 14, currentY, 180, 100);
            currentY += 110;
          }
        }

        // Distribución de Premios
        doc.addPage();
        currentY = 20;
        doc.setFontSize(16);
        doc.text('Distribución de Premios', 14, currentY);
        currentY += 10;

        // doc.autoTable({
        //   head: [['Premio', 'Total', 'Canjeados', 'Pendientes', 'Porcentaje']],
        //   body: distribution.map(item => [
        //     item.name,
        //     item.count,
        //     item.claimed,
        //     item.pending,
        //     `${item.percentage}%`
        //   ]),
        //   startY: currentY,
        //   theme: 'grid',
        //   styles: { fontSize: 10 },
        //   headStyles: { fillColor: [41, 128, 185] }
        // });

        // Evolución Temporal
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Evolución Temporal', 14, 20);

        // doc.autoTable({
        //   head: [['Fecha', 'Total', 'Canjeados', 'Tasa de Canje']],
        //   body: timeStats.map(stat => [
        //     new Date(stat.date).toLocaleDateString(),
        //     stat.total,
        //     stat.claimed,
        //     `${Math.round((stat.claimed / stat.total) * 100)}%`
        //   ]),
        //   startY: 30,
        //   theme: 'grid',
        //   styles: { fontSize: 10 },
        //   headStyles: { fillColor: [41, 128, 185] }
        // });

        doc.save(`${filename}.pdf`);
        break;
      }
    }
  }
}

export const exportService = new ExportService(); 