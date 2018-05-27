const express = require('express');
const router = express.Router();
const Meldung = require('../models/meldung');
const User = require('../models/user');
const MailUtil = require('../utils/mail');
const VerificationUtil = require('../utils/verification');
const fonts = {
    Roboto: {
        normal: './public/fonts/Roboto-Regular.ttf',
        bold: './public/fonts/Roboto-Medium.ttf',
        italics: './public/fonts/Roboto-Italic.ttf',
        bolditalics: './public/fonts/Roboto-MediumItalic.ttf'
    }
};
const PdfPrinter = require('pdfmake/src/printer');
const printer = new PdfPrinter(fonts);
const fs = require('fs');

/**
 * Routes Meldungen
 */
router.post('/erfassen', VerificationUtil.isMitarbeiterAuthentifiziert, function (req, res) {
    req.checkBody('von_datum', 'Der Zeitraum muss angegeben werden.').notEmpty();
    req.checkBody('bis_datum', 'Der Zeitraum muss angegeben werden.').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        res.render('/', {
            errors: errors
        });
    } else {
        validiereUndErzeugeMeldungFallsNotwendig(req, res);
    }
});

router.post('/uebersicht', VerificationUtil.isMitarbeiterAuthentifiziert, function (req, res) {
    Meldung.getMeldungenByPersonalnummerUndJahr(req.user[0].personalnummer, new Date().getFullYear(), (err, result) => {
        if (err) {
            req.flash('error_msg', err.message);
            res.redirect('/');
        } else {
            res.send(result);
        }
    });
});

router.get('/status', VerificationUtil.isMitarbeiterAuthentifiziert, VerificationUtil.isVerwalter, function (req, res) {
    Meldung.getMeldungenByStatus(req.query.status, (err, result) => {
        if (err) {
            req.flash('error_msg', err.message);
            res.redirect('/');
        } else {
            res.send(result);
        }
    });
});

router.post('/status-aktualisieren', VerificationUtil.isMitarbeiterAuthentifiziert, VerificationUtil.isVerwalter, function (req, res) {
    var status_neu = req.body.entscheidung == 'Genehmigen' ? 'Genehmigt' : 'Abgelehnt';
    Meldung.setStatusMeldung(req.body.meldung_nr, status_neu, (err, result) => {
        if (err) {
            req.flash('error_msg', err.message);
            res.redirect('/');
        } else {
            if (req.body.meldungsart == "Urlaub" && status_neu == "Genehmigt") {
                behandleUrlaubsMeldungGehnemigt(req, res, status_neu);
            } else if (req.body.meldungsart == "Krankheit" && status_neu == "Genehmigt") {
                behandleKrankMeldungGenehmigt(req, res, status_neu);
            } else {
                MailUtil.sendeBenachrichtigungMeldungsstatus(req.body.anrede, req.body.email, req.body.name, status_neu, req.body.meldungsart);
                req.flash('success_msg', 'Der Meldungsstatus wurde erfolgreich aktualisiert.');
                res.redirect('/');
            }

        }
    });
});

router.get('/meldungen-fuer-abteilung', VerificationUtil.isMitarbeiterAuthentifiziert, VerificationUtil.isVerwalter, function (req, res) {
    Meldung.getMeldungenByAbteilung(req.query.abteilung, (err, result) => {
        if (err) {
            req.flash('error_msg', err.message);
            res.redirect('/');
        } else {
            res.send(result);
        }
    });
});

router.get('/historie', VerificationUtil.isMitarbeiterAuthentifiziert, function (req, res) {
    Meldung.getMeldungenByPersonalnummerUndJahr(req.user[0].personalnummer, req.query.jahr, (err, result) => {
        if (err) {
            req.flash('error_msg', err.message);
            res.redirect('/');
        } else {
            res.send(result);
        }
    });
});

router.get('/meldung-stornieren', VerificationUtil.isMitarbeiterAuthentifiziert, function (req, res) {
    Meldung.getStornierbareMeldungen(req.user[0].personalnummer, (err, result) => {
        if (err) {
            req.flash('error_msg', err.message);
            res.redirect('/');
        } else {
            res.send(result);
        }
    });
});

router.post('/meldung-stornieren', VerificationUtil.isMitarbeiterAuthentifiziert, function (req, res) {
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
                    entferneStornierteMeldung(req, res);
                }
            });
        }
    });
});

router.post('/jahresuebersicht', VerificationUtil.isMitarbeiterAuthentifiziert, function (req, res) {
    Meldung.getMeldungenByPersonalnummerUndJahr(req.user[0].personalnummer, new Date().getFullYear(), (err, result) => {
        if (err) {
            req.flash('error_msg', err.message);
            res.redirect('/');
        } else {
            erstelleUndSendeJahresuebersicht(req, res, result);
        }
    });
});

/**
 * Sonstige Methoden Meldungen
 */
function validiereUndErzeugeMeldungFallsNotwendig(req, res) {
    if (req.body.meldungsart == "Urlaub") {
        User.getUrlaubstageByPersonalnummer(req.user[0].personalnummer, (err, result) => {
            if (err) {
                req.flash('error_msg', err.message);
                res.redirect('/');
            } else {
                if (result[0].urlaub_jahr < getAnzahlWerktage(new Date(req.body.von_datum), new Date(req.body.bis_datum))) {
                    req.flash('error_msg', 'Sie haben nicht mehr genügend Resturlaub in diesem Jahr zur Verfügung.');
                    res.redirect('/');
                } else {
                    Meldung.getKollidierendeMeldungen(req.user[0].personalnummer, req.body.von_datum, req.body.bis_datum, (err, kolidierendeMeldungen) => {
                        if (err) {
                            req.flash('error_msg', err.message);
                            res.redirect('/');
                        } else if (kolidierendeMeldungen.length > 0) {
                            req.flash('error_msg', 'Sie haben im angegebenen Zeitraum bereits Urlaub beantragt.');
                            res.redirect('/');
                        } else {
                            erzeugeMeldung(req, res);
                        }
                    });
                }
            }
        });
    } else {
        erzeugeMeldung(req, res);
    }
};

function erzeugeMeldung(req, res) {
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
                // Hochladen der Arbeitsunfähigkeitsbescheinigung, falls ausgewählt
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
};

function entferneStornierteMeldung(req, res) {
    Meldung.removeMeldungByID(req.body.meldung_nr, (err, result) => {
        if (err) {
            req.flash('error_msg', err.message);
            res.redirect('/');
        } else {
            req.flash('success_msg', 'Die Meldung wurde erfolgreich storniert.');
            res.redirect('/');
        }
    });
};

function behandleUrlaubsMeldungGehnemigt(req, res, status) {
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
                    MailUtil.sendeBenachrichtigungMeldungsstatus(req.body.anrede, req.body.email, req.body.name, status, req.body.meldungsart);
                    req.flash('success_msg', 'Der Meldungsstatus wurde erfolgreich aktualisiert.');
                    res.redirect('/');
                }
            });
        }
    });
};

function behandleKrankMeldungGenehmigt(req, res, status) {
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
                            MailUtil.sendeBenachrichtigungMeldungsstatus(req.body.anrede, req.body.email, req.body.name, status, req.body.meldungsart);
                            req.flash('success_msg', 'Der Meldungsstatus wurde erfolgreich aktualisiert.');
                            res.redirect('/');
                        }
                    });
                }
            });
        }
    });
};

function erstelleUndSendeJahresuebersicht(req, res, meldungen) {
    var datum = new Date();
    var pfad = 'jahresuebersichten/Jahresübersicht_' + req.user[0].personalnummer + '_' + datum.getFullYear() + (datum.getMonth() + 1) + datum.getDate() + datum.getHours() + datum.getMinutes() + '.pdf';

    var docDefinition = {
        header: {
            columns: [
                { text: '\u00A9 ' + datum.getFullYear() + ' Urlaubsverwaltung', margin: [15, 15] },
                { text: datum.getDate() + '.' + datum.getMonth() + '.' + datum.getFullYear(), alignment: 'right', margin: [15, 15] }
            ]
        },
        footer: function(currentPage, pageCount) { return {text: 'Seite: ' + currentPage.toString(), alignment: 'right', margin: [15, 15]} },
        content: [
            {text: 'Jahresübersicht ' + datum.getFullYear(), style: 'header', fontSize: 24, marginBottom: 25, marginTop: 25},
            {
                layout: 'lightHorizontalLines',
                table: {
                    headerRows: 1,
                    body: buildTableBody(meldungen, ['#', 'Meldungsart', 'Von', 'Bis', 'Halber Tag'])
                }
            }
        ]
    };

    var pdfDoc = printer.createPdfKitDocument(docDefinition);
    pdfDoc.pipe(fs.createWriteStream(pfad));
    pdfDoc.end();
    MailUtil.sendeJahresuebersicht(req, res, pfad);
};

function buildTableBody(meldungen, columns) {
    var body = [];

    body.push(columns);

    var i = 1;
    meldungen.forEach(function(meldung) {
        var dataRow = [];

        dataRow.push(i.toString());
        dataRow.push(meldung.meldungsart.toString());
        dataRow.push(meldung.vom_dat.toString());
        dataRow.push(meldung.bis_dat.toString());
        dataRow.push(meldung.halber_tag.toString())

        body.push(dataRow);
        i++;
    });

    return body;
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

module.exports = router;