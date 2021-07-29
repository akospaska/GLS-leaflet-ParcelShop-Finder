console.log('hello world');

const getPopUpHtml = (name,address,phone)=>{

  const popUpHtml = `<div class="popupDiv" id="1011-ALPHAZOOKF">
  <div class="popUpName">${name}</div>
  <div class="popUpAddress">${address}</div>
  <div class="popUpPhone">${phone}</div>
  <div class="openingTable">
    <table>
  <thead>Nyitvatartás</thead>
  <tbody>

    <tr><td>Hétfő</td><td>08:00 - 17:00</td></tr>
    <tr><td>Kedd</td><td>08:00 - 17:00</td></tr>
    <tr><td>Szerda</td><td>08:00 - 17:00</td></tr>
    <tr><td>Csütörtök</td><td>08:00 - 17:00</td></tr>
    <tr><td>Péntek</td><td>08:00 - 17:00</td></tr>
    
  </tbody>
</table>
  </div>
  </div>`

  return popUpHtml
}





var map = L.map('map').setView([47.02133,  19.56171], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
/*
L.marker([47.02133,  19.56171]).addTo(map)
    .bindPopup(getPopUpHtml())
    */
   // .openPopup();


  //  var marker = L.marker([51.505, -0.19]).addTo(map);

var myHeaders = new Headers();
myHeaders.append("Cookie", "PHPSESSID=65suvckvf8m8ol088rohc5cjt5; SRV_ID=02");

var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  redirect: 'follow'
};

fetch("https://online.gls-hungary.com/psmap/psmap_getdata.php?ctrcode=HU&action=getList&dropoff=1", requestOptions)
.then(response => response.text())
  .then(result => {


    let resultArray = JSON.parse(result)
   
  

    resultArray.map(a=>L.marker([a.geolat, a.geolng]).addTo(map).bindPopup(getPopUpHtml(a.name,a.address,a.phone)))
    
  })
  .catch(error => console.log('error', error));


  

  /*


                        var myHeaders = new Headers();
                    myHeaders.append("Cookie", "PHPSESSID=osuubidgos1fo73c961cdo3ov1; SRV_ID=01");
                    var raw = "";
                    var requestOptions = {
                      method: 'POST',
                      headers: myHeaders,
                      body: raw,
                      redirect: 'follow'
                    };
                    fetch("https://online.gls-hungary.com/psmap/psmap_getdata.php?action=getOpenings&pclshopid=6050-NOGROUPGRP02", requestOptions)
                      .then(response => response.text())
                      .then(result => console.log(result))
                      .catch(error => console.log('error', error));


  */