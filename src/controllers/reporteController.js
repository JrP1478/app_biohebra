const Proforma = require('../models/Proforma');
const Empresa = require('../models/Empresa');
const { generarPDF } = require('../services/pdfService');
const path = require('path');
const fs = require('fs');

exports.descargarPDF = async (req, res) => {
    try {
        const proforma = await Proforma.getById(req.params.id);
        if (!proforma) {
            return res.status(404).render('error', {
                titulo: 'No encontrado',
                mensaje: 'La proforma no existe',
                codigo: 404
            });
        }

        const empresa = await Empresa.get();

        // Preparar logo: convertir a base64 si existe, si no usar iniciales
        let logoHtml = '';
        if (empresa?.logo) {
            const logoPath = path.join(process.cwd(), 'src/public', empresa.logo.replace('/uploads/', 'uploads/'));
            try {
                if (fs.existsSync(logoPath)) {
                    const logoExt = path.extname(logoPath).toLowerCase();
                    const mimeType = logoExt === '.png' ? 'image/png' : 
                                     logoExt === '.jpg' || logoExt === '.jpeg' ? 'image/jpeg' : 
                                     logoExt === '.gif' ? 'image/gif' : 'image/png';
                    const logoBase64 = fs.readFileSync(logoPath).toString('base64');
                    logoHtml = `<img src="data:${mimeType};base64,${logoBase64}" alt="Logo" style="max-width: 90px; max-height: 90px; object-fit: contain;">`;
                }
            } catch (e) {
                console.log('Error cargando logo:', e.message);
            }
        }

        // Si no hay logo, usar iniciales
        const logoFallback = logoHtml || `
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #1a8c4a 0%, #7ed321 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-family: 'Montserrat', sans-serif; font-size: 36px; font-weight: 800; color: white; box-shadow: 0 4px 15px rgba(26, 140, 74, 0.3);">
                ${(empresa?.nombre || 'B').charAt(0).toUpperCase()}
            </div>
        `;

        const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Proforma ${proforma.numero}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Open+Sans:wght@400;600&display=swap');
                
                * { margin: 0; padding: 0; box-sizing: border-box; }
                
                body { 
                    font-family: 'Open Sans', sans-serif;
                    font-size: 10px; 
                    line-height: 1.5; 
                    color: #2d3748;
                    background: white;
                }
                
                /* ===== PALETA BIOHEBRA ===== */
                :root {
                    --verde-principal: #1a8c4a;
                    --verde-oscuro: #0d5c2e;
                    --verde-claro: #7ed321;
                    --gris-claro: #f7fafc;
                    --borde: #e2e8f0;
                }
                
                /* ===== HEADER ===== */
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 4px solid var(--verde-principal);
                }
                
                .brand-section {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                
                .brand-text h1 {
                    font-family: 'Montserrat', sans-serif;
                    font-size: 28px;
                    font-weight: 800;
                    color: var(--verde-oscuro);
                    letter-spacing: -0.5px;
                    margin-bottom: 4px;
                }
                
                .brand-text .slogan {
                    font-size: 9px;
                    color: var(--verde-principal);
                    text-transform: uppercase;
                    letter-spacing: 3px;
                    font-weight: 600;
                }
                
                .doc-badge {
                    text-align: right;
                }
                
                .doc-badge .label {
                    display: inline-block;
                    background: linear-gradient(135deg, var(--verde-principal) 0%, var(--verde-oscuro) 100%);
                    color: white;
                    padding: 8px 24px;
                    border-radius: 8px 8px 0 0;
                    font-family: 'Montserrat', sans-serif;
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }
                
                .doc-badge .number {
                    background: var(--gris-claro);
                    border: 2px solid var(--verde-principal);
                    border-top: none;
                    padding: 10px 24px;
                    border-radius: 0 0 8px 8px;
                    font-family: 'Montserrat', sans-serif;
                    font-size: 20px;
                    font-weight: 800;
                    color: var(--verde-oscuro);
                }
                
                /* ===== INFO CARDS ===== */
                .info-grid {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 30px;
                }
                
                .info-card {
                    flex: 1;
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    border: 1px solid var(--borde);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                }
                
                .info-card.empresa {
                    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                    border: 1px solid #86efac;
                }
                
                .info-title {
                    font-family: 'Montserrat', sans-serif;
                    font-size: 9px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    color: var(--verde-principal);
                    margin-bottom: 12px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .info-title::before {
                    content: '';
                    display: inline-block;
                    width: 4px;
                    height: 16px;
                    background: var(--verde-claro);
                    border-radius: 2px;
                }
                
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 6px 0;
                    border-bottom: 1px dotted var(--borde);
                }
                
                .info-row:last-child { border-bottom: none; }
                
                .info-label {
                    font-size: 9px;
                    color: #718096;
                    font-weight: 500;
                }
                
                .info-value {
                    font-size: 9.5px;
                    color: #2d3748;
                    font-weight: 600;
                    text-align: right;
                }
                
                .cliente-name {
                    font-family: 'Montserrat', sans-serif;
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--verde-oscuro);
                    margin-bottom: 10px;
                    padding-bottom: 8px;
                    border-bottom: 2px solid var(--verde-claro);
                }
                
                /* ===== TABLE ===== */
                .table-section { margin-bottom: 25px; }
                
                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 15px;
                }
                
                .section-header h3 {
                    font-family: 'Montserrat', sans-serif;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: var(--verde-oscuro);
                }
                
                .section-line {
                    flex: 1;
                    height: 2px;
                    background: linear-gradient(90deg, var(--verde-claro) 0%, transparent 100%);
                    border-radius: 1px;
                }
                
                table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                }
                
                thead th {
                    background: linear-gradient(135deg, var(--verde-principal) 0%, var(--verde-oscuro) 100%);
                    color: white;
                    padding: 14px 12px;
                    text-align: left;
                    font-family: 'Montserrat', sans-serif;
                    font-size: 9px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                thead th:first-child {
                    border-radius: 10px 0 0 0;
                    width: 6%;
                    text-align: center;
                }
                
                thead th:last-child {
                    border-radius: 0 10px 0 0;
                    width: 18%;
                    text-align: right;
                }
                
                thead th:nth-child(3), thead th:nth-child(4) { text-align: right; }
                
                tbody td {
                    padding: 12px;
                    border-bottom: 1px solid #edf2f7;
                    font-size: 10px;
                    vertical-align: middle;
                }
                
                tbody tr:nth-child(even) { background: #f7fafc; }
                tbody tr:hover { background: #f0fdf4; }
                
                tbody tr:last-child td { border-bottom: 3px solid var(--verde-principal); }
                tbody tr:last-child td:first-child { border-radius: 0 0 0 10px; }
                tbody tr:last-child td:last-child { border-radius: 0 0 10px 0; }
                
                .col-num { text-align: center; }
                .col-desc { width: 46%; }
                .col-cant, .col-precio, .col-total { text-align: right; }
                
                .item-circle {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 26px;
                    height: 26px;
                    background: linear-gradient(135deg, var(--verde-claro) 0%, var(--verde-principal) 100%);
                    color: white;
                    border-radius: 50%;
                    font-family: 'Montserrat', sans-serif;
                    font-weight: 700;
                    font-size: 10px;
                }
                
                .item-desc { font-weight: 600; color: #2d3748; }
                .item-cant { font-weight: 700; color: var(--verde-principal); font-size: 11px; }
                .item-precio { color: #718096; }
                .item-total {
                    font-family: 'Montserrat', sans-serif;
                    font-weight: 700;
                    color: var(--verde-oscuro);
                    font-size: 11px;
                }
                
                /* ===== TOTALES ===== */
                .totals-section {
                    display: flex;
                    justify-content: flex-end;
                    margin-bottom: 25px;
                }
                
                .totals-card {
                    width: 300px;
                    background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
                    border-radius: 16px;
                    padding: 24px;
                    border: 2px solid #86efac;
                    box-shadow: 0 10px 25px -5px rgba(26, 140, 74, 0.1);
                }
                
                .totals-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 0;
                }
                
                .totals-row.subtotal { font-size: 11px; color: #718096; }
                
                .totals-row.igv {
                    font-size: 11px;
                    color: #718096;
                    border-bottom: 1px dashed #a0aec0;
                    padding-bottom: 12px;
                    margin-bottom: 4px;
                }
                
                .totals-row.total {
                    font-family: 'Montserrat', sans-serif;
                    font-size: 16px;
                    font-weight: 800;
                    color: var(--verde-oscuro);
                    padding-top: 10px;
                }
                
                .totals-row.total .amount { font-size: 20px; color: var(--verde-principal); }
                
                .amount {
                    font-family: 'Montserrat', sans-serif;
                    font-weight: 700;
                }
                
                /* ===== OBSERVACIONES ===== */
                .obs-section {
                    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
                    border-left: 5px solid #f59e0b;
                    border-radius: 0 12px 12px 0;
                    padding: 16px 20px;
                    margin-bottom: 25px;
                }
                
                .obs-title {
                    font-family: 'Montserrat', sans-serif;
                    font-size: 9px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: #92400e;
                    margin-bottom: 6px;
                }
                
                .obs-text { font-size: 10px; color: #78350f; line-height: 1.6; }
                
                /* ===== FOOTER ===== */
                .footer {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 3px solid var(--verde-principal);
                    text-align: center;
                }
                
                .footer-brand {
                    font-family: 'Montserrat', sans-serif;
                    font-size: 12px;
                    font-weight: 800;
                    color: var(--verde-oscuro);
                    margin-bottom: 6px;
                    letter-spacing: 1px;
                }
                
                .footer-info {
                    font-size: 9px;
                    color: #718096;
                    margin-bottom: 12px;
                }
                
                .footer-web {
                    display: inline-block;
                    background: linear-gradient(135deg, var(--verde-principal) 0%, var(--verde-oscuro) 100%);
                    color: white;
                    padding: 8px 20px;
                    border-radius: 20px;
                    font-family: 'Montserrat', sans-serif;
                    font-size: 9px;
                    font-weight: 600;
                }
                
                .footer-legal {
                    margin-top: 15px;
                    font-size: 8px;
                    color: #a0aec0;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    line-height: 1.8;
                }
                
                /* ===== ESTADO ===== */
                .estado-container {
                    display: flex;
                    justify-content: flex-end;
                    margin-bottom: 15px;
                }
                
                .estado-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 18px;
                    border-radius: 20px;
                    font-family: 'Montserrat', sans-serif;
                    font-size: 9px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .estado-EMITIDA { background: #dbeafe; color: #1e40af; }
                .estado-ENVIADA { background: #fef3c7; color: #92400e; }
                .estado-ACEPTADA { background: #d1fae5; color: #065f46; }
                .estado-RECHAZADA { background: #fee2e2; color: #991b1b; }
                .estado-ANULADA { background: #f3f4f6; color: #4b5563; }
                
                .estado-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: currentColor;
                    box-shadow: 0 0 0 3px rgba(255,255,255,0.5);
                }
            </style>
        </head>
        <body>
            <div class="document">
                <!-- Estado -->
                <div class="estado-container">
                    <span class="estado-badge estado-${proforma.estado}">
                        <span class="estado-dot"></span>
                        ${proforma.estado}
                    </span>
                </div>
                
                <!-- Header -->
                <div class="header">
                    <div class="brand-section">
                        ${logoFallback}
                        <div class="brand-text">
                            <h1>${empresa?.nombre || 'BIOHEBRA'}</h1>
                            <div class="slogan">Calidad nacida del cambio</div>
                        </div>
                    </div>
                    <div class="doc-badge">
                        <div class="label">Proforma</div>
                        <div class="number">${proforma.numero}</div>
                    </div>
                </div>

                <!-- Info Grid -->
                <div class="info-grid">
                    <div class="info-card empresa">
                        <div class="info-title">Datos de la Empresa</div>
                        ${empresa?.ruc ? `
                        <div class="info-row">
                            <span class="info-label">RUC</span>
                            <span class="info-value">${empresa.ruc}</span>
                        </div>` : ''}
                        ${empresa?.direccion ? `
                        <div class="info-row">
                            <span class="info-label">Dirección</span>
                            <span class="info-value">${empresa.direccion}</span>
                        </div>` : ''}
                        ${empresa?.telefono ? `
                        <div class="info-row">
                            <span class="info-label">Teléfono</span>
                            <span class="info-value">${empresa.telefono}</span>
                        </div>` : ''}
                        ${empresa?.web ? `
                        <div class="info-row">
                            <span class="info-label">Web</span>
                            <span class="info-value">${empresa.web}</span>
                        </div>` : ''}
                    </div>
                    
                    <div class="info-card">
                        <div class="info-title">Datos del Cliente</div>
                        <div class="cliente-name">${proforma.cliente_nombre}</div>
                        ${proforma.cliente_documento ? `
                        <div class="info-row">
                            <span class="info-label">${proforma.cliente_documento_label || 'Documento'}</span>
                            <span class="info-value">${proforma.cliente_documento}</span>
                        </div>` : ''}
                        ${proforma.cliente_direccion ? `
                        <div class="info-row">
                            <span class="info-label">Dirección</span>
                            <span class="info-value">${proforma.cliente_direccion}</span>
                        </div>` : ''}
                        ${proforma.cliente_telefono ? `
                        <div class="info-row">
                            <span class="info-label">Teléfono</span>
                            <span class="info-value">${proforma.cliente_telefono}</span>
                        </div>` : ''}
                    </div>
                </div>

                <!-- Tabla -->
                <div class="table-section">
                    <div class="section-header">
                        <h3>Detalle de Productos</h3>
                        <div class="section-line"></div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>N°</th>
                                <th>Descripción</th>
                                <th>Cantidad</th>
                                <th>Precio Unit.</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${proforma.detalles.map((d, i) => `
                            <tr>
                                <td class="col-num"><span class="item-circle">${i + 1}</span></td>
                                <td class="col-desc"><span class="item-desc">${d.descripcion}</span></td>
                                <td class="col-cant"><span class="item-cant">${d.cantidad}</span></td>
                                <td class="col-precio"><span class="item-precio">S/ ${Number(d.precio_unitario).toFixed(2)}</span></td>
                                <td class="col-total"><span class="item-total">S/ ${Number(d.total).toFixed(2)}</span></td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Totales -->
                <div class="totals-section">
                    <div class="totals-card">
                        <div class="totals-row subtotal">
                            <span>Subtotal</span>
                            <span class="amount">S/ ${Number(proforma.subtotal).toFixed(2)}</span>
                        </div>
                        <div class="totals-row igv">
                            <span>IGV (18%)</span>
                            <span class="amount">S/ ${Number(proforma.igv).toFixed(2)}</span>
                        </div>
                        <div class="totals-row total">
                            <span>TOTAL</span>
                            <span class="amount">S/ ${Number(proforma.total).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <!-- Observaciones -->
                ${proforma.observaciones ? `
                <div class="obs-section">
                    <div class="obs-title">⚠️ Observaciones</div>
                    <div class="obs-text">${proforma.observaciones}</div>
                </div>
                ` : ''}

                <!-- Footer -->
                <div class="footer">
                    <div class="footer-brand">${empresa?.nombre || 'BIOHEBRA'}</div>
                    <div class="footer-info">
                        ${empresa?.direccion ? `${empresa.direccion} · ` : ''}
                        ${empresa?.telefono ? `Tel: ${empresa.telefono}` : ''}
                    </div>
                    ${empresa?.web ? `
                    <div class="footer-web">🌐 ${empresa.web}</div>
                    ` : ''}
                    <div class="footer-legal">
                        Documento generado electrónicamente · No tiene valor fiscal<br>
                        Válido por 15 días calendario desde la fecha de emisión
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;

        const pdfBuffer = await generarPDF(html);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Proforma-${proforma.numero}.pdf"`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'No se pudo generar el PDF: ' + error.message,
            codigo: 500
        });
    }
};

module.exports = exports;