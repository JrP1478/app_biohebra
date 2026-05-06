module.exports = (req, res, next) => {
    res.locals.success_msg = req.session?.success_msg || null;
    res.locals.error_msg = req.session?.error_msg || null;
    
    if (req.session) {
        delete req.session.success_msg;
        delete req.session.error_msg;
    }
    
    next();
};