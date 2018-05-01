const mysql = require('mysql');
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "urlaubsverwaltung_ws2015_webprogrammierung"
});

module.exports.createMeldung = function (meldung, callback) {
    db.connect((err) => {
        var sql = "INSERT INTO UV_MELDUNG VALUES (?,?,'Offen',?,?,?)";
        var values = [meldung.personalnummer, meldung.meldungsart, meldung.vom_dat, meldung.bis_dat, meldung.halber_tag];
        db.query(sql, values, callback);
    });
};

