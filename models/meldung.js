const mysql = require('mysql');
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "urlaubsverwaltung_ws2015_webprogrammierung",
    dateStrings: true
});

module.exports.createMeldung = function (meldung, callback) {
    db.connect((err) => {
        var sql = "SELECT * from UV_MELDUNGSART WHERE MELDUNGSART = ?";
        var values = [meldung.meldungsart];
        db.query(sql, values, (err, result) => {
            if (err) {
                callback(err, null);
            } else {
                sql = "INSERT INTO UV_MELDUNG (personalnummer, meldungsart, meldungsstatus, vom_dat, bis_dat, halber_tag) VALUES (?,?,'Offen',?,?,?)";
                values = [meldung.personalnummer, result[0].meldungsart_nr, meldung.vom_dat, meldung.bis_dat, meldung.halber_tag];
                db.query(sql, values, callback);
            }
        });
    });
};

module.exports.getMeldungenZuMitarbeiter = function (personalnummer, callback) {
    db.connect((err) => {
        var sql = "SELECT * from UV_MELDUNG WHERE PERSONALNUMMER = ?";
        var values = [personalnummer];
        db.query(sql, values, callback);
    });
};

module.exports.getMeldungByID = function (meldung_nr, callback) {
    db.connect((err) => {
        var sql = "SELECT * from UV_MELDUNG WHERE MELDUNG_NR = ?";
        var values = [meldung_nr];
        db.query(sql, values, callback);
    });
};

module.exports.removeMeldungByID = function (meldung_nr, callback) {
    db.connect((err) => {
        var sql = "DELETE from UV_MELDUNG WHERE MELDUNG_NR = ?";
        var values = [meldung_nr];
        db.query(sql, values, callback);
    });
};

module.exports.getMeldungenByMitarbeiterUndJahr = function (personalnummer, jahr, callback) {
    db.connect((err) => {
        var sql = "SELECT * from UV_MELDUNG WHERE PERSONALNUMMER = ? AND YEAR(VOM_DAT) = ? AND MELDUNGSSTATUS = 'Genehmigt' ORDER BY VOM_DAT";
        var values = [personalnummer, jahr];
        db.query(sql, values, (err, result) => {
            if (err) {
                callback(err, null);
            } else {
                sql = "SELECT * FROM UV_MELDUNGSART";
                db.query(sql, (err, meldungsarten) => {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, ersetzteSchluesselDurchKlartext(result, meldungsarten));
                    }
                });
            }
        });
    });
};

module.exports.getMeldungenByStatus = function (status, callback) {
    db.connect((err) => {
        var sql = "SELECT * from UV_MELDUNG x JOIN UV_MITARBEITER y ON x.PERSONALNUMMER = y.PERSONALNUMMER WHERE MELDUNGSSTATUS = ?";
        var values = [status];
        db.query(sql, values, (err, result) => {
            if (err) {
                callback(err, null);
            } else {
                sql = "SELECT * FROM UV_MELDUNGSART";
                db.query(sql, (err, meldungsarten) => {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, ersetzteSchluesselDurchKlartext(result, meldungsarten));
                    }
                });
            }
        });
    });
};

module.exports.setStatusMeldung = function (meldung_nr, status_neu, callback){
    db.connect((err) => {
        var sql = "UPDATE UV_MELDUNG SET MELDUNGSSTATUS = ? WHERE MELDUNG_NR = ?";
        var values = [status_neu, meldung_nr];
        db.query(sql, values, callback);
    });
};

module.exports.getMeldungenByAbteilung = function (abteilung, callback) {
    db.connect((err) => {
        var sql = "SELECT * from UV_MELDUNG x JOIN UV_MITARBEITER y ON x.PERSONALNUMMER = y.PERSONALNUMMER WHERE x.MELDUNGSSTATUS = 'Genehmigt' and y.Abteilung = ?";
        var values = [abteilung];
        db.query(sql, values, (err, result) => {
            if (err) {
                callback(err, null);
            } else {
                sql = "SELECT * FROM UV_MELDUNGSART";
                db.query(sql, (err, meldungsarten) => {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, ersetzteSchluesselDurchKlartext(result, meldungsarten));
                    }
                });
            }
        });
    });
};

module.exports.getKollidierendeMeldungen = function (personalnummer, vom_dat, bis_dat, callback) {
    db.connect((err) => {
        var sql = "SELECT x.vom_dat, x.bis_dat FROM uv_meldung x JOIN uv_meldungsart y ON x.meldungsart = y.meldungsart_nr WHERE x.personalnummer = ? AND y.meldungsart = 'Urlaub' AND x.meldungsstatus = 'Genehmigt' AND ((x.vom_dat <= ? AND x.bis_dat >= ?) OR (x.vom_dat <= ? AND x.bis_dat >= ?) OR (x.vom_dat > ? AND x.bis_dat < ?))";
        var values = [personalnummer, vom_dat, vom_dat, bis_dat, bis_dat, vom_dat, bis_dat];
        db.query(sql, values, callback);
    });
}

function ersetzteSchluesselDurchKlartext(meldungen, meldungsarten) {
    for (i = 0; i < meldungen.length; i++) {
        for (j = 0; j < meldungsarten.length; j++) {
            if (meldungen[i].meldungsart == meldungsarten[j].meldungsart_nr) {
                meldungen[i].meldungsart = meldungsarten[j].meldungsart;
            }
        }

        meldungen[i].halber_tag = meldungen[i].halber_tag == "vorm" ? "Vormittags" : meldungen[i].halber_tag == "nachm" ? "Nachmittags" : "";

    }
    return meldungen;
}



