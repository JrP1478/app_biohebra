const IGV_PORCENTAJE = parseFloat(process.env.IGV_PORCENTAJE) || 0.18;

function round2(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
}

function calcularLinea(cantidad, precioUnitario) {
    const total = cantidad * precioUnitario;
    return {
        cantidad: round2(cantidad),
        precio_unitario: round2(precioUnitario),
        total: round2(total)
    };
}

function calcularProforma(detalles) {
    // detalles: array de { cantidad, precio_unitario }
    const subtotal = detalles.reduce((sum, d) => {
        const linea = calcularLinea(d.cantidad, d.precio_unitario);
        return sum + linea.total;
    }, 0);

    const igv = subtotal * IGV_PORCENTAJE;
    const total = subtotal + igv;

    return {
        subtotal: round2(subtotal),
        igv: round2(igv),
        total: round2(total),
        igv_porcentaje: IGV_PORCENTAJE
    };
}

function formatearMoneda(monto) {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2
    }).format(monto);
}

module.exports = {
    IGV_PORCENTAJE,
    calcularLinea,
    calcularProforma,
    formatearMoneda,
    round2
};