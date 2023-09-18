
/*
function callEndpoint() {
    $.getJSON('http://127.0.0.1:5000/01', function(data) {
        $('#output').append(data.rows[0].user_id);
    });
}
callEndpoint();
*/


/*
function httpGet(theUrl)
{
    console.log(theUrl);
    if (window.XMLHttpRequest)
    {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp=new XMLHttpRequest();
    }
    else
    {// code for IE6, IE5
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange=function()
    {
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
            return xmlhttp.responseText;
        }
    }
    xmlhttp.open("GET", theUrl, false );
    xmlhttp.send();    
}

httpGet("https://stackoverflow.com/questions/26368306/export-is-not-recognized-as-an-internal-or-external-command")
httpGet("http://127.0.0.1:5000")*/

let response = await fetch(
    'http://127.0.0.1:5000/01',
    {
       method: 'GET',
       //mode: 'no-cors' // if i don't do this im getting fetch blocked by cors error
 });
 console.log(response);
response.text().then(function (text) {
    console.log(text);
  });