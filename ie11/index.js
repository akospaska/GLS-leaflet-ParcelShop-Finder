//transpile the file with npm run watch
/*! (c) Thank you Andrea Giammarchi !- ISC */
var selectedPclshopID = document.querySelector('#ajaxresult');
var self = this || {};
try {
  self.WeakSet = WeakSet;
} catch (t) {
  !(function (e) {
    var s = new e(),
      t = n.prototype;
    function n(t) {
      'use strict';
      s.set(this, new e()), t && t.forEach(this.add, this);
    }
    (t.add = function (t) {
      return s.get(this).set(t, 1), this;
    }),
      (t.delete = function (t) {
        return s.get(this).delete(t);
      }),
      (t.has = function (t) {
        return s.get(this).has(t);
      }),
      (self.WeakSet = n);
  })(WeakMap);
}
/*! (c) Thank you Andrea Giammarchi !- ISC */
('use strict');
console.clear();

var _this = void 0;

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ('value' in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _classPrivateMethodGet(receiver, privateSet, fn) {
  if (!privateSet.has(receiver)) {
    throw new TypeError('attempted to get private field on non-instance');
  }
  return fn;
}

console.log('Hello world!');

var sideBarItemListContainer = document.querySelector('#psitems-canvas');
var searchInputField = document.getElementById('searchinput');

var tokens = null;

function getData() {
  return $.ajax({
    type: 'GET',
    url: 'https://online.gls-hungary.com/psmap/psmap_getdata.php?action=getOpenings&pclshopid=1051-CSOMAGPONT01',
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
/////////////////////////////////////////////////////////////////////////////

var urlOptions = {
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
var map = L.map(
  'map',
  {
    minZoom: scriptLoadOptions.minMaxZoomLevel.min,
    maxZoom: scriptLoadOptions.minMaxZoomLevel.max,
  }
  /*, { minZoom: 7, maxZoom: 13 }*/
).setView(
  scriptLoadOptions.startingCoords == null ? urlOptions[scriptLoadOptions.country].startingCoords : scriptLoadOptions.startingCoords,
  scriptLoadOptions.startingDefaultZoomLevel
);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);
var MainMap;
var Formatter;
$(function () {
  $.ajax({
    type: 'GET',
    url: 'https://online.gls-'
      .concat(urlOptions[scriptLoadOptions.country].urlName, '.')
      .concat(urlOptions[scriptLoadOptions.country].tld, '/psmap/psmap_getdata.php?ctrcode=')
      .concat(urlOptions[scriptLoadOptions.country].language, '&action=getList&dropoff=1'),
    success: function success(data) {
      var result = JSON.parse(data);
      Formatter = new formatter();
      MainMap = new pclshopFinder(result);
      MainMap.renderMarkers();
      MainMap.extendsPclShopDataArray();
      MainMap.renderListItems(MainMap.getActualShowedMarkers(), searchInputField.value);
    },
  });
});

window.onload = function () {
  map.on('moveend', function (e) {
    sideBarItemListContainer.textContent = '';
    MainMap.renderListItems(MainMap.getActualShowedMarkers(), searchInputField.value);
  });
  map.on('click', function (event) {
    MainMap.selectedParcelShop = '';
    Formatter.removeAllBounceEffect(event);
    MainMap.activeIcon = null;
    MainMap.renderListItems(MainMap.getActualShowedMarkers(), searchInputField.value);
    MainMap.revealTheSelectedPclshopID('');
  });

  //timefired is needed for the searchInputDelay
  var timefired = null;

  searchInputField.onkeyup = function (event) {
    clearTimeout(timefired);
    timefired = setTimeout(function () {
      var findResult = [];
      MainMap.mainPclshopData.map(function (a) {
        var address = ''.concat(a.searchValues.address.toLowerCase(), ' ');
        var city = ''.concat(a.searchValues.city.toLowerCase(), ' ');
        var name = ''.concat(a.searchValues.name.toLowerCase(), ' ');
        var zipcode = ''.concat(a.zipcode.toLowerCase());
        var mergedSearchValue = address.concat(city, name, zipcode);

        if (mergedSearchValue.indexOf(''.concat(Formatter.searchValueFormatter(event.target.value))) >= 0 && event.target.value.length >= 3) {
          findResult.push(a);
        }
      });
      findResult = Formatter.orderListItem(findResult, Formatter.searchValueFormatter(event.target.value));
      sideBarItemListContainer.textContent = '';
      MainMap.renderListItems(findResult, searchInputField.value); //  findResult[0] === undefined ? '' : map.setView([findResult[0].latlng.lat, findResult[0].latlng.lng], scriptLoadOptions.startingDefaultZoomLevel);
    }, 300);
  };
}; ////////////////////
//SidebarFunctions//

var sidebarListItemMouseEnter = function sidebarListItemMouseEnter(e) {
  if (e.target.className != 'sidebarListItem sidebarItemSelected') {
    e.target.className = 'sidebarListItem testbutton';
  }
};

var sidebarListItemMouseLeave = function sidebarListItemMouseLeave(e) {
  if (e.target.className != 'sidebarListItem sidebarItemSelected') {
    e.target.className = 'sidebarListItem';
  }
};

var sidebarListItemClick = function sidebarListItemClick(event) {
  map.closePopup();

  if (MainMap.activeIcon) {
    MainMap.activeIcon.classList.remove('markerBouncing');
  }

  MainMap.revealTheSelectedPclshopID(event.target.dataset.id); //find refactor

  var selectedPclshopObject = MainMap.mainPclshopData.filter(function (x) {
    return x.pclshopid === event.target.dataset.id;
  })[0];

  for (var property in map._layers) {
    var leafletMarker = map._layers[property];

    if (leafletMarker.options.alt === event.target.dataset.id) {
      var markerImg = leafletMarker._icon.querySelector('img');

      if (markerImg !== MainMap.activeIcon) {
        var _this$activeIcon;

        (_this$activeIcon = MainMap.activeIcon) === null || _this$activeIcon === 0 ? 0 : ''; // MainMap.activeIcon.classList.remove('markerBouncing');
        markerImg.classList.add('markerBouncing');
      }

      MainMap.activeIcon = markerImg;
    }
  }

  map.setView([selectedPclshopObject.latlng.lat, selectedPclshopObject.latlng.lng], scriptLoadOptions.focusZoomLevel); //deselect the active listItem

  if (MainMap.activeListItem !== event.target && MainMap.activeListItem.className) {
    MainMap.activeListItem.className = 'sidebarListItem';
  }

  MainMap.activeListItem = event.target;
  MainMap.activeListItem.className = 'sidebarListItem sidebarItemSelected'; // map.setView([Number(event.target.dataset.lat), Number(event.target.dataset.lng)], scriptLoadOptions.focusZoomLevel);
}; //SidebarFunctions//
////////////////////
//class components
//////////////////////////////////////////
///////// ParcelShopFinder class//////////

var _getMarkerIcon = /*#__PURE__*/ new WeakSet();

var _getPopUpHtml = /*#__PURE__*/ new WeakSet();

var _renderOpeningPopUp = /*#__PURE__*/ new WeakSet();

var _getOpeningTableElement = /*#__PURE__*/ new WeakSet();

var _markerClickEvent = /*#__PURE__*/ new WeakSet();

var pclshopFinder = /*#__PURE__*/ (function () {
  function pclshopFinder(pclshopArrayData) {
    _classCallCheck(this, pclshopFinder);

    _markerClickEvent.add(this);

    _getOpeningTableElement.add(this);

    _renderOpeningPopUp.add(this);

    _getPopUpHtml.add(this);

    _getMarkerIcon.add(this);

    this.selectedMarkerCoords = {
      lat: 0,
      lng: 0,
    };
    this.mainPclshopData = pclshopArrayData;
    this.activeIcon;
    this.activeIconID;
    this.actualMapCoords;
    this.activeListItem = false;
    this.selectedParcelShop = '';
  }

  _createClass(pclshopFinder, [
    {
      key: 'renderMarkers',
      value: function renderMarkers() {
        var _this2 = this;

        this.mainPclshopData.map(function (pclshopData) {
          var marker = L.marker([pclshopData.geolat, pclshopData.geolng], {
            alt: ''.concat(pclshopData.pclshopid),
            icon: _classPrivateMethodGet(_this2, _getMarkerIcon, _getMarkerIcon2).call(_this2, pclshopData.pclshopid, pclshopData.isparcellocker),
            className: ''.concat(pclshopData.geolat, '-').concat(pclshopData.geolng),
          }).addTo(map);
          scriptLoadOptions.isPopUpEnabled
            ? marker.bindPopup(
                _classPrivateMethodGet(_this2, _getPopUpHtml, _getPopUpHtml2).call(
                  _this2,
                  pclshopData.name,
                  pclshopData.address,
                  pclshopData.phone,
                  pclshopData.pclshopid,
                  pclshopData.geolat,
                  pclshopData.geolng
                )
              )
            : ''; //Declare the Click event for the marker

          marker.on('click', function (event) {
            _classPrivateMethodGet(_this2, _markerClickEvent, _markerClickEvent2).call(_this2, event, marker);
          });
        });
      },
    },
    {
      key: 'getOpeningData',
      ////////////////

      value: function getOpeningData(pclshopid) {
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
      },
    },
    {
      key: 'renderListItems',
      value: function renderListItems(findResultArray) {
        var _this3 = this;

        var seachKeyWord = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
        sideBarItemListContainer.textContent = ''; //let pclshopDataForRender = findResultArray;

        var pclshopDataForListItemsRender = Formatter.orderListItem(findResultArray, Formatter.searchValueFormatter(seachKeyWord.toLowerCase())); //find refactor
        var activePclshop = pclshopDataForListItemsRender.filter(function (x) {
          var _this$activeIcon2;

          return x.pclshopid == MainMap.activeIconID;
        })[0];
        var indexNumberOfActivePclshopId = pclshopDataForListItemsRender.indexOf(activePclshop);

        if (indexNumberOfActivePclshopId !== -1) {
          pclshopDataForListItemsRender.splice(indexNumberOfActivePclshopId, 1);
          pclshopDataForListItemsRender.unshift(activePclshop);
        }
        pclshopDataForListItemsRender.map(function (a) {
          var _this3$activeIcon;

          var isItActive =
            (a === null || a === void 0 ? void 0 : a.pclshopid) ==
            ((_this3$activeIcon = _this3.activeIcon) === null || _this3$activeIcon === void 0 ? void 0 : _this3$activeIcon.id)
              ? true
              : false;
          sideBarItemListContainer.insertAdjacentHTML(
            'beforeend',
            MainMap.getSidebarListElement(
              a.pclshopid,
              a.name,
              ''.concat(a.zipcode, ' ').concat(a.city),
              a.address,
              {
                lat: a.geolat,
                lng: a.geolng,
              },
              isItActive
            )
          );
        });
      },
    },
    {
      key: 'getSidebarListElement',
      value: function getSidebarListElement(pclshopid, name, city, address, coords, isItSelected) {
        return '<div data-id="'
          .concat(pclshopid, '" data-lat="')
          .concat(coords.lat, '" data-lng="')
          .concat(coords.lng, '" class="sidebarListItem ')
          .concat(
            isItSelected ? 'sidebarItemSelected' : '',
            '" style="padding: 10px; cursor: pointer" class="" onmouseover="sidebarListItemMouseEnter(event)" onmouseleave="sidebarListItemMouseLeave(event)" onclick="sidebarListItemClick(event)">\n              '
          )
          .concat(name, '<br>')
          .concat(city, '<br>')
          .concat(address, '\n            </div>');
      },
    },
    {
      key: 'extendsPclShopDataArray',
      value: function extendsPclShopDataArray() {
        var indexNumber = 0;

        for (var property in map._layers) {
          var leafletMarker = map._layers[property];

          if (leafletMarker._latlng) {
            this.mainPclshopData[indexNumber].leafletId = leafletMarker._leaflet_id;
            this.mainPclshopData[indexNumber].latlng = leafletMarker._latlng;
            this.mainPclshopData[indexNumber].imgIcon = leafletMarker._icon.querySelector('img');
            this.mainPclshopData[indexNumber].searchValues = {};
            this.mainPclshopData[indexNumber].searchValues.city = Formatter.searchValueFormatter(this.mainPclshopData[indexNumber].city).toLowerCase();
            this.mainPclshopData[indexNumber].searchValues.address = Formatter.searchValueFormatter(this.mainPclshopData[indexNumber].address).toLowerCase();
            this.mainPclshopData[indexNumber].searchValues.name = Formatter.searchValueFormatter(this.mainPclshopData[indexNumber].name).toLowerCase(); //set district search value to the pclshopObject
            //  (scriptLoadOptions.country == 'HU' && this.mainPclshopData[indexNumber].zipcode.startsWith('1'))

            if (scriptLoadOptions.country == 'HU' && this.mainPclshopData[indexNumber].zipcode[0] == 1) {
              var tempZip = this.mainPclshopData[indexNumber].zipcode;
              var district = Number(tempZip[1] + tempZip[2]);
              this.mainPclshopData[indexNumber].searchValues.name = ''
                .concat(this.mainPclshopData[indexNumber].searchValues.name, ' ')
                .concat(district, ' kerulet');
            }

            indexNumber++;
          }
        }
      },
    },
    {
      key: 'revealTheSelectedPclshopID',
      value: function revealTheSelectedPclshopID(pclshopId) {
        this.activeIconID = pclshopId;
      }, //find function refactor
    },
    {
      key: 'selectedPclshopDataExtractor',
      value: function selectedPclshopDataExtractor() {
        // const selectedPclshopData = this.mainPclshopData.find((a) => a.pclshopid == MainMap?.activeIconID);
        var selectedPclshopData = this.mainPclshopData.filter(function (x) {
          var _MainMap;

          return x.pclshopid == ((_MainMap = MainMap) === null || _MainMap === void 0 ? void 0 : _MainMap.activeIconID);
        })[0];
        return selectedPclshopData;
      },
    },
    {
      key: 'getActualShowedMarkers',
      value: function getActualShowedMarkers() {
        var mapCorners = map.getBounds();
        var showedPclshops = this.mainPclshopData.filter(function (a) {
          return (
            a.geolat >= mapCorners._southWest.lat &&
            a.geolat <= mapCorners._northEast.lat &&
            a.geolng >= mapCorners._southWest.lng &&
            a.geolng <= mapCorners._northEast.lng
          );
        });
        return showedPclshops;
      },
    },
  ]);

  return pclshopFinder;
})(); ///////// ParcelShopFinder class//////////
//////////////////////////////////////////

/////////////////////////////////////////
///////// extra formatter class//////////

function _getMarkerIcon2(pclshopid, isParcelLocker) {
  var parcelLockerSrc = '//online.gls-hungary.com/img/icon_parcellocker_hu.png';
  var parcelShopSrc = '//online.gls-hungary.com/img/icon_paketshop50x38_'.concat(scriptLoadOptions.uiLanguage.toLowerCase() == 'hu' ? 'hu' : 'en', '.png');
  var markerIcon = L.divIcon({
    iconSize: [10, 10],
    // size of the icon
    iconAnchor: [22, 40],
    // point of the icon which will correspond to marker's location
    html: '<img src="'.concat(isParcelLocker === 't' ? parcelLockerSrc : parcelShopSrc, '" width="62" height="50" class="" id="').concat(pclshopid, '" >'),
  });
  return markerIcon;
}

function _getPopUpHtml2(name, address, phone, id, lat, lng) {
  var popUpHtml = '<div class="popupDiv" id="'
    .concat(id, '" data-lat="')
    .concat(lat, '" data-lng="')
    .concat(lng, '">\n    <div class="popUpName">')
    .concat(name, '</div><div class="popUpAddress">')
    .concat(address, '</div><div class="popUpPhone">')
    .concat(phone, '</div><div class="openingTable"><table><thead>')
    .concat(Formatter.translateOpeningSource[scriptLoadOptions.uiLanguage].opening, '</thead><tbody></tbody></table></div></div>');
  return popUpHtml;
}

function _renderOpeningPopUp2(openingsData) {
  var _document$querySelect,
    _this4 = this;

  var finalOpeningData = Formatter.orderOpeningDays(openingsData);
  var openingBody =
    (_document$querySelect = document.querySelector('.leaflet-popup-content-wrapper')) === null || _document$querySelect === void 0
      ? void 0
      : _document$querySelect.querySelector('tbody');
  openingBody ? (openingBody.textContent = '') : '';
  finalOpeningData.map(function (dayObject, b) {
    openingBody === null || openingBody === void 0
      ? void 0
      : openingBody.insertAdjacentHTML(
          'beforeend',
          _classPrivateMethodGet(_this4, _getOpeningTableElement, _getOpeningTableElement2).call(
            _this4,
            Formatter.localizeDays(scriptLoadOptions.uiLanguage, dayObject.day),
            dayObject.open === '' ? Formatter.translateOpeningSource[scriptLoadOptions.uiLanguage].closed : dayObject.open
          )
        );
  });
}

function _getOpeningTableElement2(day, time) {
  return '<tr><td>'.concat(day, '</td><td>').concat(time, '</td></tr>');
}

function _markerClickEvent2(event, marker) {
  var _this5 = this;

  MainMap.revealTheSelectedPclshopID(marker.options.alt); //marker.options.alt = pclshopUnique ID

  var clickedImgElement = event.target._icon.querySelector('img'); //after the first load

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
  var selectedMarkerOpenings = this.getOpeningData(marker.options.alt); //marker.options.alt = pclshopUnique ID

  setTimeout(function () {
    var openingResult = selectedMarkerOpenings;

    _classPrivateMethodGet(_this5, _renderOpeningPopUp, _renderOpeningPopUp2).call(_this5, openingResult);
  }, 185);
}

var formatter = /*#__PURE__*/ (function () {
  function formatter() {
    _classCallCheck(this, formatter);

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

  _createClass(formatter, [
    {
      key: 'orderOpeningDays',
      value: function orderOpeningDays(openingData) {
        var openingDays = openingData;
        var sourceObj = {
          0: 'monday',
          1: 'tuesday',
          2: 'wednesday',
          3: 'thursday',
          4: 'friday',
          5: 'saturday',
          6: 'sunday',
        };
        var orderedOpeningDays = []; //find refactor

        openingDays.map(function (a, b) {
          orderedOpeningDays.push(
            openingDays.filter(function (x) {
              return x.day == sourceObj[b];
            })[0]
          );
        });
        return orderedOpeningDays;
      },
    },
    {
      key: 'searchValueFormatter',
      value: function searchValueFormatter(string) {
        var starter = string.toLowerCase();
        starter = starter.replace(/á|Â|ă|Ä|ä|â|Á/g, 'a');
        starter = starter.replace(/é|É|Ě|ě/g, 'e');
        starter = starter.replace(/Č|č|Ć|ć/g, 'c');
        starter = starter.replace(/Ĺ|ĺ|Ľ|ľ|ǉ|ǈ/g, 'l');
        starter = starter.replace(/Ț|Ť|ť|ț/g, 't');
        starter = starter.replace(/Ŕ|ŕ|Ř|ř/g, 'r');
        starter = starter.replace(/Ș|ș|Š|š/g, 's');
        starter = starter.replace(/Ď|ď|ǅ|đ|ǆ|Đ/g, 'd');
        starter = starter.replace(/Ň|ǋ|ǌ|ň/g, 'n');
        starter = starter.replace(/Ý|ý/g, 'y');
        starter = starter.replace(/í|Î|î|Í/g, 'i');
        starter = starter.replace(/Ž|ž/g, 'z');
        starter = starter.replace(/ó|Ó|Ó|ó|ö|Ö|ő|Ő|ô|Ô|õ|Õ/g, 'o');
        starter = starter.replace(/ú|Ú|ü|Ü|ű|Ű|Ů|ů|û|Û|ũ|Ũ/g, 'u');
        starter = starter.replace(/–|„|’|,|\.|-/g, '');
        return starter;
      },
    },
    {
      key: 'orderListItem',
      value: function orderListItem(resultObj, searchKeyword) {
        var finalArray = [];
        resultObj.map(function (a) {
          a.searchValues.zipcode == searchKeyword || a.searchValues.city == searchKeyword ? finalArray.unshift(a) : finalArray.push(a);
        });

        return finalArray;
      },
    },
    {
      key: 'localizeDays',
      value: function localizeDays(lng, day) {
        var language = lng.toLowerCase();
        return this.translateOpeningSource[language][day];
      },
    },
    {
      key: 'removeAllBounceEffect',
      value: function removeAllBounceEffect(event) {
        var _event$target$_contai;

        (_event$target$_contai = event.target._container.querySelector('.markerBouncing')) === null || _event$target$_contai === void 0
          ? void 0
          : _event$target$_contai.classList.remove('markerBouncing');
      },
    },
  ]);

  return formatter;
})(); ///////// extra formatter class//////////
/////////////////////////////////////////

function mainDataExtractor(event) {
  if (event.target.className.indexOf('markerBouncing') == 0 || event.target.className.indexOf('sidebarListItem') >= 0) {
    var selectedPclShopData = MainMap.selectedPclshopDataExtractor(event.target);
    var activeParcelShopDetails = selectedPclShopData;
    activeParcelShopDetails.openings = MainMap.getOpeningData(selectedPclShopData.pclshopid);

    //You can work with this activeParcelShopDetails
    MainMap.selectedParcelShop = activeParcelShopDetails;
    return MainMap.selectedParcelShop;
  } else {
    return MainMap.selectedParcelShop;
  }
}
