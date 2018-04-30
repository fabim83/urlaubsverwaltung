const express = require('express');
const router = express.Router();

// Get Homepage
router.get('/', isMitarbeitAuthentifiziert, function (req, res) {
    res.render('index');
});

function isMitarbeitAuthentifiziert(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/users/login');
    }
};

module.exports = router;