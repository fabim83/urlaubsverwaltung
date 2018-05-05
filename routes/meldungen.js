const express = require('express');
const router = express.Router();
const Meldung = require('../models/meldung');

// Get Homepage
router.post('/erfassen', isMitarbeitAuthentifiziert, function (req, res) {
    req.checkBody('von_datum', 'Der Zeitraum muss angegeben werden.').notEmpty();
    req.checkBody('bis_datum', 'Der Zeitraum muss angegeben werden.').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        res.render('/', {
            errors: errors
        });
    } else {
        var meldung = {
            personalnummer: req.user[0].personalnummer,
            meldungsart: req.body.meldungsart,
            vom_dat: req.body.von_datum,
            bis_dat: req.body.bis_datum,
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
    }
});

router.post('/uebersicht', isMitarbeitAuthentifiziert, function(req, res){
    Meldung.getMeldungenZuMitarbeiter(req.user[0].personalnummer, (err, result) => {
        if (err) {
            req.flash('error_msg', err.message);
            res.redirect('/');
        } else {
            res.send(result);
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