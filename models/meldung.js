const mysql = require('mysql');
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "urlaubsverwaltung_ws2015_webprogrammierung"
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

module.exports.getMeldungenByStatus = function (status, callback) {
    db.connect((err) => {
        var sql = "SELECT * from UV_MELDUNG WHERE MELDUNGSSTATUS = ?";
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
                        callback(null, meldungenMitMeldungsartAlsKlartext(result, meldungsarten));
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

function meldungenMitMeldungsartAlsKlartext(meldungen, meldungsarten) {
    for (i = 0; i < meldungen.length; i++) {
        for (j = 0; j < meldungsarten.length; j++) {
            if (meldungen[i].meldungsart == meldungsarten[j].meldungsart_nr) {
                meldungen[i].meldungsart = meldungsarten[j].meldungsart;
            }
        }
    }
    return meldungen;
}



