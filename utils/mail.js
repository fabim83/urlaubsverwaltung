const nodemailer = require('nodemailer');

module.exports.sendeBenachrichtigungMeldungsstatus = function(anrede, email, name, status_neu, meldungsart) {
    let transporter = nodemailer.createTransport({
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

module.exports.sendeJahresuebersicht = function(){

};