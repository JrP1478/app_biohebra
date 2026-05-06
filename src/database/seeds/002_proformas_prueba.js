exports.seed = async function(knex) {
    // Limpiar solo si quieres datos frescos (cuidado en producción)
    await knex('proforma_detalle').del();
    await knex('proforma').del();
    await knex('cliente').del();
    await knex('producto').del();

    // Insertar clientes de prueba
    const clientes = await knex('cliente').insert([
        { nombre: 'Constructora Lima Sur S.A.C.', ruc: '20548796321', contacto: 'Juan Pérez', telefono: '01-4567890', direccion: 'Av. Javier Prado 1234, Lima', email: 'juan@constructora.com', activo: true },
        { nombre: 'Inversiones del Norte E.I.R.L.', ruc: '20123654789', contacto: 'María García', telefono: '01-7894561', direccion: 'Calle Los Pinos 567, San Isidro', email: 'maria@inversiones.com', activo: true },
        { nombre: 'Comercial Andina S.R.L.', ruc: '20654789123', contacto: 'Carlos Ruiz', telefono: '01-3216549', direccion: 'Jr. de la Unión 890, Lima', email: 'carlos@andina.com', activo: true }
    ]).returning('id');

    // Insertar productos de prueba
    const productos = await knex('producto').insert([
        { nombre: 'Cemento Portland Tipo I', descripcion: 'Saco de 50kg, resistencia 28 días', precio_base: 28.50, activo: true },
        { nombre: 'Acero de Construcción 1/2"', descripcion: 'Varilla corrugada, 6 metros de largo', precio_base: 45.00, activo: true },
        { nombre: 'Ladrillo King Kong 18 huecos', descripcion: 'Ladrillo para muros de carga, 18 huecos', precio_base: 1.80, activo: true },
        { nombre: 'Arena Gruesa', descripcion: 'Metro cúbico, seleccionada', precio_base: 35.00, activo: true },
        { nombre: 'Piedra Chancada 1/2"', descripcion: 'Metro cúbico, para concreto', precio_base: 42.00, activo: true }
    ]).returning('id');

    // Insertar proformas de prueba
    const proforma1 = await knex('proforma').insert({
        numero: 'P-2026-0001',
        cliente_id: clientes[0].id,
        fecha_emision: '2026-05-01',
        subtotal: 2850.00,
        igv: 513.00,
        total: 3363.00,
        estado: 'EMITIDA',
        observaciones: 'Entrega en obra dentro de 48 horas'
    }).returning('id');

    await knex('proforma_detalle').insert([
        { proforma_id: proforma1[0].id, producto_id: productos[0].id, descripcion: 'Cemento Portland Tipo I - Saco 50kg', cantidad: 50, precio_unitario: 28.50, total: 1425.00 },
        { proforma_id: proforma1[0].id, producto_id: productos[1].id, descripcion: 'Acero de Construcción 1/2" - Varilla 6m', cantidad: 20, precio_unitario: 45.00, total: 900.00 },
        { proforma_id: proforma1[0].id, producto_id: productos[2].id, descripcion: 'Ladrillo King Kong 18 huecos', cantidad: 300, precio_unitario: 1.80, total: 540.00 }
    ]);

    const proforma2 = await knex('proforma').insert({
        numero: 'P-2026-0002',
        cliente_id: clientes[1].id,
        fecha_emision: '2026-05-02',
        subtotal: 1540.00,
        igv: 277.20,
        total: 1817.20,
        estado: 'ENVIADA',
        observaciones: 'Precios válidos por 15 días'
    }).returning('id');

    await knex('proforma_detalle').insert([
        { proforma_id: proforma2[0].id, producto_id: productos[3].id, descripcion: 'Arena Gruesa - m3', cantidad: 10, precio_unitario: 35.00, total: 350.00 },
        { proforma_id: proforma2[0].id, producto_id: productos[4].id, descripcion: 'Piedra Chancada 1/2" - m3', cantidad: 15, precio_unitario: 42.00, total: 630.00 },
        { proforma_id: proforma2[0].id, producto_id: productos[0].id, descripcion: 'Cemento Portland Tipo I - Saco 50kg', cantidad: 20, precio_unitario: 28.50, total: 570.00 }
    ]);

    const proforma3 = await knex('proforma').insert({
        numero: 'P-2026-0003',
        cliente_id: clientes[2].id,
        fecha_emision: '2026-05-03',
        subtotal: 2100.00,
        igv: 378.00,
        total: 2478.00,
        estado: 'ACEPTADA',
        observaciones: null
    }).returning('id');

    await knex('proforma_detalle').insert([
        { proforma_id: proforma3[0].id, producto_id: productos[1].id, descripcion: 'Acero de Construcción 1/2" - Varilla 6m', cantidad: 30, precio_unitario: 45.00, total: 1350.00 },
        { proforma_id: proforma3[0].id, producto_id: productos[3].id, descripcion: 'Arena Gruesa - m3', cantidad: 10, precio_unitario: 35.00, total: 350.00 },
        { proforma_id: proforma3[0].id, producto_id: productos[4].id, descripcion: 'Piedra Chancada 1/2" - m3', cantidad: 10, precio_unitario: 42.00, total: 420.00 }
    ]);
};