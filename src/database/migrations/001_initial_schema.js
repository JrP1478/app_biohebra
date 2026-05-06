exports.up = async function(knex) {
    // Tabla: empresa
    await knex.schema.createTable('empresa', table => {
        table.increments('id').primary();
        table.string('nombre', 150).notNullable();
        table.string('ruc', 20).notNullable().unique();
        table.string('direccion', 255);
        table.string('telefono', 20);
        table.string('web', 100);
        table.string('logo', 255); // ruta del archivo
        table.timestamps(true, true);
    });

    // Tabla: cliente
    await knex.schema.createTable('cliente', table => {
        table.increments('id').primary();
        table.string('nombre', 150).notNullable();
        table.string('ruc', 20);
        table.string('contacto', 100);
        table.string('telefono', 20);
        table.string('direccion', 255);
        table.string('email', 100);
        table.boolean('activo').defaultTo(true);
        table.timestamps(true, true);
    });

    // Tabla: producto
    await knex.schema.createTable('producto', table => {
        table.increments('id').primary();
        table.string('nombre', 150).notNullable();
        table.text('descripcion');
        table.decimal('precio_base', 10, 2).notNullable().defaultTo(0);
        table.boolean('activo').defaultTo(true);
        table.timestamps(true, true);
    });

    // Tabla: proforma
    await knex.schema.createTable('proforma', table => {
        table.increments('id').primary();
        table.string('numero', 20).notNullable().unique();
        table.integer('cliente_id').unsigned().notNullable();
        table.date('fecha_emision').notNullable();
        table.decimal('subtotal', 12, 2).notNullable().defaultTo(0);
        table.decimal('igv', 12, 2).notNullable().defaultTo(0);
        table.decimal('total', 12, 2).notNullable().defaultTo(0);
        table.enum('estado', ['EMITIDA', 'ENVIADA', 'ACEPTADA', 'RECHAZADA', 'ANULADA']).defaultTo('EMITIDA');
        table.text('observaciones');
        table.timestamps(true, true);

        table.foreign('cliente_id').references('id').inTable('cliente');
    });

    // Tabla: proforma_detalle
    await knex.schema.createTable('proforma_detalle', table => {
        table.increments('id').primary();
        table.integer('proforma_id').unsigned().notNullable();
        table.integer('producto_id').unsigned().notNullable();
        table.text('descripcion').notNullable();
        table.decimal('cantidad', 10, 2).notNullable().defaultTo(1);
        table.decimal('precio_unitario', 10, 2).notNullable().defaultTo(0);
        table.decimal('total', 12, 2).notNullable().defaultTo(0);
        table.timestamps(true, true);

        table.foreign('proforma_id').references('id').inTable('proforma').onDelete('CASCADE');
        table.foreign('producto_id').references('id').inTable('producto');
    });
};

exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('proforma_detalle');
    await knex.schema.dropTableIfExists('proforma');
    await knex.schema.dropTableIfExists('producto');
    await knex.schema.dropTableIfExists('cliente');
    await knex.schema.dropTableIfExists('empresa');
};