module.exports = {
    admin: function(req, res, next) {
        if (req.isAuthenticated() && req.user.admin == 1) {
            return next()
        } else {
            req.flash('error_msg', 'Acesso permitido apenas para Administradores!')
            res.redirect('/')
        }
    }
}