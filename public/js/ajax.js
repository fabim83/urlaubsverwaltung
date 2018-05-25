/**
 * AJAX-Calls
 */
function getUebersicht() {
    $.ajax({
        type: 'POST',
        url: '/meldungen/uebersicht',
        dataType: 'json'
    })
        .done(function (data) {
            rendereUebersicht(data);
        })
        .fail(function (jqXHR, textStatus, err) {
            console.log('Error: ', textStatus);
        });
};

function getResturlaub() {
    $.ajax({
        type: 'GET',
        url: '/users/resturlaub',
        dataType: 'json'
    })
        .done(function (data) {
            $('#uebersicht-resturlaub').text(data[0].urlaub_jahr);
        })
        .fail(function (jqXHR, textStatus, err) {
            console.log('Error: ', textStatus);
            $('#uebersicht-resturlaub').text(0);
        });
};

function setAnzahlOffeneMeldungen() {
    $.ajax({
        type: 'GET',
        url: '/meldungen/status?status=Offen',
        dataType: 'json'
    })
        .done(function (data) {
            $('#anz-offene-meldungen').text(data.length);
        })
        .fail(function (jqXHR, textStatus, err) {
            console.log('Error: ', textStatus);
            $('#anz-offene-meldungen').text(0);
        });
};

function getHistorie(jahr) {
    $.ajax({
        type: 'GET',
        url: '/meldungen/historie?jahr=' + jahr,
        dataType: 'json'
    })
        .done(function (data) {
            rendereHistorie(data, jahr);
        })
        .fail(function (jqXHR, textStatus, err) {
            console.log('Error: ', textStatus);
        });
};

function getOffeneMeldungen() {
    $.ajax({
        type: 'GET',
        url: '/meldungen/status?status=Offen',
        dataType: 'json'
    })
        .done(function (data) {
            rendereOffeneMeldungen(data);
        })
        .fail(function (jqXHR, textStatus, err) {
            console.log('Error: ', textStatus);
        });
};

function getAbteilungen() {
    $.ajax({
        type: 'GET',
        url: '/users/abteilungen',
        dataType: 'json'
    })
        .done(function (data) {
            rendereAbteilungen(data);
        })
        .fail(function (jqXHR, textStatus, err) {
            console.log('Error: ', textStatus);
        });
};

function getKalendereintraegeZuAbteilung(abteilung) {
    $('#calendar-uebersicht-mitarbeiter').fullCalendar('removeEvents');

    zwi_abteilung = abteilung;

    $.ajax({
        type: 'GET',
        url: '/meldungen/meldungen-fuer-abteilung?abteilung=' + abteilung,
        dataType: 'json'
    })
        .done(function (data) {
            rendereKalendereintraegeUebersichtMitarbeiter(data);
        })
        .fail(function (jqXHR, textStatus, err) {
            console.log('Error: ', textStatus);
        });
};

var zwi_abteilung;

function blaetternUebersichtMitarbeiter() {
    if (zwi_abteilung) {
        getKalendereintraegeZuAbteilung(zwi_abteilung);
    }
};

function getMeldungStornieren() {
    $.ajax({
        type: 'GET',
        url: '/meldungen/meldung-stornieren',
        dataType: 'json'
    })
        .done(function (data) {
            rendereMeldungStornieren(data);
        })
        .fail(function (jqXHR, textStatus, err) {
            console.log('Error: ', textStatus);
        });
}

function sendeJahresuebersicht() {
    $.ajax({
        type: 'POST',
        url: '/meldungen/jahresuebersicht',
        dataType: 'json'
    });
}

/**
 * Rendern des Seiteninhalts
 */
function rendereUebersicht(meldungen) {
    var anzahlUrlaubstage = 0;
    var anzahlKrankheitstage = 0;
    var anzahlSonderurlaubstage = 0;

    for (i = 0; i < meldungen.length; i++) {
        var meldung = meldungen[i];

        if (meldung.meldungsart == "Urlaub") {
            anzahlUrlaubstage += getAnzahlWerktage(new Date(meldung.vom_dat), new Date(meldung.bis_dat));
        }
        if (meldung.meldungsart == "Krankheit") {
            anzahlKrankheitstage += getAnzahlWerktage(new Date(meldung.vom_dat), new Date(meldung.bis_dat));
        }
        if (meldung.meldungsart == "Sonderurlaub") {
            anzahlSonderurlaubstage += getAnzahlWerktage(new Date(meldung.vom_dat), new Date(meldung.bis_dat));
        }

        rendereKalendereintragUebersicht(meldung);
    }

    $('#uebersicht-urlaub').text(anzahlUrlaubstage);
    $('#uebersicht-krankheit').text(anzahlKrankheitstage);
    $('#uebersicht-sonderurlaub').text(anzahlSonderurlaubstage);
};

function rendereOffeneMeldungen(meldungen) {
    $('#accordion-offene-meldungen').empty();
    for (i = 0; i < meldungen.length; i++) {
        var panel = document.createElement("div");
        panel.setAttribute("class", "panel panel-default");

        var panel_heading = document.createElement("div");
        panel_heading.setAttribute("class", "panel-heading");

        var panel_title = document.createElement("h4");
        panel_title.setAttribute("class", "panel-title");

        var link = document.createElement("a");
        link.setAttribute("data-toggle", "collapse");
        link.setAttribute("data-parent", "#accordion-offene-meldungen");
        link.setAttribute("href", "#collapse" + i);

        var collapse = document.createElement("div");
        collapse.setAttribute("id", "collapse" + i);
        if (i == 0) {
            collapse.setAttribute("class", "panel-collapse collapse in");
        } else {
            collapse.setAttribute("class", "panel-collapse collapse");
        }

        var panel_body = document.createElement("div");
        panel_body.setAttribute("class", "panel-body");

        rendereContentOffeneMeldungen(meldungen[i], link, panel_body);

        collapse.appendChild(panel_body);
        panel_title.appendChild(link);
        panel_heading.appendChild(panel_title);
        panel.appendChild(panel_heading);
        panel.appendChild(collapse);
        $('#accordion-offene-meldungen').append(panel);
    }
};

function rendereContentOffeneMeldungen(meldung, link, panel_body) {

    // Content für den Link
    var linkContent = meldung.meldungsart + "smeldung ";
    linkContent += meldung.vorname + " ";
    linkContent += meldung.name + " ";
    linkContent += "(" + meldung.personalnummer + ")";
    link.textContent = linkContent;

    // Content für den Panel-Body
    var form = document.createElement("form");
    form.setAttribute("method", "POST");
    form.setAttribute("action", "/meldungen/status-aktualisieren");
    panel_body.appendChild(form);

    // Input-Feld Meldungs-Nr
    var input_meldungsnr = document.createElement("input");
    input_meldungsnr.setAttribute("type", "hidden");
    input_meldungsnr.setAttribute("name", "meldung_nr");
    input_meldungsnr.setAttribute("value", meldung.meldung_nr);
    form.appendChild(input_meldungsnr);

    // Input-Feld E-Mail
    var input_email = document.createElement("input");
    input_email.setAttribute("type", "hidden");
    input_email.setAttribute("name", "email");
    input_email.setAttribute("value", meldung.email);
    form.appendChild(input_email);

    // Input-Feld Name
    var input_name = document.createElement("input");
    input_name.setAttribute("type", "hidden");
    input_name.setAttribute("name", "name");
    input_name.setAttribute("value", meldung.name);
    form.appendChild(input_name);

    // Input-Feld Meldungsart
    var input_meldungsart = document.createElement("input");
    input_meldungsart.setAttribute("type", "hidden");
    input_meldungsart.setAttribute("name", "meldungsart");
    input_meldungsart.setAttribute("value", meldung.meldungsart);
    form.appendChild(input_meldungsart);

    // Input-Feld Anrede
    var input_anrede = document.createElement("input");
    input_anrede.setAttribute("type", "hidden");
    input_anrede.setAttribute("name", "anrede");
    input_anrede.setAttribute("value", meldung.geschlecht);
    form.appendChild(input_anrede);

    // Tabelle
    var div_row = document.createElement("div");
    div_row.setAttribute("class", "row");
    form.appendChild(div_row);

    // Buttons
    var div_buttons = document.createElement("div");
    div_buttons.setAttribute("align", "center");
    form.appendChild(div_buttons);

    var button_genehmigen = document.createElement("input");
    button_genehmigen.setAttribute("type", "submit");
    button_genehmigen.setAttribute("name", "entscheidung")
    button_genehmigen.setAttribute("class", "btn btn-sm btn-success");
    button_genehmigen.setAttribute("value", "Genehmigen");
    div_buttons.appendChild(button_genehmigen);

    var span = document.createElement("span");
    span.setAttribute("style", "display: inline-block; width: 5px;");
    div_buttons.appendChild(span);

    var button_ablehnen = document.createElement("input");
    button_ablehnen.setAttribute("type", "submit");
    button_ablehnen.setAttribute("name", "entscheidung")
    button_ablehnen.setAttribute("class", "btn btn-sm btn-danger");
    button_ablehnen.setAttribute("value", "Ablehnen");
    div_buttons.appendChild(button_ablehnen);

    var div_col = document.createElement("div");
    div_col.setAttribute("class", "col-md-12");
    div_row.appendChild(div_col);

    var table = document.createElement("table");
    table.setAttribute("class", "table table-striped");
    div_col.appendChild(table);

    var thead = document.createElement("thead");
    table.appendChild(thead);
    var thead_tr = document.createElement("tr");
    thead.appendChild(thead_tr);

    var tbody = document.createElement("tbody");
    table.appendChild(tbody);
    var tbody_tr = document.createElement("tr");
    tbody.appendChild(tbody_tr);

    // Meldungsart
    var thead_meldungsart = document.createElement("th");
    thead_meldungsart.textContent = "Meldungsart";
    thead_tr.appendChild(thead_meldungsart);

    var tbody_meldungsart = document.createElement("td");
    tbody_meldungsart.textContent = meldung.meldungsart;
    tbody_tr.appendChild(tbody_meldungsart);

    // Vom-Dat
    var thead_vom_dat = document.createElement("th");
    thead_vom_dat.textContent = "Beginndatum";
    thead_tr.appendChild(thead_vom_dat);

    var tbody_vom_dat = document.createElement("td");
    tbody_vom_dat.textContent = meldung.vom_dat;
    tbody_tr.appendChild(tbody_vom_dat);

    // Bis-Dat
    var thead_bis_dat = document.createElement("th");
    thead_bis_dat.textContent = "Enddatum";
    thead_tr.appendChild(thead_bis_dat);

    var tbody_bis_dat = document.createElement("td");
    tbody_bis_dat.textContent = meldung.bis_dat;
    tbody_tr.appendChild(tbody_bis_dat);

    // Halber Tag
    var thead_halber_tag = document.createElement("th");
    thead_halber_tag.textContent = "Halber Tag";
    thead_tr.appendChild(thead_halber_tag);

    var tbody_halber_tag = document.createElement("td");
    tbody_halber_tag.textContent = meldung.halber_tag;
    tbody_tr.appendChild(tbody_halber_tag);
};

function rendereAbteilungen(abteilungen) {
    for (i = 0; i < abteilungen.length; i++) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.setAttribute("onclick", "getKalendereintraegeZuAbteilung(this.id);");
        a.setAttribute("id", abteilungen[i].abteilung_nr);
        a.setAttribute("href", "#");
        a.textContent = abteilungen[i].abteilung;
        li.appendChild(a);
        $('#abteilung-uebersicht').append(li);
    }
};

function rendereKalendereintraegeUebersichtMitarbeiter(eintraege) {
    for (i = 0; i < eintraege.length; i++) {
        var eintrag = eintraege[i];

        // Workaround End-Datum Fullcalendar
        var end = eintrag.bis_dat.split('-');
        end[2] = Number(end[2]) + 1;
        if (Number(end[2]) < 10) {
            end[2] = "0" + end[2];
        }
        end = end.join('-');

        $('#calendar-uebersicht-mitarbeiter').fullCalendar('renderEvent', {
            title: eintrag.meldungsart + " " + eintrag.vorname + " " + eintrag.name,
            start: eintrag.vom_dat,
            end: end,
            allDay: true,
            description: eintrag.halber_tag
        });
    }
};

function rendereKalendereintragUebersicht(eintrag) {
    // Workaround End-Datum Fullcalendar
    var end = eintrag.bis_dat.split('-');
    end[2] = Number(end[2]) + 1;
    if (Number(end[2]) < 10) {
        end[2] = "0" + end[2];
    }
    end = end.join('-');

    console.log(end);

    $('#calendar-uebersicht').fullCalendar('renderEvent', {
        title: eintrag.meldungsart,
        start: eintrag.vom_dat,
        end: end,
        allDay: true,
        description: eintrag.halber_tag
    });
};

function rendereHistorie(meldungen, jahr) {
    $('#jahr-historie').text(jahr);

    var div_row = document.createElement("div");
    div_row.setAttribute("class", "row");
    $('#table-historie').empty();
    $('#table-historie').append(div_row);

    var div_col = document.createElement("div");
    div_col.setAttribute("class", "col-md-12");
    div_row.appendChild(div_col);

    var table = document.createElement("table");
    table.setAttribute("class", "table table-bordered");
    div_col.appendChild(table);

    var thead = document.createElement("thead");
    table.appendChild(thead);
    var thead_tr = document.createElement("tr");
    thead.appendChild(thead_tr);

    var tbody = document.createElement("tbody");
    table.appendChild(tbody);

    // Meldungsart
    var thead_meldungsart = document.createElement("th");
    thead_meldungsart.textContent = "Meldungsart";
    thead_tr.appendChild(thead_meldungsart);

    // Vom-Dat
    var thead_vom_dat = document.createElement("th");
    thead_vom_dat.textContent = "Beginndatum";
    thead_tr.appendChild(thead_vom_dat);

    // Bis-Dat
    var thead_bis_dat = document.createElement("th");
    thead_bis_dat.textContent = "Enddatum";
    thead_tr.appendChild(thead_bis_dat);

    // Halber Tag
    var thead_halber_tag = document.createElement("th");
    thead_halber_tag.textContent = "Halber Tag";
    thead_tr.appendChild(thead_halber_tag);

    for (i = 0; i < meldungen.length; i++) {
        var meldung = meldungen[i];

        var tbody_tr = document.createElement("tr");
        tbody.appendChild(tbody_tr);

        var tbody_meldungsart = document.createElement("td");
        tbody_meldungsart.textContent = meldung.meldungsart;
        tbody_tr.appendChild(tbody_meldungsart);

        var tbody_vom_dat = document.createElement("td");
        tbody_vom_dat.textContent = meldung.vom_dat;
        tbody_tr.appendChild(tbody_vom_dat);

        var tbody_bis_dat = document.createElement("td");
        tbody_bis_dat.textContent = meldung.bis_dat;
        tbody_tr.appendChild(tbody_bis_dat);

        var tbody_halber_tag = document.createElement("td");
        tbody_halber_tag.textContent = meldung.halber_tag;
        tbody_tr.appendChild(tbody_halber_tag);
    }
};

function rendereMeldungStornieren(meldungen) {
    for (i = 0; i < meldungen.length; i++) {
        console.log(meldungen);
        var meldung = meldungen[i];

        var form = document.createElement("form");
        form.setAttribute("method", "POST");
        form.setAttribute("action", "/meldungen/meldung-stornieren");
        $('#panel-body-meldung-stornieren').append(form);

        // Input-Feld Meldungs-Nr
        var input_meldungsnr = document.createElement("input");
        input_meldungsnr.setAttribute("type", "hidden");
        input_meldungsnr.setAttribute("name", "meldung_nr");
        input_meldungsnr.setAttribute("value", meldung.meldung_nr);
        form.appendChild(input_meldungsnr);

        var div_input_group = document.createElement("div");
        div_input_group.setAttribute("class", "input-group");
        form.appendChild(div_input_group);

        var input = document.createElement("input");
        input.setAttribute("type", "text");
        input.setAttribute("class", "form-control");
        var input_value_halber_tag = meldung.halber_tag ? " (" + meldung.halber_tag + ")" : "";
        var input_value = meldung.meldungsart + " vom " + meldung.vom_dat + " bis " + meldung.bis_dat + input_value_halber_tag;
        console.log(input_value);
        input.setAttribute("value", input_value);
        input.disabled = true;
        div_input_group.appendChild(input);

        var span_button = document.createElement("span");
        span_button.setAttribute("class", "input-group-btn");
        div_input_group.appendChild(span_button);

        var button_submit = document.createElement("button");
        button_submit.setAttribute("class", "btn btn-default");
        button_submit.setAttribute("type", "submit");
        span_button.appendChild(button_submit);

        var span_glyphicon = document.createElement("span");
        span_glyphicon.setAttribute("class", "glyphicon glyphicon-remove");
        button_submit.appendChild(span_glyphicon);
    }
};

function getAnzahlWerktage(startDate, endDate) {
    var count = 0;
    var curDate = startDate;
    while (curDate <= endDate) {
        var dayOfWeek = curDate.getDay();
        if (!((dayOfWeek == 6) || (dayOfWeek == 0))) {
            count++;
        }
        curDate.setDate(curDate.getDate() + 1);
    }
    return count;
};