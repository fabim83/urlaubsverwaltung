const Meldung = require('../models/meldung');

function ladeUebersicht(personalnummer){
    $("#tab-uebersicht").append(personalnummer);
};

function ladeHistorie(personalnummer){
    console.log('ladeHistorie');
    $("#tab-historie").append(personalnummer);
}
