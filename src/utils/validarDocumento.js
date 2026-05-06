const validarRUC = require('./validarRuc');
const validarDNI = require('./validarDni');

function validarDocumento(documento, tipo) {
    if (!documento) return true; // Opcional
    
    documento = documento.trim();
    
    if (tipo === 'RUC') {
        return validarRUC(documento);
    } else if (tipo === 'DNI') {
        return validarDNI(documento);
    }
    
    // Si no se especifica tipo, detectar automáticamente
    if (documento.length === 8) {
        return validarDNI(documento);
    } else if (documento.length === 11) {
        return validarRUC(documento);
    }
    
    return false;
}

module.exports = { validarDocumento, validarRUC, validarDNI };