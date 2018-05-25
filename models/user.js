const config = require('../config');
const mysql = require('mysql');
const db = mysql.createConnection(config.mysql);
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

module.exports.getUrlaubstageByPersonalnummer = function (personalnummer, callback){
    db.connect((err) => {
        var sql = "SELECT urlaub_jahr FROM UV_MITARBEITER WHERE PERSONALNUMMER = ?";
        var values = [personalnummer];
        db.query(sql, values, callback);
    });
};

module.exports.reduziereUrlaubstageByPersonalnummer = function (personalnummer, anzahlTage, callback){
    db.connect((err) => {
        var sql = "UPDATE UV_MITARBEITER SET URLAUB_JAHR = URLAUB_JAHR - ? WHERE PERSONALNUMMER = ?";
        var values = [anzahlTage, personalnummer];
        db.query(sql, values, callback);
    });
};

module.exports.erhoeheUrlaubstageByPersonalnummer = function (personalnummer, anzahlTage, callback){
    db.connect((err) => {
        var sql = "UPDATE UV_MITARBEITER SET URLAUB_JAHR = URLAUB_JAHR + ? WHERE PERSONALNUMMER = ?";
        var values = [anzahlTage, personalnummer];
        db.query(sql, values, callback);
    });
};

module.exports.getAbteilungen = function (callback){
    db.connect((err) => {
        var sql = "SELECT * FROM UV_ABTEILUNG;";
        db.query(sql, callback);
    });
};

module.exports.comparePasswort = function (eingegebenesPasswort, hash, callback){
    bcrypt.compare(eingegebenesPasswort, hash, function(err, isMatch) {
        if(err) throw err;
        callback(null, isMatch);
    });
};