function getUebersicht(){
    $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/meldungen/uebersicht',
        dataType: 'json'
    })
    .done(function(data){
        console.log(JSON.stringify(data, "", 2));
    })
    .fail(function(jqXHR, textStatus, err){
        console.log('Error: ', textStatus);
    })
};