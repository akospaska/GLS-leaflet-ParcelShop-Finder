'use strict';
console.log('hello world');

const sideBarItemListContainer = document.querySelector('#psitems-canvas');
const parentElement = document.querySelector('.leaflet-marker-pane');
const searchInputField = document.getElementById('searchinput');
const ajaxResultTextContent = document.querySelector('#ajaxresult');

var map = L.map('map').setView([47.02133, 19.56171], 13);
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

  tryMeFunction(say) {
    console.log(this.mainPclshopData);
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
    const openingBody = document.querySelector('.leaflet-popup-content-wrapper')?.querySelector('tbody');
    openingsData.map((a, b) => {
      openingBody?.insertAdjacentHTML('beforeend', this.getOpeningTableElement(a.day, a.open));
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

  renderListItems = (findResultArray) => {
    findResultArray.map((a) => {
      let isItActive = a.pclshopid == MainMap.activeListItem.dataset?.id ? true : false;
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
    console.log(showedPclshops);
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
        // console.log(this.mainPclshopData[indexNumber]._icon);
        this.mainPclshopData[indexNumber].leafletId = leafletMarker._leaflet_id;
        this.mainPclshopData[indexNumber].latlng = leafletMarker._latlng;
        this.mainPclshopData[indexNumber].imgIcon = leafletMarker._icon.querySelector('img');

        indexNumber++;
      }
    }
  }

  revealTheSelectedPclshopID(pclshopId) {
    ajaxResultTextContent.textContent = pclshopId;
  }
}

//class component ends

//get the plcShopData and create the main class

fetch('https://online.gls-hungary.com/psmap/psmap_getdata.php?ctrcode=HU&action=getList&dropoff=1', { method: 'POST' })
  .then((response) => response.text())
  .then((result) => {
    MainMap = new pclshopFinder(JSON.parse(result));
    MainMap.renderMarkers();
    MainMap.extendsPclShopDataArray();
    // MainMap.renderListItems()
  });

//get the plcShopData and create the main class

//set all of the functions after the map loaded
var timefired = null;

window.onload = async () => {
  map.on('moveend', function (e) {
    clearTimeout(timefired);
    timefired = setTimeout(function (search) {
      sideBarItemListContainer.textContent = '';
      console.log('map is moved');

      MainMap.renderListItems(MainMap.getActualShowedMarkers());
    }, 300);
  });
  map.on('click', (event) => {
    console.log('MainMapActiveIcon is null');
    console.log(this.activeIcon);
    MainMap.removeAllBounceEffect(event);
    MainMap.activeIcon = null;
  });
  searchInputField.onkeyup = function (event) {
    clearTimeout(timefired);
    timefired = setTimeout(function (search) {
      let findResult = [];
      MainMap.mainPclshopData.map((a) => {
        const address = `${a.address.toLowerCase()} `;
        const city = `${a.city.toLowerCase()} `;
        const name = `${a.name.toLowerCase()} `;
        const zipcode = `${a.zipcode.toLowerCase()}`;
        const mergedSearchArea = address.concat(city, name, zipcode);
        if (mergedSearchArea.includes(`${event.target.value}`) && event.target.value.length >= 3) {
          findResult.push(a);
        }
      });
      sideBarItemListContainer.textContent = '';
      MainMap.renderListItems(findResult);
    }, 300);
  };

  console.log('All map event had been declared');
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
      console.log('_The actual active icon');

      console.log(MainMap.activeIcon);

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
