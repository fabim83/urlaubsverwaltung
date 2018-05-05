function getUebersicht() {
    $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/meldungen/uebersicht',
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
        url: 'http://localhost:3000/meldungen/status?status=Offen',
        dataType: 'json'
    })
        .done(function (data) {
            $('#anz-offene-meldungen').append(data.length);
        })
        .fail(function (jqXHR, textStatus, err) {
            console.log('Error: ', textStatus);
            $('#anz-offene-meldungen').append(0);
        });
};

function getOffeneMeldungen() {
    $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/meldungen/status?status=Offen',
        dataType: 'json'
    })
        .done(function (data) {
            rendereOffeneMeldungen(data);
        })
        .fail(function (jqXHR, textStatus, err) {
            console.log('Error: ', textStatus);
        });
};

function rendereOffeneMeldungen(meldungen) {
    for (i = 0; i < meldungen.length; i++) {
        var panel = document.createElement("div");
        panel.setAttribute("class", "panel panel-default");

        var panel_heading = document.createElement("div");
        panel_heading.setAttribute("class", "panel-heading");

        var panel_title = document.createElement("h4");
        panel_title.setAttribute("class", "panel-title");

        var link = document.createElement("a");
        link.setAttribute("data-toggle", "collapse");
        link.setAttribute("data-parent", "#accordion");
        link.setAttribute("href", "#collapse" + i);
        link.textContent = meldungen[i].personalnummer;

        var collapse = document.createElement("div");
        collapse.setAttribute("id", "collapse" + i);
        collapse.setAttribute("class", "panel-collapse collapse");

        var panel_body = document.createElement("div");
        panel_body.setAttribute("class", "panel-body");
        panel_body.textContent = meldungen[i];

        collapse.appendChild(panel_body);
        panel_title.appendChild(link);
        panel_heading.appendChild(panel_title);
        panel.appendChild(panel_heading);
        panel.appendChild(collapse);
        $('#accordion').append(panel);
    }
};