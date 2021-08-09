'use strict';
console.log('Hello world!');

//declare the static html elements
const sideBarItemListContainer = document.querySelector('#psitems-canvas');
const searchInputField = document.getElementById('searchinput');
const selectedPclshopID = document.querySelector('#ajaxresult');

//set the global urlOptions
const urlOptions = {
  HU: {
    urlName: 'hungary',
    tld: 'com',
    language: 'HU',
    startingCoords: [47.49801, 19.03991],
  },
  RO: {
    urlName: 'romania',
    tld: 'ro',
    language: 'RO',
    startingCoords: [44.439663, 26.096306],
  },
  SI: {
    urlName: 'slovenia',
    tld: 'com',
    language: 'SI',
    startingCoords: [46.05108, 14.50513],
  },
  SK: {
    urlName: 'slovakia',
    tld: 'sk',
    language: 'SK',
    startingCoords: [48.14816, 17.10674],
  },
  HR: {
    urlName: 'croatia',
    tld: 'com',
    language: 'HR',
    startingCoords: [45.81444, 15.97798],
  },
  CZ: {
    urlName: 'czech',
    tld: 'com',
    language: 'CZ',
    startingCoords: [50.08804, 14.42076],
  },
};

//create and set the Leaflet map
const map = L.map(
  'map',
  {
    minZoom: scriptLoadOptions.minMaxZoomLevel.min,
    maxZoom: scriptLoadOptions.minMaxZoomLevel.max,
  } /*, { minZoom: 7, maxZoom: 13 }*/
).setView(
  scriptLoadOptions.startingCoords == null ? urlOptions[scriptLoadOptions.country].startingCoords : scriptLoadOptions.startingCoords,
  scriptLoadOptions.startingDefaultZoomLevel
);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

//declare the two main class
let MainMap;
let Formatter;

//Fill the Map with data and call the base functions
fetch(
  `https://online.gls-${urlOptions[scriptLoadOptions.country].urlName}.${urlOptions[scriptLoadOptions.country].tld}/psmap/psmap_getdata.php?ctrcode=${
    urlOptions[scriptLoadOptions.country].language
  }&action=getList&dropoff=1&pclshopin=1&parcellockin=1`
)
  .then((response) => response.text())
  .then((result) => {
    Formatter = new formatter();
    MainMap = new pclshopFinder(JSON.parse(result));
    MainMap.renderMarkers();
    MainMap.extendsPclShopDataArray();
    MainMap.renderListItems(MainMap.getActualShowedMarkers(), searchInputField.value);
  });

//declare the DOM events after the window is loaded
window.onload = () => {
  //Make empty the left sidebar and render the new results based on the actual map coords
  map.on('moveend', function (e) {
    sideBarItemListContainer.textContent = '';
    MainMap.renderListItems(MainMap.getActualShowedMarkers(), searchInputField.value);
  });

  //Remove the bouncing marker / effect set the global MainIcon class variable / render the Left sideBard with results
  map.on('click', (event) => {
    MainMap.selectedParcelShop = '';
    Formatter.removeAllBounceEffect(event);
    MainMap.activeIcon = null;
    MainMap.renderListItems(MainMap.getActualShowedMarkers(), searchInputField.value);
  });

  //timefired is needed for the searchInputDelay
  let timefired = null;

  //The search starts after 300 ms and if the length is >= 3
  searchInputField.onkeyup = function (event) {
    clearTimeout(timefired);
    timefired = setTimeout(function () {
      let findResult = [];

      MainMap.mainPclshopData.map((a) => {
        const address = `${a.searchValues.address.toLowerCase()} `;
        const city = `${a.searchValues.city.toLowerCase()} `;
        const name = `${a.searchValues.name.toLowerCase()} `;
        const zipcode = `${a.zipcode.toLowerCase()}`;
        const mergedSearchValue = address.concat(city, name, zipcode);

        if (mergedSearchValue.includes(`${Formatter.searchValueFormatter(event.target.value)}`) && event.target.value.length >= 3) {
          findResult.push(a);
        }
      });

      findResult = Formatter.orderListItem(findResult, Formatter.searchValueFormatter(event.target.value));

      sideBarItemListContainer.textContent = '';
      MainMap.renderListItems(findResult, searchInputField.value);
    }, 300);
  };
};

////////////////////
//SidebarFunctions//

//Remove or add the hover effect
const sidebarListItemMouseEnter = (e) => {
  if (e.target.className != 'sidebarListItem sidebarItemSelected') {
    e.target.className = 'sidebarListItem testbutton';
  }
};

//Remove or add the hover effect
const sidebarListItemMouseLeave = (e) => {
  if (e.target.className != 'sidebarListItem sidebarItemSelected') {
    e.target.className = 'sidebarListItem';
  }
};

//Close all popup first / remove the bouncing effect after when a new target has been selected
//Set the new map view over the selected parcelshop
//Set the new  active selected sidebar element class variable
const sidebarListItemClick = (event) => {
  map.closePopup();

  if (MainMap.activeIcon) {
    MainMap.activeIcon.classList.remove('markerBouncing');
  }

  let selectedPclshopObject = MainMap.mainPclshopData.find((a) => a.pclshopid === event.target.dataset.id);

  for (const property in map._layers) {
    const leafletMarker = map._layers[property];
    if (leafletMarker.options.alt === event.target.dataset.id) {
      const markerImg = leafletMarker._icon.querySelector('img');
      if (markerImg !== this.activeIcon) {
        this.activeIcon?.classList.remove('markerBouncing');
        markerImg.classList.add('markerBouncing');
      }
      MainMap.activeIcon = markerImg;
    }
  }
  map.setView([selectedPclshopObject.latlng.lat, selectedPclshopObject.latlng.lng], scriptLoadOptions.focusZoomLevel);

  //deselect the active listItem
  if (MainMap.activeListItem !== event.target && MainMap.activeListItem.className) {
    MainMap.activeListItem.className = 'sidebarListItem';
  }

  MainMap.activeListItem = event.target;
  MainMap.activeListItem.className = `sidebarListItem sidebarItemSelected`;
};

//SidebarFunctions//
////////////////////

//class components

//////////////////////////////////////////
///////// ParcelShopFinder class//////////

class pclshopFinder {
  constructor(pclshopArrayData) {
    this.selectedMarkerCoords = { lat: 0, lng: 0 };
    this.mainPclshopData = pclshopArrayData;
    this.activeIcon;
    this.activeIconID;
    this.actualMapCoords;
    this.activeListItem = false;
  }

  //render all the parcelshop's markers based on the API request
  //Prepare the popup elements, if is that enabled in the scriptLoadOption
  //declare the click event for the markers
  renderMarkers() {
    this.mainPclshopData.map((pclshopData) => {
      const marker = L.marker([pclshopData.geolat, pclshopData.geolng], {
        alt: `${pclshopData.pclshopid}`,
        icon: this.#getMarkerIcon(pclshopData.pclshopid, pclshopData.isparcellocker),
        className: `${pclshopData.geolat}-${pclshopData.geolng}`,
      }).addTo(map);

      scriptLoadOptions.isPopUpEnabled
        ? marker.bindPopup(
            this.#getPopUpHtml(pclshopData.name, pclshopData.address, pclshopData.phone, pclshopData.pclshopid, pclshopData.geolat, pclshopData.geolng)
          )
        : '';

      //Declare the Click event for the marker
      marker.on('click', (event) => {
        this.#markerClickEvent(event, marker);
      });
    });
  }

  //get the marker IMG icon with options
  #getMarkerIcon(pclshopid, isParcelLocker) {
    if (isParcelLocker) {
      console.log(pclshopid);
    }
    let parcelLockerSrc = `//online.gls-hungary.com/img/icon_parcellocker_hu.png "width="62" height="30" class=""`;
    let parcelShopSrc = `//online.gls-hungary.com/img/icon_paketshop50x38_${
      scriptLoadOptions.uiLanguage.toLowerCase() == 'hu' ? 'hu' : 'en'
    }.png " width="62" height="45" class=""`;
    const markerIcon = L.divIcon({
      iconSize: [10, 10], // size of the icon
      iconAnchor: [22, 40], // point of the icon which will correspond to marker's location
      html: `<img src="${isParcelLocker === 't' ? parcelLockerSrc : parcelShopSrc} id="${pclshopid}" >`,
    });
    return markerIcon;
  }

  //get the popupHtml element based on the arguments
  #getPopUpHtml(name, address, phone, id, lat, lng) {
    const popUpHtml = `<div class="popupDiv" id="${id}" data-lat="${lat}" data-lng="${lng}">
    <div class="popUpName">${name}</div><div class="popUpAddress">${address}</div><div class="popUpPhone">${
      phone == null ? '' : phone
    }</div><div class="openingTable"><table><thead>${
      Formatter.translateOpeningSource[scriptLoadOptions.uiLanguage].opening
    }</thead><tbody></tbody></table></div></div>`;
    return popUpHtml;
  }

  //render the openingPopUp
  #renderOpeningPopUp(openingsData) {
    const openedPopUp = document.querySelector('.leaflet-popup');
    if (document.querySelectorAll('.leaflet-popup').length == 2) {
      openedPopUp.remove();
    }
    //openedPopUp.remove();
    let finalOpeningData = Formatter.orderOpeningDays(openingsData);

    const openingBody = document.querySelector('.leaflet-popup-content-wrapper')?.querySelector('tbody');
    openingBody ? (openingBody.textContent = '') : '';
    finalOpeningData.map((dayObject, b) => {
      openingBody?.insertAdjacentHTML(
        'beforeend',
        this.#getOpeningTableElement(
          Formatter.localizeDays(scriptLoadOptions.uiLanguage, dayObject.day),
          dayObject.open === '' ? Formatter.translateOpeningSource[scriptLoadOptions.uiLanguage].closed : dayObject.open
        )
      );
    });
  }

  //get the Popup Html elemet's table div.
  #getOpeningTableElement(day, time) {
    return `<tr><td>${day}</td><td>${time}</td></tr>`;
  }

  getAsyncOpeningData(pclshopid) {
    var tokens = null;
    function getData() {
      return $.ajax({
        type: 'GET',
        url: 'https://online.gls-'
          .concat(urlOptions[scriptLoadOptions.country].urlName, '.')
          .concat(urlOptions[scriptLoadOptions.country].tld, '/psmap/psmap_getdata.php?action=getOpenings&pclshopid=')
          .concat(pclshopid),
        async: false,
        error: function error(XMLHttpRequest, textStatus, errorThrown) {
          alert('Request: ');
        },
        success: function success(result) {
          tokens = JSON.parse(result);
        },
      }).responseText;
    }

    var res = JSON.parse(getData());

    return res;
  }

  //render the left sideBar's elements based on the actual search keyword or the actually showed parcelshops
  renderListItems(findResultArray, seachKeyWord = '') {
    sideBarItemListContainer.textContent = '';

    let pclshopDataForListItemsRender = Formatter.orderListItem(findResultArray, Formatter.searchValueFormatter(seachKeyWord.toLowerCase()));

    let activePclshop = pclshopDataForListItemsRender.find((a, b) => a.pclshopid == this.activeIcon?.id);

    let indexNumberOfActivePclshopId = pclshopDataForListItemsRender.indexOf(activePclshop);
    if (indexNumberOfActivePclshopId !== -1) {
      pclshopDataForListItemsRender.splice(indexNumberOfActivePclshopId, 1);
      pclshopDataForListItemsRender.unshift(activePclshop);
    }

    pclshopDataForListItemsRender.map((a) => {
      let isItActive = a?.pclshopid == this.activeIcon?.id ? true : false;

      sideBarItemListContainer.insertAdjacentHTML(
        'beforeend',
        this.#getSidebarListElement(a.pclshopid, a.name, `${a.zipcode} ${a.city}`, a.address, { lat: a.geolat, lng: a.geolng }, isItActive)
      );
    });
    sideBarItemListContainer.scrollTo(0, 0);
  }

  //returns one the left sidebar html element based on the set arguments
  #getSidebarListElement(pclshopid, name, city, address, coords, isItSelected) {
    return `<div data-id="${pclshopid}" data-lat="${coords.lat}" data-lng="${coords.lng}" class="sidebarListItem ${
      isItSelected ? 'sidebarItemSelected' : ''
    }" style="padding: 10px; cursor: pointer" class="" onmouseover="sidebarListItemMouseEnter(event)" onmouseleave="sidebarListItemMouseLeave(event)" onclick="sidebarListItemClick(event)">
              ${name}<br>${city}<br>${address}
            </div>`;
  }

  //The click event after the click was on a parcelshop's marker
  #markerClickEvent(event, marker) {
    let clickedImgElement = event.target._icon.querySelector('img');

    //after the first load
    if (this.activeIcon == undefined) {
      clickedImgElement.classList.add('markerBouncing');
      this.activeIcon = clickedImgElement;
    } else if (this.activeIcon !== clickedImgElement) {
      this.activeIcon.classList.remove('markerBouncing');
      clickedImgElement.classList.add('markerBouncing');
      this.activeIcon = clickedImgElement;
    }
    scriptLoadOptions.startingDefaultZoomLevel;

    this.selectedMarkerCoords = event.target.getLatLng();
    map.setView(this.selectedMarkerCoords, scriptLoadOptions.focusZoomLevel);

    this.#renderOpeningPopUp(this.getAsyncOpeningData(marker.options.alt));
  }

  //extends the parcelshopObjects with more values  like:values for the search / district / marker's leaflet_id / marker's img element / marker's latlng.
  extendsPclShopDataArray() {
    let indexNumber = 0;
    for (const property in map._layers) {
      let leafletMarker = map._layers[property];
      if (leafletMarker._latlng) {
        this.mainPclshopData[indexNumber].leafletId = leafletMarker._leaflet_id;
        this.mainPclshopData[indexNumber].latlng = leafletMarker._latlng;
        this.mainPclshopData[indexNumber].imgIcon = leafletMarker._icon.querySelector('img');
        this.mainPclshopData[indexNumber].searchValues = {};
        this.mainPclshopData[indexNumber].searchValues.city = Formatter.searchValueFormatter(this.mainPclshopData[indexNumber].city).toLowerCase();
        this.mainPclshopData[indexNumber].searchValues.address = Formatter.searchValueFormatter(this.mainPclshopData[indexNumber].address).toLowerCase();
        this.mainPclshopData[indexNumber].searchValues.name = Formatter.searchValueFormatter(this.mainPclshopData[indexNumber].name).toLowerCase();

        //set district search value to the pclshopObject

        if (scriptLoadOptions.country == 'HU' && this.mainPclshopData[indexNumber].zipcode.startsWith('1')) {
          const tempZip = this.mainPclshopData[indexNumber].zipcode;
          const district = Number(tempZip[1] + tempZip[2]);
          this.mainPclshopData[indexNumber].searchValues.name = `${this.mainPclshopData[indexNumber].searchValues.name} ${district} kerulet`;
        }
        indexNumber++;
      }
    }
  }

  //get the actual displayed map top  northWest and southEast coords.
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
}
///////// ParcelShopFinder class//////////
//////////////////////////////////////////

/////////////////////////////////////////
///////// extra formatter class//////////
class formatter {
  constructor() {
    //preset values of the opening hours's language
    this.translateOpeningSource = {
      hu: {
        monday: 'Hétfő',
        tuesday: 'Kedd',
        wednesday: 'Szerda',
        thursday: 'Csütörtök',
        friday: 'Péntek',
        saturday: 'Szombat',
        sunday: 'Vasárnap',
        closed: 'Zárva',
        opening: 'Nyitvatartás',
      },
      ro: {
        monday: 'Luni',
        tuesday: 'Marţi',
        wednesday: 'Miercuri',
        thursday: 'Joi',
        friday: 'Vneri',
        saturday: 'Sîmbătă',
        sunday: 'Duminică',
        closed: 'Închis',
        opening: 'Ore de deschidere',
      },
      sk: {
        monday: 'Pondelok',
        tuesday: 'Utorok',
        wednesday: 'Streda',
        thursday: 'Štvrtok',
        friday: 'Piatok',
        saturday: 'Sobota',
        sunday: 'Nedel’a',
        closed: 'Zatvorené',
        opening: 'Otváracia doba',
      },
      si: {
        monday: 'Ponedeljek',
        tuesday: 'Torek',
        wednesday: 'Sreda',
        thursday: 'Četrtek',
        friday: 'Petek',
        saturday: 'Sobota',
        sunday: 'Nedelja',
        closed: 'Zaprto',
        opening: 'Odpiralni čas',
      },
      hr: {
        monday: 'Ponedjeljak',
        tuesday: 'Utorak',
        wednesday: 'Srijeda',
        thursday: 'Četvrtak',
        friday: 'Petak',
        saturday: 'Subota',
        sunday: 'Nedjelja',
        closed: 'Zatvoreno',
        opening: 'Radno vrijeme',
      },
      cz: {
        monday: 'Pondělí',
        tuesday: 'Úterý',
        wednesday: 'Středa',
        thursday: 'Čtvrtek',
        friday: 'Pátek',
        saturday: 'Sobota',
        sunday: 'Neděle',
        closed: 'Zavřeno',
        opening: 'Otevírací doba',
      },
      en: {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday',
        closed: 'Closed',
        opening: 'Opening hours',
      },
    };
  }

  //Somehow the openingDays comes in unordered. This function makes in order
  orderOpeningDays(openingData) {
    let openingDays = openingData;
    let sourceObj = {
      0: 'monday',
      1: 'tuesday',
      2: 'wednesday',
      3: 'thursday',
      4: 'friday',
      5: 'saturday',
      6: 'sunday',
    };

    let orderedOpeningDays = [];

    openingDays.map((a, b) => {
      orderedOpeningDays.push(openingDays.find((a) => a.day === sourceObj[b]));
    });
    return orderedOpeningDays;
  }

  //peal and format the string into an international string Example: Értékbecslő => ertekbecslo
  searchValueFormatter(string) {
    let starter = string.toLowerCase();
    starter = starter.replaceAll(/á|Â|ă|Ä|ä|â|Á/g, 'a');
    starter = starter.replaceAll(/é|É|Ě|ě/g, 'e');
    starter = starter.replaceAll(/Č|č|Ć|ć/g, 'c');
    starter = starter.replaceAll(/Ĺ|ĺ|Ľ|ľ|ǉ|ǈ/g, 'l');
    starter = starter.replaceAll(/Ț|Ť|ť|ț/g, 't');
    starter = starter.replaceAll(/Ŕ|ŕ|Ř|ř/g, 'r');
    starter = starter.replaceAll(/Ș|ș|Š|š/g, 's');
    starter = starter.replaceAll(/Ď|ď|ǅ|đ|ǆ|Đ/g, 'd');
    starter = starter.replaceAll(/Ň|ǋ|ǌ|ň/g, 'n');
    starter = starter.replaceAll(/Ý|ý/g, 'y');
    starter = starter.replaceAll(/í|Î|î|Í/g, 'i');
    starter = starter.replaceAll(/Ž|ž/g, 'z');
    starter = starter.replaceAll(/ó|Ó|Ó|ó|ö|Ö|ő|Ő|ô|Ô|õ|Õ/g, 'o');
    starter = starter.replaceAll(/ú|Ú|ü|Ü|ű|Ű|Ů|ů|û|Û|ũ|Ũ/g, 'u');
    starter = starter.replaceAll(/–|„|’|,|\.|-/g, '');

    return starter;
  }

  //Set the left sidebar's result in order based on the keyword
  orderListItem(resultObj, searchKeyword) {
    let finalArray = [];

    resultObj.map((a) => {
      a.searchValues.zipcode == searchKeyword || a.searchValues.city == searchKeyword ? finalArray.unshift(a) : finalArray.push(a);
    });
    return finalArray;
  }

  //Set the preset language of the days
  localizeDays(lng, day) {
    let language = lng.toLowerCase();
    return this.translateOpeningSource[language][day];
  }

  //remove all bounceEffect
  removeAllBounceEffect(event) {
    event.target._container.querySelector('.markerBouncing')?.classList.remove('markerBouncing');
  }
}
///////// extra formatter class//////////
/////////////////////////////////////////

//This is the function what extracts data from the app
function mainDataExtractor(event) {
  if (event.target.className.indexOf('markerBouncing') == 0 || event.target.className.indexOf('sidebarListItem') >= 0) {
    var activeParcelShopDetails = event.target.dataset.id
      ? MainMap.mainPclshopData.find((a) => a.pclshopid == event.target.dataset.id)
      : MainMap.mainPclshopData.find((a) => a.pclshopid == event.target.id);

    activeParcelShopDetails.opening = event.target.dataset.id
      ? MainMap.getAsyncOpeningData(event.target.dataset.id)
      : MainMap.getAsyncOpeningData(event.target.id);

    MainMap.selectedParcelShop = activeParcelShopDetails;
    return MainMap.selectedParcelShop;
  } else {
    return MainMap.selectedParcelShop;
  }
}
