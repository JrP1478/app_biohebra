function validarDNI(dni) {
    if (!dni) return true; // Opcional
    
    dni = dni.trim();
    
    // DNI peruano: 8 dígitos numéricos
    if (!/^\d{8}$/.test(dni)) {
        return false;
    }
    
    return true;
}

module.exports = validarDNI;