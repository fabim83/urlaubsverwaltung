const nodemailer = require('nodemailer');

module.exports.sendeBenachrichtigungMeldungsstatus = function (anrede, email, name, status_neu, meldungsart) {
    let transporter = erzeugeTransport();

    var subject = "Ihr Antrag auf ";
    subject += meldungsart;
    subject += " wurde ";
    subject += status_neu.toLowerCase();

    var output = null;
    if (anrede == 'w') {
        output = `
            Sehr geehrte Frau ${name},
            <br/><br/>
            ihr Antrag auf ${meldungsart} wurde ${status_neu.toLowerCase()}!
            <br/><br/>
            Mit freundlichen Grüßen<br/>
            Ihre Urlaubsverwaltung
        `;
    } else {
        output = `
            Sehr geehrter Herr ${name},
            <br/><br/>
            ihr Antrag auf ${meldungsart} wurde ${status_neu.toLowerCase()}!
            <br/><br/>
            Mit freundlichen Grüßen<br/>
            Ihre Urlaubsverwaltung
        `;
    }

    let mailOptions = {
        from: '"Urlaubsverwaltung" <urlaubsverwaltung@gmx.de>',
        to: email,
        subject: subject,
        html: output
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });
};

module.exports.sendeJahresuebersicht = function (req, res, pfad) {
    let transporter = erzeugeTransport();

    var output = null;
    if (req.user[0].geschlecht == 'w') {
        output = `
            Sehr geehrte Frau ${req.user[0].name},
            <br/><br/>
            im Anhang finden Sie die angeforderte Jahresübersicht.
            <br/><br/>
            Mit freundlichen Grüßen<br/>
            Ihre Urlaubsverwaltung
        `;
    } else {
        output = `
            Sehr geehrter Herr ${req.user[0].name},
            <br/><br/>
            im Anhang finden Sie die angeforderte Jahresübersicht.
            <br/><br/>
            Mit freundlichen Grüßen<br/>
            Ihre Urlaubsverwaltung
        `;
    }

    let mailOptions = {
        from: '"Urlaubsverwaltung" <urlaubsverwaltung@gmx.de>',
        to: req.user[0].email,
        subject: 'Jahresübersicht',
        html: output,
        attachments: [{
            filename: 'Jahresuebersicht_' + req.user[0].name + '_' + new Date().getFullYear() + '.pdf',
            path: pfad,
            contentType: 'application/pdf'
        }]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.send(error);
        } else {
            res.send(info);
        }
    });
};

function erzeugeTransport() {
    return nodemailer.createTransport({
        host: 'mail.gmx.net',
        port: 587,
        secure: false,
        auth: {
            user: 'urlaubsverwaltung@gmx.de',
            pass: 'Test1234'
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};