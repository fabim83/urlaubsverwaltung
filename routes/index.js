const express = require('express');
const router = express.Router();
const VerificationUtil = require('../utils/verification');

// Get Homepage
router.get('/', VerificationUtil.isMitarbeiterAuthentifiziert, function (req, res) {
    var anrede = req.user[0].geschlecht  == 'w' ? 'Frau' : 'Herr';
    res.render('index', {
        anrede: anrede,
        name: req.user[0].name,
        personalnummer: req.user[0].personalnummer,
        verwalter: req.user[0].kz_verwalter
    });
});

module.exports = router;