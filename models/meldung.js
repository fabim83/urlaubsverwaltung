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
                sql = "INSERT INTO UV_MELDUNG VALUES (?,?,'Offen',?,?,?)";
                values = [meldung.personalnummer, result[0].meldungsart_nr, meldung.vom_dat, meldung.bis_dat, meldung.halber_tag];
                db.query(sql, values, callback);
            }
        });
    });
};

module.exports.getMeldungenZuMitarbeiter = function (personalnummer, callback){
    db.connect((err) => {
        var sql = "SELECT * from UV_MELDUNG WHERE PERSONALNUMMER = ?";
        var values = [personalnummer];
        db.query(sql, values, callback);
    });
}



