function formatearFecha(fecha, opciones = {}) {
    if (!fecha) return '-';
    const config = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        ...opciones
    };
    return new Date(fecha).toLocaleDateString('es-PE', config);
}

function formatearFechaLarga(fecha) {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-PE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

module.exports = {
    formatearFecha,
    formatearFechaLarga
};