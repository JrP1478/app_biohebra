exports.seed = async function(knex) {
    await knex('empresa').del();
    
    await knex('empresa').insert({
        nombre: 'Mi Empresa S.A.C.',
        ruc: '20123456789',
        direccion: 'Av. Principal 123, Lima',
        telefono: '01-2345678',
        web: 'www.miempresa.com',
        logo: null
    });
};