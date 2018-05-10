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

function getMitarbeiterByPersonalnummer(personalnummer) {
    var response = $.ajax({
        type: 'GET',
        url: '/users/mitarbeiter?personalnummer=' + personalnummer,
        async: false
    }).responseText;

    return JSON.parse(response);
}

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
        collapse.setAttribute("class", "panel-collapse collapse");

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
    var mitarbeiter = getMitarbeiterByPersonalnummer(meldung.personalnummer);
    if (mitarbeiter) {
        var linkContent = meldung.meldungsart + "smeldung ";
        linkContent += mitarbeiter[0].vorname + " ";
        linkContent += mitarbeiter[0].name + " ";
        linkContent += "(" + meldung.personalnummer + ")";

        link.textContent = linkContent;
    } else {
        link.textContent = meldung.personalnummer;
    }

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
    tbody_vom_dat.textContent = meldung.vom_dat.substring(0, 10);
    tbody_tr.appendChild(tbody_vom_dat);

    // Bis-Dat
    var thead_bis_dat = document.createElement("th");
    thead_bis_dat.textContent = "Enddatum";
    thead_tr.appendChild(thead_bis_dat);

    var tbody_bis_dat = document.createElement("td");
    tbody_bis_dat.textContent = meldung.bis_dat.substring(0, 10);
    tbody_tr.appendChild(tbody_bis_dat);

    // Halber Tag
    var thead_halber_tag = document.createElement("th");
    thead_halber_tag.textContent = "Halber Tag";
    thead_tr.appendChild(thead_halber_tag);

    var tbody_halber_tag = document.createElement("td");
    tbody_halber_tag.textContent = meldung.halber_tag;
    tbody_tr.appendChild(tbody_halber_tag);
};