const mysql = require('mysql');
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "urlaubsverwaltung_ws2015_webprogrammierung"
});
const bcrypt = require('bcryptjs');

module.exports.createMitarbeiter = function (mitarbeiter, callback) {
    // Passwort hashen
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(mitarbeiter.passwort, salt, function(err, hash) {
            // DB-Insert
            db.connect((err) => {
                var sql = "INSERT INTO UV_MITARBEITER VALUES (?,?,?,?,?,?,?,0,30)";
                var values = [mitarbeiter.personalnummer, mitarbeiter.name, mitarbeiter.vorname, mitarbeiter.anrede, mitarbeiter.abteilung, mitarbeiter.email, hash];
                db.query(sql, values, callback);
            });
        });
    });
};

module.exports.getMitarbeiterByPersonalnummer = function (personalnummer, callback){
    db.connect((err) => {
        var sql = "SELECT * FROM UV_MITARBEITER WHERE PERSONALNUMMER = ?";
        var values = [personalnummer];
        db.query(sql, values, callback);
    });
};

module.exports.comparePasswort = function (eingegebenesPasswort, hash, callback){
    bcrypt.compare(eingegebenesPasswort, hash, function(err, isMatch) {
        if(err) throw err;
        callback(null, isMatch);
    });
};