module.exports.isMitarbeiterAuthentifiziert = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/users/login');
    }
};

module.exports.isVerwalter = function(req, res, next) {
    if (req.user[0].kz_verwalter == 1) {
        return next();
    } else {
        res.redirect('/users/login');
    }
};