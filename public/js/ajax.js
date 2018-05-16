// AJAX-Calls
function getUebersicht() {
    $.ajax({
        type: 'POST',
        url: '/meldungen/uebersicht',
        dataType: 'json'
    })
        .done(function (data) {
            $('#panel-body-urlaub').append('Urlaub');
            $('#panel-body-krankheit').append('Krankheit');
            $('#panel-body-sonderurlaub').append('Sonderurlaub');
        })
        .fail(function (jqXHR, textStatus, err) {
            console.log('Error: ', textStatus);
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
    $.ajax({
        type: 'GET',
        url: '/meldungen/meldungen-fuer-abteilung?abteilung=' + abteilung,
        dataType: 'json'
    })
        .done(function (data) {
            rendereKalendereintraege(data);
        })
        .fail(function (jqXHR, textStatus, err) {
            console.log('Error: ', textStatus);
        });
};

// Rendern des Seiteninhalts
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

    var text_halber_tag = meldung.halber_tag == "vorm" ? "Vormittags" : meldung.halber_tag == "nachm" ? "Nachmittags" : "";

    var tbody_halber_tag = document.createElement("td");
    tbody_halber_tag.textContent = text_halber_tag;
    tbody_tr.appendChild(tbody_halber_tag);
};

function rendereAbteilungen(abteilungen) {
    for (i = 0; i < abteilungen.length; i++) {
        var option = document.createElement("option");
        option.setAttribute("value", abteilungen[i].abteilung_nr);
        option.textContent = abteilungen[i].abteilung;
        $('#abteilung-uebersicht').append(option);
    }
};

function rendereKalendereintraege(eintraege) {
    for (i = 0; i < eintraege.length; i++) {
        var eintrag = eintraege[i];

        // Workaround End-Datum Fullcalendar
        var end = eintrag.bis_dat.split('-');
        end[2] = Number(end[2]) + 1;
        end = end.join('-');

        $('#calendar-uebersicht-mitarbeiter').fullCalendar('renderEvent', {
            title: eintrag.meldungsart + " " + eintrag.vorname + " " + eintrag.name,
            start: eintrag.vom_dat,
            end: end
        });
    }
};