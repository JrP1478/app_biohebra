exports.up = async function(knex) {
    await knex.schema.table('cliente', table => {
        table.string('dni', 8).nullable().unique();
        table.string('tipo_documento', 10).nullable().defaultTo('RUC');
    });
};

exports.down = async function(knex) {
    await knex.schema.table('cliente', table => {
        table.dropColumn('dni');
        table.dropColumn('tipo_documento');
    });
};