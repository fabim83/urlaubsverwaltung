const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const LOGIN_FEHLER_MESSAGE = 'Login-Daten nicht korrekt.';

// Login
router.get('/login', function (req, res) {
    res.render('login');
});

// Registrieren Formular
router.get('/register', function (req, res) {
    res.render('register');
});

// Registrieren Mitarbeiter
router.post('/register', function (req, res) {
    req.checkBody('personalnummer', 'Personalnummer muss dem Schema PN00000 entsprechen.').matches('^[P][N][0-9][0-9][0-9][0-9][0-9]$');
    req.checkBody('anrede', 'Anrede muss ausgewählt sein.').notEmpty();
    req.checkBody('vorname', 'Vorname muss gefüllt sein.').notEmpty();
    req.checkBody('vorname', 'Vorname darf nicht länger als 30 Zeichen sein.').len({ max: 30 });
    req.checkBody('name', 'Name muss gefüllt sein.').notEmpty();
    req.checkBody('name', 'Name darf nicht länger als 30 Zeichen sein.').len({ max: 30 });
    req.checkBody('email', 'E-Mail muss gefüllt und valide sein.').isEmail()
    req.checkBody('passwort', 'Passwort muss mindestens 6 Zeichen haben.').len({ min: 6 });
    req.checkBody('passwort2', 'Passwörter müssen übereinstimmen.').equals(req.body.passwort);

    var errors = req.validationErrors();
    if (errors) {
        res.render('register', {
            errors: errors
        });
    } else {
        var mitarbeiter = {
            personalnummer: req.body.personalnummer,
            name: req.body.name,
            vorname: req.body.vorname,
            anrede: req.body.anrede,
            email: req.body.email,
            passwort: req.body.passwort
        };

        User.createMitarbeiter(mitarbeiter, (err, result) => {
            if (err) {
                if (err.errno == 1062) {
                    req.flash('error_msg', 'Der Mitarbeiter ist schon registriert.');
                } else {
                    req.flash('error_msg', err.message);
                }
                res.redirect('register');
            } else {
                req.flash('success_msg', 'Sie sind registriert und können sich jetzt einloggen.');
                res.redirect('/users/login');
            }
        });
    }
});

passport.use(new LocalStrategy(
    function(personalnummer, passwort, done) {
        User.getMitarbeiterByPersonalnummer(personalnummer, (err, mitarbeiter) => {
            if(err) throw err;
            if(!mitarbeiter[0]){
                return done(null, false, {message: LOGIN_FEHLER_MESSAGE});
            }

            User.comparePasswort(passwort, mitarbeiter[0].passwort, (err, isMatch) => {
                if(err) throw err;
                if(isMatch){
                    return done(null, mitarbeiter);
                }else{
                    return done(null, false, {message: LOGIN_FEHLER_MESSAGE});
                }
            })
        });
    }));

passport.serializeUser((mitarbeiter, done) => {
  done(null, mitarbeiter[0].personalnummer);
});

passport.deserializeUser((personalnummer, done) => {
  User.getMitarbeiterByPersonalnummer(personalnummer, (err, mitarbeiter) => {
    done(err, mitarbeiter);
  });
});

router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/', 
        failureRedirect: '/users/login', 
        failureFlash: true
    }),
    function (req, res) {
        res.redirect('/');
});

router.get('/logout', (req, res) =>{
    req.logout();
    req.flash('success_msg', 'Sie haben sich erfolgreich ausgeloggt.');
    res.redirect('/users/login');
})

module.exports = router;