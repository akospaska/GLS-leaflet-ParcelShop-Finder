console.log('hello world');

const sideBarItemListContainer = document.querySelector('#psitems-canvas');

const getSidebarListElement = (pclshopid, name, city, address, coords) => {
  return `<div data-id="${pclshopid}" data-lat="${coords.lat}" data-lng="${coords.lng}" class="sidebarListItem" style="padding: 10px; cursor: pointer" class="" onmouseover="sidebarListItemMouseEnter(event)" onmouseleave="sidebarListItemMouseLeave(event)" onclick="sidebarListItemClick(event)">
            ${name}<br>${city}<br>${address}
          </div>`;
};

let selectedMarkerCoords = { lat: 0, lng: 0 };

//const selectedMarkerCoords2 = { lat: 47.0241, lng: 19.5602 };

/* var greenIcon = L.icon({
  iconUrl: 'gls-marker.svg',

  iconSize: [50, 95], // size of the icon
  shadowSize: [50, 64], // size of the shadow
  iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
  shadowAnchor: [4, 62], // the same for the shadow
  popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
}); */
const tryy = { lat: 47.0241, lng: 19.5602 };
//{ lat: a.geolat, lng: a.geolng }
const getMarkerIcon = (coords, pclshopid) => {
  const isTheCoordsIsTheSelectedMarker = coords.lat == selectedMarkerCoords.lat && coords.lng == selectedMarkerCoords.lng ? true : false;
  const htmlClassName = isTheCoordsIsTheSelectedMarker ? 'ugralas' : '';

  var markerIcon = L.divIcon({
    iconSize: [50, 50], // size of the icon

    iconAnchor: [22, 40], // point of the icon which will correspond to marker's location
    html: `<img src="gls-marker.svg" width="62" height="50" class="${htmlClassName}" id="${pclshopid}" >`,
  });
  return markerIcon;
};

var greenIcon = L.divIcon({
  iconSize: [50, 50], // size of the icon

  iconAnchor: [22, 40], // point of the icon which will correspond to marker's location
  html: `<img src="gls-marker.svg" width="62" height="50" class="ugralas" >`,
});

const getPopUpHtml = (name, address, phone, id, lat, lng) => {
  const popUpHtml = `<div class="popupDiv" id="${id}" data-lat="${lat}" data-lng="${lng}">
  <div class="popUpName">${name}</div>
  <div class="popUpAddress">${address}</div>
  <div class="popUpPhone">${phone}</div>
  <div class="openingTable">
    <table>
  <thead>Nyitvatartás</thead>
  <tbody>

    
  </tbody>
</table>
  </div>
  </div>`;

  return popUpHtml;
};

//_targets
//_lastCenter

var map = L.map('map').setView([47.02133, 19.56171], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// .openPopup();

//  var marker = L.marker([51.505, -0.19]).addTo(map);

const renderMarkers = () => {
  /*  const parentElement = document.querySelector('.leaflet-marker-pane');
  const childElements = parentElement.querySelectorAll('.selected');
  console.log(childElements[0]);
  parentElement.innerHTML = '';

  parentElement.innerHTML = childElements[0]; */
  //parentElement.insertAdjacentHTML('beforeend', childElements[0]);

  const parentElement = document.querySelector('.leaflet-marker-pane');
  const tempchilds = parentElement.querySelectorAll('.selected');
  const childElements = Array.from(tempchilds);
  parentElement.innerHTML = '';

  var myHeaders = new Headers();
  myHeaders.append('Cookie', 'PHPSESSID=65suvckvf8m8ol088rohc5cjt5; SRV_ID=02');

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    redirect: 'follow',
  };
  fetch('https://online.gls-hungary.com/psmap/psmap_getdata.php?ctrcode=HU&action=getList&dropoff=1', requestOptions)
    .then((response) => response.text())
    .then((result) => {
      let resultArray = JSON.parse(result);

      let mapCorners = map.getBounds();

      const xxxx = resultArray.find((a) => a.geolat === '47.5062' && a.geolng === '19.038');
      const xxxx2 = resultArray.filter(
        (a) =>
          a.geolat >= mapCorners._southWest.lat &&
          a.geolat <= mapCorners._northEast.lat &&
          a.geolng >= mapCorners._southWest.lng &&
          a.geolng <= mapCorners._northEast.lng
      );
      sideBarItemListContainer.innerHTML = '';
      xxxx2.map((a) => {
        // var myIcon2 = L.divIcon({ className: 'animated bounce' });
        let marker = L.marker([a.geolat, a.geolng], {
          alt: `${a.pclshopid}`,
          icon: getMarkerIcon({ lat: a.geolat, lng: a.geolng }, a.pclshopid),
          className: `${a.geolat}-${a.geolng}`,
        })
          .addTo(map)
          .bindPopup(getPopUpHtml(a.name, a.address, a.phone, a.pclshopid, a.geolat, a.geolng));
        console.log({ lat: a.geolat, lng: a.geolng });
        sideBarItemListContainer.insertAdjacentHTML(
          'beforeend',
          getSidebarListElement(a.pclshopid, a.name, `${a.zipcode} ${a.city}`, a.address, { lat: a.geolat, lng: a.geolng })
        );
        console.log('before the click event created');
        marker.on('click', (e) => {
          console.log('I am triggered');
          selectedMarkerCoords.lat = e.target._latlng.lat;
          selectedMarkerCoords.lng = e.target._latlng.lng;
          map.setView(e.target.getLatLng(), map._zoom);

          //  e.target._icon.classList.add('selected');

          /*
          var wrapper = document.createElement('div');
          wrapper.classList.add('box');
          wrapper.classList.add('bounce-6');
          var myDiv = e.target._icon;
          wrapper.appendChild(myDiv.cloneNode(true));
          myDiv.parentNode.replaceChild(wrapper, myDiv);

          var wrapper2 = document.createElement('div');
          wrapper2.classList.add('stage');

          var myDiv2 = document.querySelector('.box');

          wrapper2.appendChild(myDiv2.cloneNode(true));
          myDiv2.parentNode.replaceChild(wrapper2, myDiv2);

          e.target._icon.classList.add('box');
          e.target._icon.classList.add('bounce-6');
*/
          // getOpening(marker.options.alt);
          const some = getOpening(marker.options.alt);

          some.then((a) => {
            setTimeout(() => {
              const openingBody = document.querySelector('.leaflet-popup-content-wrapper')?.querySelector('tbody');

              const openingResult = [...JSON.parse(a)];

              const renderOpening = () => {
                openingResult.map((a, b) => {
                  const getTrElement = (day, time) => `<tr><td>${day}</td><td>${time}</td></tr>`;

                  openingBody?.insertAdjacentHTML('beforeend', getTrElement(a.day, a.open));
                });
              };
              renderOpening();
            }, 185);
          });
        });
        console.log('after the click event created');
        return marker;
      });
    })
    .catch((error) => console.log('error', error));
};
console.log(document.querySelector('.leaflet-tile-pane'));
const mapbdy = document.querySelector('.leaflet-tile-pane');

mapbdy.addEventListener('click', () => {
  console.log('mpbody clicked');
});
map.on('click', (e) => {
  map.closePopup();
  console.log('mapbody clicked');
  const fakeImages = document.querySelector('.ugralas');
  fakeImages?.classList.remove('ugralas');
  const fakeImages2 = document.querySelector('.ugralas');
  fakeImages2?.classList.remove('ugralas');
  selectedMarkerCoords = { lat: 0, lng: 0 };

  /*
  const mainMapStage = document.querySelectorAll('.stage');

  const node = document.querySelector('.box');
  console.log(node.childNodes);
  node.replaceWith(...node.childNodes);
  const node2 = e.target._container;

  mainMapStage[1].replaceWith(...mainMapStage[1].childNodes);

  //bounceElement.classList.remove('box','bounce-6')*/
});

const getOpening = async (pclshopid) => {
  var myHeaders = new Headers();
  myHeaders.append('Cookie', 'PHPSESSID=osuubidgos1fo73c961cdo3ov1; SRV_ID=01');
  var raw = '';
  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  };
  const rest = await fetch(`https://online.gls-hungary.com/psmap/psmap_getdata.php?action=getOpenings&pclshopid=${pclshopid}`, requestOptions)
    .then((response) => response.text())
    .then((result) => result)
    .catch((error) => console.log('error', error));

  return rest;
};

map.on('moveend', function (e) {
  renderMarkers();
});

const sidebarListItemMouseEnter = (e) => {
  if (e.target.className != 'sidebarListItem sidebarItemSelected') {
    e.target.className = 'sidebarListItem testbutton';
  }
};

const sidebarListItemMouseLeave = (e) => {
  if (e.target.className != 'sidebarListItem sidebarItemSelected') {
    e.target.className = 'sidebarListItem';
  }
};
const sidebarListItemClick = (e) => {
  map.closePopup();
  mapbdy.click();

  e.target.className = 'sidebarListItem sidebarItemSelected';

  map.setView([Number(e.target.dataset.lat), Number(e.target.dataset.lng)], 15);
  const mapContainer = document.querySelector('.leaflet-marker-pane');

  const tempelement = document.getElementById(`${e.target.dataset.id}`);
  const divIcon = tempelement.closest('.leaflet-marker-icon');
  console.log(divIcon);

  divIcon.click();
  console.log('divicon clicked');
};
renderMarkers();
/* const some = getOpening('1011-ALPHAZOOKF');

some.then((a) => console.log([JSON.parse(a)])); */

// console.log((<any>e.layer).getLatLngs()); // polyline
// console.log((<any>e.layer).getLatLng()); // circle
// mind the s at the end of the function...

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

//  baselayerchange

// define rectangle geographical bounds
/*       var offset = map.latLngToContainerPoint([40.02133,  19.56171]);
      console.log(offset); */

const markerClickEvent = (e) => {};

const testBtn = document.querySelector('#testbutton');

testBtn.addEventListener('click', (e) => {
  console.log(e.target);
});
