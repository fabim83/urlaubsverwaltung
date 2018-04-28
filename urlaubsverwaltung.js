const express = require('express');
const mysql = require('mysql');
const app = express();
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "urlaubsverwaltung_ws2015_webprogrammierung"
});
// Port
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Listing on Port ${port}`));

db.connect((err) =>{
    if(err) throw err;
    console.log('MySQL connected');
});

app.get('/lesenMitarbeiter', (req, res) =>{

});

