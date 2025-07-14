import PDFDocument from 'pdfkit';
import { AsignaturaEntity } from '../../domain/entities/docente.entity';

export class PDFService {
    static async generateAsignaturasPDF(asignaturas: AsignaturaEntity[], carreraNombre: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ 
                size: 'A4', 
                layout: 'landscape',
                margin: 20,
                info: {
                    Title: `Asignaturas - ${carreraNombre}`,
                    Author: 'Sistema EMI',
                    Subject: 'Reporte de Asignaturas',
                    Keywords: 'asignaturas, docentes, carrera',
                    CreationDate: new Date()
                }
            });
            const chunks: Buffer[] = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            try {
                // Encabezado
                doc.fontSize(20).font('Helvetica-Bold').text('ESCUELA MILITAR DE INGENIERÍA', { align: 'center' });
                doc.moveDown(1);
                
                // Título del reporte
                doc.fontSize(16).font('Helvetica-Bold').text(`ASIGNATURAS DE LA CARRERA: ${carreraNombre.toUpperCase()}`, { align: 'center' });
                doc.moveDown(0.5);
                doc.fontSize(12).font('Helvetica').text(`Total de asignaturas: ${asignaturas.length}`, { align: 'left' });
                doc.moveDown(1);

                // Configuración de la tabla
                const headers = ['Gestión', 'Periodo', 'Docentes', 'Materia', 'Semestre', 'Carga Horaria'];
                const columnWidths = [60, 80, 150, 180, 80, 80];
                const totalWidth = columnWidths.reduce((a, b) => a + b, 0);
                let y = doc.y;
                // Centrar la tabla en la página
                let x = (doc.page.width - totalWidth) / 2;

                // Función para dibujar encabezado de tabla
                const drawTableHeader = () => {
                    // Fondo del encabezado
                    doc.rect(x, y, totalWidth, 25).fill('#2c3e50');
                    doc.fillColor('white').fontSize(10).font('Helvetica-Bold');
                    
                    let colX = x;
                    headers.forEach((header, i) => {
                        doc.text(header, colX + 3, y + 8, { 
                            width: columnWidths[i] - 6, 
                            align: 'center' 
                        });
                        colX += columnWidths[i];
                    });
                    
                    doc.fillColor('black');
                    y += 25;
                };

                // Dibujar encabezado inicial
                drawTableHeader();

                // Filas de la tabla
                doc.font('Helvetica').fontSize(8);
                asignaturas.forEach((asignatura, idx) => {
                                    // Verificar si necesitamos nueva página (ajustado para landscape)
                if (y > 480) {
                    doc.addPage();
                    y = doc.y;
                    drawTableHeader();
                    doc.font('Helvetica').fontSize(8);
                }

                    // Fondo alternado para filas
                    const rowColor = idx % 2 === 0 ? '#f8f9fa' : '#ffffff';
                    doc.rect(x, y, totalWidth, 30).fill(rowColor);
                    
                    let colX = x;
                    doc.fillColor('black');
                    
                    // Gestión
                    doc.text(asignatura.gestion?.toString() || '-', colX + 3, y + 10, { 
                        width: columnWidths[0] - 6, 
                        align: 'center' 
                    });
                    colX += columnWidths[0];
                    
                    // Periodo
                    doc.text(asignatura.periodo || '-', colX + 3, y + 10, { 
                        width: columnWidths[1] - 6, 
                        align: 'center' 
                    });
                    colX += columnWidths[1];
                    
                    // Docentes Asociados
                    const docentesAsociados = asignatura.docentes_asociados || 'Sin docentes asignados';
                    doc.text(docentesAsociados, colX + 3, y + 10, { 
                        width: columnWidths[2] - 6, 
                        align: 'left' 
                    });
                    colX += columnWidths[2];
                    
                    // Materia
                    doc.text(asignatura.materia, colX + 3, y + 10, { 
                        width: columnWidths[3] - 6, 
                        align: 'left' 
                    });
                    colX += columnWidths[3];
                    
                    // Semestre
                    doc.text(asignatura.semestres || asignatura.sem?.toString() || '-', colX + 3, y + 10, { 
                        width: columnWidths[4] - 6, 
                        align: 'center' 
                    });
                    colX += columnWidths[4];
                    
                    // Carga horaria
                    doc.text(asignatura.carga_horaria?.toString() || '-', colX + 3, y + 10, { 
                        width: columnWidths[5] - 6, 
                        align: 'center' 
                    });
                    
                    y += 30;
                });

                // Pie de página
                doc.moveDown(2);
                doc.fontSize(10).font('Helvetica').text(`Generado el: ${new Date().toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}`, { align: 'right' });
                
                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }
} 