const express = require('express');
const router = express.Router();
const Meldung = require('../models/meldung');
const User = require('../models/user');
const nodemailer = require('nodemailer');

router.post('/erfassen', isMitarbeiterAuthentifiziert, function (req, res) {
    req.checkBody('von_datum', 'Der Zeitraum muss angegeben werden.').notEmpty();
    req.checkBody('bis_datum', 'Der Zeitraum muss angegeben werden.').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        res.render('/', {
            errors: errors
        });
    } else {
        User.getUrlaubstageByPersonalnummer(req.user[0].personalnummer, (err, result) => {
            if (err) {
                req.flash('error_msg', err.message);
                res.redirect('/');
            } else {
                if (req.body.meldungsart == "Urlaub" && result[0].urlaub_jahr < getAnzahlWerktage(new Date(req.body.von_datum), new Date(req.body.bis_datum))) {
                    req.flash('error_msg', 'Sie haben nicht mehr genügend Resturlaub in diesem Jahr zur Verfügung.');
                    res.redirect('/');
                } else {
                    var meldung = {
                        personalnummer: req.user[0].personalnummer,
                        meldungsart: req.body.meldungsart,
                        vom_dat: req.body.von_datum,
                        bis_dat: req.body.bis_datum,
                        halber_tag: req.body.halber_tag
                    };

                    Meldung.createMeldung(meldung, (err, result) => {
                        if (err) {
                            req.flash('error_msg', err.message);
                            res.redirect('/');
                        } else {
                            if (req.files.bescheinigung && req.body.meldungsart == "Krankheit") {
                                let bescheinigung = req.files.bescheinigung;
                                var dateipfad = 'bescheinigungen/' + req.user[0].name + '_' + req.user[0].vorname + '_' + req.body.von_datum + '_' + req.body.bis_datum + '.pdf';
                                bescheinigung.mv(dateipfad, (err) => {
                                    if (err) {
                                        req.flash('error_msg', err.message);
                                        res.redirect('/');
                                    } else {
                                        req.flash('success_msg', 'Die Meldung wurde erfolgreich abgeschickt.');
                                        res.redirect('/');
                                    }
                                });
                            } else {
                                req.flash('success_msg', 'Die Meldung wurde erfolgreich abgeschickt.');
                                res.redirect('/');
                            }
                        }
                    });
                }
            }
        });
    }
});

router.post('/uebersicht', isMitarbeiterAuthentifiziert, function (req, res) {
    Meldung.getMeldungenByMitarbeiterUndJahr(req.user[0].personalnummer, new Date().getFullYear(), (err, result) => {
        if (err) {
            req.flash('error_msg', err.message);
            res.redirect('/');
        } else {
            res.send(result);
        }
    });
});

router.get('/status', isMitarbeiterAuthentifiziert, isVerwalter, function (req, res) {
    Meldung.getMeldungenByStatus(req.query.status, (err, result) => {
        if (err) {
            req.flash('error_msg', err.message);
            res.redirect('/');
        } else {
            res.send(result);
        }
    });
});

router.post('/status-aktualisieren', isMitarbeiterAuthentifiziert, isVerwalter, function (req, res) {
    var status_neu = req.body.entscheidung == 'Genehmigen' ? 'Genehmigt' : 'Abgelehnt';
    Meldung.setStatusMeldung(req.body.meldung_nr, status_neu, (err, result) => {
        if (err) {
            req.flash('error_msg', err.message);
            res.redirect('/');
        } else {
            if (req.body.meldungsart == "Urlaub") {
                Meldung.getMeldungByID(req.body.meldung_nr, (err, result) => {
                    if (err) {
                        req.flash('error_msg', err.message);
                        res.redirect('/');
                    } else {
                        var meldung = result[0];
                        var anzahlTage = getAnzahlWerktage(new Date(meldung.vom_dat), new Date(meldung.bis_dat));
                        User.reduziereUrlaubstageByPersonalnummer(meldung.personalnummer, anzahlTage, (err, result) => {
                            if (err) {
                                req.flash('error_msg', err.message);
                                res.redirect('/');
                            } else {
                                sendeBenachrichtigungAnMitarbeiter(req.body.anrede, req.body.email, req.body.name, status_neu, req.body.meldungsart);
                                req.flash('success_msg', 'Der Meldungsstatus wurde erfolgreich aktualisiert.');
                                res.redirect('/');
                            }
                        });
                    }
                });
            } else if (req.body.meldungsart == "Krankheit") {
                Meldung.getMeldungByID(req.body.meldung_nr, (err, meldungen) => {
                    if (err) {
                        req.flash('error_msg', err.message);
                        res.redirect('/');
                    } else {
                        var meldung = meldungen[0];
                        Meldung.getKollidierendeMeldungen(meldung.personalnummer, meldung.vom_dat, meldung.bis_dat, (err, result) => {
                            if (err) {
                                req.flash('error_msg', err.message);
                                res.redirect('/');
                            } else {
                                var anzahlTage = ermittleAnzahlGutzuschreibendeTage(new Date(meldung.vom_dat), new Date(meldung.bis_dat), new Date(result[0].vom_dat), new Date(result[0].bis_dat));
                                User.erhoeheUrlaubstageByPersonalnummer(meldung.personalnummer, anzahlTage, (err, result) => {
                                    if (err) {
                                        req.flash('error_msg', err.message);
                                        res.redirect('/');
                                    } else {
                                        sendeBenachrichtigungAnMitarbeiter(req.body.anrede, req.body.email, req.body.name, status_neu, req.body.meldungsart);
                                        req.flash('success_msg', 'Der Meldungsstatus wurde erfolgreich aktualisiert.');
                                        res.redirect('/');
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                sendeBenachrichtigungAnMitarbeiter(req.body.anrede, req.body.email, req.body.name, status_neu, req.body.meldungsart);
                req.flash('success_msg', 'Der Meldungsstatus wurde erfolgreich aktualisiert.');
                res.redirect('/');
            }

        }
    });
});

router.get('/meldungen-fuer-abteilung', isMitarbeiterAuthentifiziert, isVerwalter, function (req, res) {
    Meldung.getMeldungenByAbteilung(req.query.abteilung, (err, result) => {
        if (err) {
            req.flash('error_msg', err.message);
            res.redirect('/');
        } else {
            res.send(result);
        }
    });
});

router.get('/historie', isMitarbeiterAuthentifiziert, function (req, res) {
    Meldung.getMeldungenByMitarbeiterUndJahr(req.user[0].personalnummer, req.query.jahr, (err, result) => {
        if (err) {
            req.flash('error_msg', err.message);
            res.redirect('/');
        } else {
            res.send(result);
        }
    });
});

router.get('/meldung-stornieren', isMitarbeiterAuthentifiziert, function (req, res) {
    Meldung.getMeldungenByMitarbeiterUndJahr(req.user[0].personalnummer, new Date().getFullYear(), (err, result) => {
        if (err) {
            req.flash('error_msg', err.message);
            res.redirect('/');
        } else {
            res.send(result);
        }
    });
});

router.post('/meldung-stornieren', isMitarbeiterAuthentifiziert, function (req, res) {
    Meldung.getMeldungByID(req.body.meldung_nr, (err, result) => {
        if (err) {
            req.flash('error_msg', err.message);
            res.redirect('/');
        } else {
            var meldung = result[0];
            var anzahlTage = getAnzahlWerktage(new Date(meldung.vom_dat), new Date(meldung.bis_dat));
            User.erhoeheUrlaubstageByPersonalnummer(meldung.personalnummer, anzahlTage, (err, result) => {
                if (err) {
                    req.flash('error_msg', err.message);
                    res.redirect('/');
                } else {
                    Meldung.removeMeldungByID(req.body.meldung_nr, (err, result) => {
                        if (err) {
                            req.flash('error_msg', err.message);
                            res.redirect('/');
                        } else {
                            req.flash('success_msg', 'Die Meldung wurde erfolgreich storniert.');
                            res.redirect('/');
                        }
                    });
                }
            });
        }
    });
});

function sendeBenachrichtigungAnMitarbeiter(anrede, email, name, status_neu, meldungsart) {
    let transporter = nodemailer.createTransport({
        host: 'mail.gmx.net',
        port: 587,
        secure: false,
        auth: {
            user: 'urlaubsverwaltung@gmx.de',
            pass: 'Test1234'
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    var subject = "Ihr Antrag auf ";
    subject += meldungsart;
    subject += " wurde ";
    subject += status_neu.toLowerCase();

    var output = null;
    if (anrede == 'w') {
        output = `
            Sehr geehrte Frau ${name},
            <br/><br/>
            ihr Antrag auf ${meldungsart} wurde ${status_neu.toLowerCase()}!
            <br/><br/>
            Mit freundlichen Grüßen<br/>
            Ihre Urlaubsverwaltung
        `;
    } else {
        output = `
            Sehr geehrter Herr ${name},
            <br/><br/>
            ihr Antrag auf ${meldungsart} wurde ${status_neu.toLowerCase()}!
            <br/><br/>
            Mit freundlichen Grüßen<br/>
            Ihre Urlaubsverwaltung
        `;
    }

    let mailOptions = {
        from: '"Urlaubsverwaltung" <urlaubsverwaltung@gmx.de>',
        to: email,
        subject: subject,
        html: output
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });
};

function getAnzahlWerktage(startDate, endDate) {
    var count = 0;
    var curDate = startDate;
    while (curDate <= endDate) {
        var dayOfWeek = curDate.getDay();
        if (!((dayOfWeek == 6) || (dayOfWeek == 0))) {
            count++;
        }
        curDate.setDate(curDate.getDate() + 1);
    }
    return count;
};

function ermittleAnzahlGutzuschreibendeTage(startDate, endDate, colStartDate, colEndDate) {
    if (colStartDate <= startDate && colEndDate >= endDate) {
        return getAnzahlWerktage(startDate, endDate);
    }

    if (startDate < colStartDate && endDate > colStartDate && endDate <= colEndDate) {
        return getAnzahlWerktage(colStartDate, endDate);
    }

    if (startDate >= colStartDate && startDate <= colEndDate && endDate > colEndDate) {
        return getAnzahlWerktage(startDate, colEndDate);
    }

    if (startDate < colStartDate && endDate > colEndDate) {
        return getAnzahlWerktage(colStartDate, colEndDate);
    }
};

function isMitarbeiterAuthentifiziert(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/users/login');
    }
};

function isVerwalter(req, res, next) {
    if (req.user[0].kz_verwalter == 1) {
        return next();
    } else {
        res.redirect('/users/login');
    }
};

module.exports = router;