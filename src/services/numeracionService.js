const db = require('../config/database');

async function generarNumero() {
    const year = new Date().getFullYear();
    
    // Buscar la última proforma del año actual
    const ultima = await db('proforma')
        .where('numero', 'like', `P-${year}-%`)
        .orderBy('id', 'desc')
        .first();

    let correlativo = 1;
    
    if (ultima) {
        // Extraer número del formato P-2026-0001
        const partes = ultima.numero.split('-');
        if (partes.length === 3) {
            correlativo = parseInt(partes[2]) + 1;
        }
    }

    // Formato: P-2026-0001 (4 dígitos con ceros a la izquierda)
    const numeroFormateado = `P-${year}-${String(correlativo).padStart(4, '0')}`;
    
    return numeroFormateado;
}

module.exports = {
    generarNumero
};