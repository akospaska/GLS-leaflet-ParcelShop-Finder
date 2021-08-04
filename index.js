'use strict';
console.log('hello world');

const sideBarItemListContainer = document.querySelector('#psitems-canvas');
const parentElement = document.querySelector('.leaflet-marker-pane');
const searchInputField = document.getElementById('searchinput');
const ajaxResultTextContent = document.querySelector('#ajaxresult');

var map = L.map('map', { minZoom: 7, maxZoom: 13 }).setView([47.02133, 19.56171], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

let MainMap;

const mapmap = document.querySelector('.leaflet-map-pane');

//class component

class pclshopFinder {
  constructor(pclshopArrayData) {
    this.selectedMarkerCoords = { lat: 0, lng: 0 };
    this.mainPclshopData = pclshopArrayData;
    this.activeIcon;
    this.activeIconID;
    this.actualMapCoords;
    this.activeListItem = false;
  }

  renderMarkers() {
    const pclShopData = this.mainPclshopData;
    pclShopData.map((a) => {
      let marker = L.marker([a.geolat, a.geolng], {
        alt: `${a.pclshopid}`,
        icon: this.getMarkerIcon({ lat: a.geolat, lng: a.geolng }, a.pclshopid),
        className: `${a.geolat}-${a.geolng}`,
      })
        .addTo(map)
        .bindPopup(this.getPopUpHtml(a.name, a.address, a.phone, a.pclshopid, a.geolat, a.geolng));
      ///////////////////////////////////////
      marker.on('click', (e) => {
        this.markerClickEvent(e, marker);
      });

      ///////////////////////////////////
    });
  }
  getOpeningTableElement(day, time) {
    return `<tr><td>${day}</td><td>${time}</td></tr>`;
  }
  renderOpeningPopUp(openingsData) {
    let finalOpeningData = orderOpeningDays(openingsData);

    const openingBody = document.querySelector('.leaflet-popup-content-wrapper')?.querySelector('tbody');
    finalOpeningData.map((a, b) => {
      openingBody?.insertAdjacentHTML('beforeend', this.getOpeningTableElement(localizeDays('HU', a.day), a.open === '' ? 'Zárva' : a.open));
    });
  }
  setOrClearBounceAnimation(element) {
    element.className === 'ugralas' ? element.classList.remove('ugralas') : element.classList.add('ugralas');
  }

  markerClickEvent(e, marker) {
    MainMap.revealTheSelectedPclshopID(marker.options.alt);

    let clickedImgElement = e.target._icon.querySelector('img');

    //after the first load
    if (this.activeIcon == undefined) {
      clickedImgElement.classList.add('ugralas');
      this.activeIcon = clickedImgElement;
    } else if (this.activeIcon !== clickedImgElement) {
      this.activeIcon.classList.remove('ugralas');
      clickedImgElement.classList.add('ugralas');

      this.activeIcon = clickedImgElement;
    }

    this.selectedMarkerCoords = e.target.getLatLng();
    map.setView(this.selectedMarkerCoords, map._zoom);
    const selectedMarkerOpenings = this.getOpening(marker.options.alt);
    selectedMarkerOpenings.then((a) => {
      setTimeout(() => {
        const openingResult = [...JSON.parse(a)];

        this.renderOpeningPopUp(openingResult);
      }, 185);
    });
  }

  getPopUpHtml(name, address, phone, id, lat, lng) {
    const popUpHtml = `<div class="popupDiv" id="${id}" data-lat="${lat}" data-lng="${lng}">
    <div class="popUpName">${name}</div><div class="popUpAddress">${address}</div><div class="popUpPhone">${phone}</div><div class="openingTable"><table><thead>Nyitvatartás</thead><tbody></tbody></table></div></div>`;
    return popUpHtml;
  }
  getSidebarListElement = (pclshopid, name, city, address, coords, isItSelected) => {
    return `<div data-id="${pclshopid}" data-lat="${coords.lat}" data-lng="${coords.lng}" class="sidebarListItem ${
      isItSelected ? 'sidebarItemSelected' : ''
    }" style="padding: 10px; cursor: pointer" class="" onmouseover="sidebarListItemMouseEnter(event)" onmouseleave="sidebarListItemMouseLeave(event)" onclick="sidebarListItemClick(event)">
              ${name}<br>${city}<br>${address}
            </div>`;
  };
  getMarkerIcon(coords, pclshopid) {
    /*
    const isTheCoordsIsTheSelectedMarker = coords.lat == selectedMarkerCoords.lat && coords.lng == selectedMarkerCoords.lng ? true : false;
    const htmlClassName = isTheCoordsIsTheSelectedMarker ? 'ugralas' : '';*/

    const markerIcon = L.divIcon({
      iconSize: [10, 10], // size of the icon

      iconAnchor: [22, 40], // point of the icon which will correspond to marker's location
      html: `<img src="gls-marker.svg" width="62" height="50" class="" id="${pclshopid}" >`,
    });
    return markerIcon;
  }

  renderListItems = (findResultArray, seachKeyWord = '') => {
    sideBarItemListContainer.textContent = '';
    //let pclshopDataForRender = findResultArray;
    let pclshopDataForRender = orderListItem(findResultArray, huFormatter(seachKeyWord.toLowerCase()));

    let activePclshop = pclshopDataForRender.find((a, b) => a.pclshopid == this.activeIcon?.id);

    let indexNumberOfActivePclshopId = pclshopDataForRender.indexOf(activePclshop);
    if (indexNumberOfActivePclshopId !== -1) {
      pclshopDataForRender.splice(indexNumberOfActivePclshopId, 1);

      pclshopDataForRender.unshift(activePclshop);
    }

    pclshopDataForRender.map((a) => {
      let isItActive = a?.pclshopid == this.activeIcon?.id ? true : false;

      sideBarItemListContainer.insertAdjacentHTML(
        'beforeend',
        MainMap.getSidebarListElement(a.pclshopid, a.name, `${a.zipcode} ${a.city}`, a.address, { lat: a.geolat, lng: a.geolng }, isItActive)
      );
    });
  };

  getActualShowedMarkers() {
    let mapCorners = map.getBounds();

    let showedPclshops = this.mainPclshopData.filter(
      (a) =>
        a.geolat >= mapCorners._southWest.lat &&
        a.geolat <= mapCorners._northEast.lat &&
        a.geolng >= mapCorners._southWest.lng &&
        a.geolng <= mapCorners._northEast.lng
    );

    return showedPclshops;
  }

  async getOpening(pclshopid) {
    const rest = await fetch(`https://online.gls-hungary.com/psmap/psmap_getdata.php?action=getOpenings&pclshopid=${pclshopid}`, { method: 'POST' })
      .then((response) => response.text())
      .then((result) => result)
      .catch((error) => console.log('error', error));

    return rest;
  }
  removeAllBounceEffect(event) {
    event.target._container.querySelector('.ugralas')?.classList.remove('ugralas');
  }
  extendsPclShopDataArray() {
    let indexNumber = 0;
    for (const property in map._layers) {
      let leafletMarker = map._layers[property];
      if (leafletMarker._latlng) {
        this.mainPclshopData[indexNumber].leafletId = leafletMarker._leaflet_id;
        this.mainPclshopData[indexNumber].latlng = leafletMarker._latlng;
        this.mainPclshopData[indexNumber].imgIcon = leafletMarker._icon.querySelector('img');
        this.mainPclshopData[indexNumber].searchValues = {};
        this.mainPclshopData[indexNumber].searchValues.city = huFormatter(this.mainPclshopData[indexNumber].city).toLowerCase();
        this.mainPclshopData[indexNumber].searchValues.address = huFormatter(this.mainPclshopData[indexNumber].address).toLowerCase();
        this.mainPclshopData[indexNumber].searchValues.name = huFormatter(this.mainPclshopData[indexNumber].name).toLowerCase();

        indexNumber++;
      }
    }
  }

  revealTheSelectedPclshopID(pclshopId) {
    ajaxResultTextContent.textContent = pclshopId;
  }
}

//class component ends
// //online.gls-slovenia.com/psmap/psmap_getdata.php
//get the plcShopData and create the main class
console.log('fetchLoaded');
fetch(`https://online.gls-hungary.com/psmap/psmap_getdata.php?ctrcode=${scriptLoadOptions.language}&action=getList&dropoff=1`, { method: 'POST' })
  .then((response) => response.text())
  .then((result) => {
    MainMap = new pclshopFinder(JSON.parse(result));
    MainMap.renderMarkers();
    MainMap.extendsPclShopDataArray();
    MainMap.renderListItems(MainMap.getActualShowedMarkers(), searchInputField.value);
  });

//get the plcShopData and create the main class

//set all of the functions after the map loaded
var timefired = null;

window.onload = async () => {
  map.on('moveend', function (e) {
    /* clearTimeout(timefired);
    timefired = setTimeout(function (search) {*/
    sideBarItemListContainer.textContent = '';
    MainMap.renderListItems(MainMap.getActualShowedMarkers(), searchInputField.value);
    // }, 1);
  });
  map.on('click', (event) => {
    MainMap.removeAllBounceEffect(event);
    MainMap.activeIcon = null;
    MainMap.renderListItems(MainMap.getActualShowedMarkers(), searchInputField.value);

    MainMap.revealTheSelectedPclshopID('');
  });

  searchInputField.onkeyup = function (event) {
    clearTimeout(timefired);
    timefired = setTimeout(function (search) {
      let findResult = [];
      MainMap.mainPclshopData.map((a) => {
        const address = `${a.searchValues.address.toLowerCase()} `;
        const city = `${a.searchValues.city.toLowerCase()} `;
        const name = `${a.searchValues.name.toLowerCase()} `;
        const zipcode = `${a.zipcode.toLowerCase()}`;
        const mergedSearchArea = address.concat(city, name, zipcode);
        // const mergedSearchArea = huFormatter(address.concat(city, name, zipcode));

        if (mergedSearchArea.includes(`${huFormatter(event.target.value)}`) && event.target.value.length >= 3) {
          findResult.push(a);
        }
      });
      sideBarItemListContainer.textContent = '';
      MainMap.renderListItems(findResult, searchInputField.value);
    }, 300);
  };
};

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
  if (MainMap.activeIcon) {
    MainMap.activeIcon.classList.remove('ugralas');
  }
  MainMap.revealTheSelectedPclshopID(e.target.dataset.id);
  let x = MainMap.mainPclshopData.find((a) => a.pclshopid === e.target.dataset.id);

  for (const property in map._layers) {
    let leafletMarker = map._layers[property];
    if (leafletMarker.options.alt === e.target.dataset.id) {
      const markerImg = leafletMarker._icon.querySelector('img');
      if (markerImg !== this.activeIcon) {
        this.activeIcon?.classList.remove('ugralas');
        markerImg.classList.add('ugralas');
      }

      MainMap.activeIcon = markerImg;

      //leafletMarker.openPopUp();
      //  leafletMarker._icon.click();
    }
  }
  map.setView([x.latlng.lat, x.latlng.lng]);

  //togglePopup()
  if (MainMap.activeListItem !== e.target && MainMap.activeListItem.className) {
    MainMap.activeListItem.className = 'sidebarListItem';
  }

  MainMap.activeListItem = e.target;
  MainMap.activeListItem.className = `sidebarListItem sidebarItemSelected`;

  map.setView([Number(e.target.dataset.lat), Number(e.target.dataset.lng)], 15);
  const tempelement = document.getElementById(`${e.target.dataset.id}`);

  const divIcon = tempelement.closest('.leaflet-marker-icon');

  //x.imgIcon.click();
  //divIcon.click();
};
//getUserData

/*
 async getUserData() {
    const pos = await new Promise((resolve, reject) => {
      console.log(reject);
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    if (pos.coords) {
      return {
        long: pos.coords.longitude,
        lat: pos.coords.latitude,
      };
    }
  }



  window.onload = async () => {
  const coords = await MainMap.getUserData();
  console.log(coords);
  setMapStarterLoadPosition(coords.lat, coords.long);
  map.on('moveend', function (e) {
    console.log('I am mooving');
  });
};

const setMapStarterLoadPosition = (lat, lng) => {
  console.log(lat, lng);
  map = L.map("map").setView([lat, lng], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
};



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

/////////////////// extra formatter functions
let x = [
  {
    day: 'monday',
    open: '08:00-17:00',
    midbreak: '',
  },
  {
    day: 'thursday',
    open: '08:00-17:00',
    midbreak: '',
  },
  {
    day: 'friday',
    open: '08:00-17:00',
    midbreak: '',
  },
  {
    day: 'wednesday',
    open: '08:00-17:00',
    midbreak: '',
  },
  {
    day: 'sunday',
    open: '',
    midbreak: '',
  },
  {
    day: 'tuesday',
    open: '08:00-17:00',
    midbreak: '',
  },
  {
    day: 'saturday',
    open: '',
    midbreak: '',
  },
];

const orderOpeningDays = (openingData) => {
  let y = openingData;
  let sourceObj = { 0: 'monday', 1: 'tuesday', 2: 'wednesday', 3: 'thursday', 4: 'friday', 5: 'saturday', 6: 'sunday' };

  let finalObj = [];

  y.map((a, b) => {
    finalObj.push(y.find((a) => a.day === sourceObj[b]));
  });
  return finalObj;
};

let testString = 'ádkdjaádasd aás ásd';

const huFormatter = (string) => {
  let starter = string;
  starter = starter.replaceAll(/á|Á/g, 'a');
  starter = starter.replaceAll(/é|Á/g, 'e');
  starter = starter.replaceAll(/í|Í/g, 'i');
  starter = starter.replaceAll(/ó|Ó|ö|Ö|ő|Ő|ô|Ô|õ|Õ/g, 'o');
  starter = starter.replaceAll(/ú|Ú|ü|Ü|ű|Ű|û|Û|ũ|Ũ/g, 'u');
  starter = starter.replaceAll(/–|„|’|,|\.|-/g, ' ');

  return starter;
};

/*

á

é

í

ó
ö
ő
ô
õ

ú
ü
ű
û
ũ

–
„
’

*/

let testArray = [
  {
    pclshopid: '2750-NOGROUPGRP',
    name: 'Kevecom Számítástechnikai Üzlet - Kevecom Kft.',
    ctrcode: 'HU',
    zipcode: '2750',
    city: 'Nagykőrös',
    address: 'Kecskeméti út 7.',
    contact: 'Kis István, Nagy Adrienn',
    phone: '53/352-926',
    email: null,
    iscodhandler: 't',
    paybybankcard: 't',
    dropoffpoint: 't',
    geolat: '47.0315',
    geolng: '19.7827',
    owner: 'GLS',
    isparcellocker: 'f',
    vendor_url: null,
    pcl_pickup_time: '13:30-14:00',
    info: null,
    holidaystarts: null,
    holidayends: null,
    leafletId: 667,
    latlng: {
      lat: 47.0315,
      lng: 19.7827,
    },
    imgIcon: {},
    searchValues: {
      city: 'nagykoros',
      address: 'kecskemeti ut 7 ',
      name: 'kevecom szamitastechnikai uzlet   kevecom kft ',
    },
  },
  {
    pclshopid: '6000-CSOMAGPONT03',
    name: 'Szigma Trade Kft ',
    ctrcode: 'HU',
    zipcode: '6000',
    city: 'Kecskemét',
    address: 'Batthyány utca 27.',
    contact: 'Tapodi Roland',
    phone: '0676-321187',
    email: null,
    iscodhandler: 't',
    paybybankcard: 't',
    dropoffpoint: 't',
    geolat: '46.9021',
    geolng: '19.6897',
    owner: 'GLS',
    isparcellocker: 'f',
    vendor_url: null,
    pcl_pickup_time: '14:00',
    info: null,
    holidaystarts: null,
    holidayends: null,
    leafletId: 1273,
    latlng: {
      lat: 46.9021,
      lng: 19.6897,
    },
    imgIcon: {},
    searchValues: {
      city: 'kecskemet',
      address: 'batthyany utca 27 ',
      name: 'szigma trade kft ',
    },
  },
  {
    pclshopid: '6000-CSOMAGPONT',
    name: 'Konzol City Videójáték Szaküzlet',
    ctrcode: 'HU',
    zipcode: '6000',
    city: 'Kecskemét',
    address: 'Jókai utca 36.',
    contact: 'Csitári Zoltán',
    phone: '06-30/735-8038',
    email: null,
    iscodhandler: 't',
    paybybankcard: 't',
    dropoffpoint: 't',
    geolat: '46.914',
    geolng: '19.6891',
    owner: 'GLS',
    isparcellocker: 'f',
    vendor_url: 'www.konzolcity.hu',
    pcl_pickup_time: '14:00-15:00',
    info: null,
    holidaystarts: null,
    holidayends: null,
    leafletId: 1275,
    latlng: {
      lat: 46.914,
      lng: 19.6891,
    },
    imgIcon: {},
    searchValues: {
      city: 'kecskemet',
      address: 'jokai utca 36 ',
      name: 'konzol city videojatek szakuzlet',
    },
  },
  {
    pclshopid: '6000-CSOMAGPONT04',
    name: '1 percenet-Kulcsmásoló Ebédidő 13:00-14:00',
    ctrcode: 'HU',
    zipcode: '6000',
    city: 'Kecskemét',
    address: 'Hornyik János körút 1.',
    contact: 'Pál László',
    phone: '+36 30 460 0148',
    email: null,
    iscodhandler: 't',
    paybybankcard: 't',
    dropoffpoint: 't',
    geolat: '46.9094',
    geolng: '19.6907',
    owner: 'GLS',
    isparcellocker: 'f',
    vendor_url: null,
    pcl_pickup_time: '14:00-15:00',
    info: null,
    holidaystarts: null,
    holidayends: null,
    leafletId: 1277,
    latlng: {
      lat: 46.9094,
      lng: 19.6907,
    },
    imgIcon: {},
    searchValues: {
      city: 'kecskemet',
      address: 'hornyik janos korut 1 ',
      name: '1 percenet kulcsmasolo ebedido 13:00 14:00',
    },
  },
  {
    pclshopid: '6000-NOVEXBIZTO',
    name: 'Novex-Kecskemét',
    ctrcode: 'HU',
    zipcode: '6000',
    city: 'Kecskemét',
    address: 'Dózsa György út 18.',
    contact: 'Kelő István ',
    phone: '06 30 913-6006',
    email: 'kecskemet@novex.hu',
    iscodhandler: 't',
    paybybankcard: 't',
    dropoffpoint: 't',
    geolat: '46.9008',
    geolng: '19.6804',
    owner: 'GLS',
    isparcellocker: 'f',
    vendor_url: null,
    pcl_pickup_time: '14:00-15:00',
    info: null,
    holidaystarts: null,
    holidayends: null,
    leafletId: 1279,
    latlng: {
      lat: 46.9008,
      lng: 19.6804,
    },
    imgIcon: {},
    searchValues: {
      city: 'kecskemet',
      address: 'dozsa gyorgy ut 18 ',
      name: 'novex kecskemet',
    },
  },
  {
    pclshopid: '6000-CSOMAGPONT01',
    name: 'Lénia Papír-Írószer és Nyomtatványbolt',
    ctrcode: 'HU',
    zipcode: '6000',
    city: 'Kecskemét',
    address: 'Akadémia Krt. 63.',
    contact: 'Sorbán Irén',
    phone: '20/463-7224',
    email: 'leniapapir@gmail.com',
    iscodhandler: 't',
    paybybankcard: 't',
    dropoffpoint: 't',
    geolat: '46.9124',
    geolng: '19.673',
    owner: 'GLS',
    isparcellocker: 'f',
    vendor_url: null,
    pcl_pickup_time: '15:00-16:00',
    info: null,
    holidaystarts: null,
    holidayends: null,
    leafletId: 1281,
    latlng: {
      lat: 46.9124,
      lng: 19.673,
    },
    imgIcon: {},
    searchValues: {
      city: 'kecskemet',
      address: 'akademia krt  63 ',
      name: 'lenia papir iroszer es nyomtatvanybolt',
    },
  },
  {
    pclshopid: '6000-NOGROUPGRP03',
    name: 'Gere Hangszerüzlet ',
    ctrcode: 'HU',
    zipcode: '6000',
    city: 'Kecskemét',
    address: 'Izsáki u. 2.',
    contact: 'Gere Sándor',
    phone: '76/417-603',
    email: 'sanyi@gerehangszer.axelero.net',
    iscodhandler: 't',
    paybybankcard: 't',
    dropoffpoint: 't',
    geolat: '46.8993',
    geolng: '19.677',
    owner: 'GLS',
    isparcellocker: 'f',
    vendor_url: null,
    pcl_pickup_time: '15:30-16:00',
    info: null,
    holidaystarts: null,
    holidayends: null,
    leafletId: 1283,
    latlng: {
      lat: 46.8993,
      lng: 19.677,
    },
    imgIcon: {},
    searchValues: {
      city: 'kecskemet',
      address: 'izsaki u  2 ',
      name: 'gere hangszeruzlet ',
    },
  },
  {
    pclshopid: '6000-CSOMAGPONT08',
    name: 'Kaptafa cipőjavító, kulcsmásoló-csak készpénzes fizetés vagy azonnali átutalás lehetséges',
    ctrcode: 'HU',
    zipcode: '6000',
    city: 'Kecskemét',
    address: 'Deák Ferenc tér 6',
    contact: 'Szalontai Zoltán',
    phone: '+36705129070',
    email: ' ',
    iscodhandler: 't',
    paybybankcard: 'f',
    dropoffpoint: 't',
    geolat: '46.9056',
    geolng: '19.6896',
    owner: 'GLS',
    isparcellocker: 'f',
    vendor_url: null,
    pcl_pickup_time: '15:00-16:00',
    info: null,
    holidaystarts: null,
    holidayends: null,
    leafletId: 1285,
    latlng: {
      lat: 46.9056,
      lng: 19.6896,
    },
    imgIcon: {},
    searchValues: {
      city: 'kecskemet',
      address: 'deak ferenc ter 6',
      name: 'kaptafa cipojavito  kulcsmasolo csak keszpenzes fizetes vagy azonnali atutalas lehetseges',
    },
  },
  {
    pclshopid: '6000-BORHALOKEC01',
    name: 'Borháló Kecskemét',
    ctrcode: 'HU',
    zipcode: '6000',
    city: 'Kecskemét',
    address: 'Hoffmann János utca 3/1.',
    contact: 'Kutas Kinga',
    phone: '30/891-4845',
    email: null,
    iscodhandler: 't',
    paybybankcard: 't',
    dropoffpoint: 't',
    geolat: '46.9076',
    geolng: '19.6876',
    owner: 'GLS',
    isparcellocker: 'f',
    vendor_url: null,
    pcl_pickup_time: '14:00-15:00',
    info: null,
    holidaystarts: null,
    holidayends: null,
    leafletId: 1287,
    latlng: {
      lat: 46.9076,
      lng: 19.6876,
    },
    imgIcon: {},
    searchValues: {
      city: 'kecskemet',
      address: 'hoffmann janos utca 3/1 ',
      name: 'borhalo kecskemet',
    },
  },
  {
    pclshopid: '6000-CSOMAGPONT07',
    name: 'Mindenes Bolt/9:00-13:30ig zárva',
    ctrcode: 'HU',
    zipcode: '6000',
    city: 'Kecskemét',
    address: 'Irinyi u. 48-50',
    contact: null,
    phone: '06308893030',
    email: null,
    iscodhandler: 't',
    paybybankcard: 't',
    dropoffpoint: 't',
    geolat: '46.9177',
    geolng: '19.6763',
    owner: 'GLS',
    isparcellocker: 'f',
    vendor_url: null,
    pcl_pickup_time: '14:00-15:00',
    info: null,
    holidaystarts: null,
    holidayends: null,
    leafletId: 1289,
    latlng: {
      lat: 46.9177,
      lng: 19.6763,
    },
    imgIcon: {},
    searchValues: {
      city: 'kecskemet',
      address: 'irinyi u  48 50',
      name: 'mindenes bolt/9:00 13:30ig zarva',
    },
  },
  {
    pclshopid: '6000-NOGROUPGRP04',
    name: 'Primo Reklám KKT',
    ctrcode: 'HU',
    zipcode: '6000',
    city: 'Kecskemét',
    address: 'Fecske 13.',
    contact: 'Berente Imre',
    phone: '06-30-680-0799',
    email: 'primo@primoreklam.hu',
    iscodhandler: 't',
    paybybankcard: 't',
    dropoffpoint: 't',
    geolat: '46.9072',
    geolng: '19.7',
    owner: 'GLS',
    isparcellocker: 'f',
    vendor_url: null,
    pcl_pickup_time: '15:30-16:00',
    info: null,
    holidaystarts: null,
    holidayends: null,
    leafletId: 1291,
    latlng: {
      lat: 46.9072,
      lng: 19.7,
    },
    imgIcon: {},
    searchValues: {
      city: 'kecskemet',
      address: 'fecske 13 ',
      name: 'primo reklam kkt',
    },
  },
  {
    pclshopid: '6000-NOGROUPGRP07',
    name: 'GLS Depó 60. CsP',
    ctrcode: 'HU',
    zipcode: '6000',
    city: 'Kecskemét',
    address: 'Klebersberg K. 21.',
    contact: 'Juhász Sándor',
    phone: '30/958-0323',
    email: 'd60@gls-hungary.com',
    iscodhandler: 't',
    paybybankcard: 't',
    dropoffpoint: 't',
    geolat: '46.8968',
    geolng: '19.7307',
    owner: 'GLS',
    isparcellocker: 'f',
    vendor_url: null,
    pcl_pickup_time: '17:30-18:00',
    info: null,
    holidaystarts: null,
    holidayends: null,
    leafletId: 1293,
    latlng: {
      lat: 46.8968,
      lng: 19.7307,
    },
    imgIcon: {},
    searchValues: {
      city: 'kecskemet',
      address: 'klebersberg k  21 ',
      name: 'gls depo 60  csp',
    },
  },
  {
    pclshopid: '6060-CSOMAGPONT',
    name: 'Kerekdombi ABC',
    ctrcode: 'HU',
    zipcode: '6060',
    city: 'Tiszakécske',
    address: 'Zsálya utca 22',
    contact: null,
    phone: '0670/500-66-16',
    email: null,
    iscodhandler: 't',
    paybybankcard: 't',
    dropoffpoint: 't',
    geolat: '46.9047',
    geolng: '20.0501',
    owner: 'GLS',
    isparcellocker: 'f',
    vendor_url: null,
    pcl_pickup_time: '15:00-15:30',
    info: null,
    holidaystarts: null,
    holidayends: null,
    leafletId: 1299,
    latlng: {
      lat: 46.9047,
      lng: 20.0501,
    },
    imgIcon: {},
    searchValues: {
      city: 'tiszakecske',
      address: 'zsalya utca 22',
      name: 'kerekdombi abc',
    },
  },
  {
    pclshopid: '6060-CSOMAGPONT01',
    name: 'Mini Agro Centrum',
    ctrcode: 'HU',
    zipcode: '6060',
    city: 'Tiszakécske',
    address: 'Szolnoki u. 15.',
    contact: 'Zana Tamás',
    phone: '0670/33-22-145',
    email: null,
    iscodhandler: 't',
    paybybankcard: 't',
    dropoffpoint: 't',
    geolat: '46.9376',
    geolng: '20.097',
    owner: 'GLS',
    isparcellocker: 'f',
    vendor_url: null,
    pcl_pickup_time: '14:00-15:00',
    info: null,
    holidaystarts: null,
    holidayends: null,
    leafletId: 1301,
    latlng: {
      lat: 46.9376,
      lng: 20.097,
    },
    imgIcon: {},
    searchValues: {
      city: 'tiszakecske',
      address: 'szolnoki u  15 ',
      name: 'mini agro centrum',
    },
  },
];

const orderListItem = (resultObj, searchKeyword) => {
  //push a végére
  //unshift az elejére
  let finalArray = [];

  resultObj.map((a) => {
    a.searchValues.zipcode == searchKeyword || a.searchValues.city == searchKeyword ? finalArray.unshift(a) : finalArray.push(a);
  });
  return finalArray;
};

let nam1 = 'Coop 503';
let nam2 = 'Coop 812';
let nam3 = 'UNIO COOP ZRT.';

const language = 'HU';

const daysDictionary = {
  hu: {
    monday: 'Hétfő',
    tuesday: 'Kedd',
    wednesday: 'Szerda',
    thursday: 'Csütörtök',
    friday: 'Péntek',
    saturday: 'Szombat',
    sunday: 'Vasárnap',
  },
};

const localizeDays = (lng, day) => {
  let language = lng.toLowerCase();

  return daysDictionary[language][day];
};
