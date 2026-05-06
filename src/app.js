require('dotenv').config();
const express = require('express');
const path = require('path');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de EJS
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');

app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'proforma-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));

app.use((req, res, next) => {
    res.locals.success_msg = req.session?.success_msg || null;
    res.locals.error_msg = req.session?.error_msg || null;
    
    if (req.session) {
        delete req.session.success_msg;
        delete req.session.error_msg;
    }
    
    next();
});

// Verificar conexión a base de datos
db.raw('SELECT 1')
    .then(() => console.log('✅ Base de datos conectada'))
    .catch(err => {
        console.error('❌ Error de conexión a BD:', err);
        process.exit(1);
    });

// Importar rutas
const indexRoutes = require('./routes/index');

// Usar rutas
app.use('/', indexRoutes);

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).render('error', { 
        titulo: 'Página no encontrada',
        mensaje: 'La ruta solicitada no existe.',
        codigo: 404
    });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        titulo: 'Error del servidor',
        mensaje: 'Ocurrió un error inesperado.',
        codigo: 500
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});