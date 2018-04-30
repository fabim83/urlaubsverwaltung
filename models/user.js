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
            mitarbeiter.passwort = hash;
        });
    });

    // DB-Insert
    db.connect((err) => {
        if (err) console.log('Verbindung zur Datenbank fehlgeschlagen.');
        var sql = "INSERT INTO UV_MITARBEITER VALUES (?,?,?,?,?,?,null,30)";
        var values = [mitarbeiter.personalnummer, mitarbeiter.name, mitarbeiter.vorname, mitarbeiter.anrede, mitarbeiter.email, mitarbeiter.passwort];
        db.query(sql, values, callback);
    });
};

module.exports.getMitarbeiterByPersonalnummer = function (personalnummer, callback){
    db.connect((err) => {
        if (err) console.log('Verbindung zur Datenbank fehlgeschlagen.');
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