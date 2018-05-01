const express = require('express');
const router = express.Router();
const Meldung = require('../models/meldung');

// Get Homepage
router.get('/neue-meldung', isMitarbeitAuthentifiziert, function (req, res) {
    var meldung = {
        personalnummer: req.user[0].personalnummer,
        meldungsart: req.body.meldungsart,
        vom_dat: req.body.vom_dat,
        bis_dat: req.body.bis_dat,
        halber_tag: req.body.halber_tag,
    };

    Meldung.createMeldung(meldung, (err, result) => {
        if (err) {
            req.flash('error_msg', err.message);
            res.redirect('/');
        } else {
            req.flash('success_msg', 'Die Meldung wurde erfolgreich abgeschickt.');
            res.redirect('/');
        }
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