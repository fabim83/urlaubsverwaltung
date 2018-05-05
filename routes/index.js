const express = require('express');
const router = express.Router();

// Get Homepage
router.get('/', isMitarbeitAuthentifiziert, function (req, res) {
    var anrede = req.user[0].geschlecht  == 'w' ? 'Frau' : 'Herr';
    res.render('index', {
        anrede: anrede,
        name: req.user[0].name,
        personalnummer: req.user[0].personalnummer,
        verwalter: req.user[0].kz_verwalter
    });
});

function isMitarbeitAuthentifiziert(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/users/login');
    }
};

module.exports = router;