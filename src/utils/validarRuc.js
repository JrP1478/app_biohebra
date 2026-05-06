function validarRUC(ruc) {
    if (!ruc) return true; // Opcional
    
    // Eliminar espacios
    ruc = ruc.trim();
    
    // Debe tener 11 dígitos
    if (!/^\d{11}$/.test(ruc)) {
        return false;
    }
    
    // Primeros dígitos deben ser 10, 15, 16, 17, 20
    const tipo = parseInt(ruc.substring(0, 2));
    const tiposValidos = [10, 15, 16, 17, 20];
    if (!tiposValidos.includes(tipo)) {
        return false;
    }
    
    // Algoritmo de validación (módulo 11)
    const factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    const suma = ruc.substring(0, 10).split('').reduce((acc, dig, i) => {
        return acc + parseInt(dig) * factores[i];
    }, 0);
    
    const resto = suma % 11;
    const digitoVerificador = resto === 0 ? 0 : 11 - resto;
    
    return digitoVerificador === parseInt(ruc.charAt(10));
}

module.exports = validarRUC;