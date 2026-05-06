function formatearMoneda(monto) {
    if (monto === null || monto === undefined) return 'S/ 0.00';
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2
    }).format(monto);
}

module.exports = formatearMoneda;