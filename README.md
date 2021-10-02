## Unofficial GLS ParcelShop finder with map

---



## Please first go through the documentation.
### You can find the documentation between the files, named: GLS parcelshop finder.pdf
![alt text](https://image.ibb.co/g0SdPw/Screenshot_from_2018_01_05_11_14_40.png)
## Description
### Used for searching, displaying and selecting parcelshops on webpage of GLS customer. it is a Javascript based on Leaflet Map.

## Functions

- lt is possible to change this address dynamically
- ParcelShop can be selected from list and clicking on the map
- lt is possible to search between displayed ParcelShops
- Selecting a ParcelShop from the map or from the list will fire an event, which can supply to the
  base page of the ParcelShop ID and other data about the selected ParcelShop.
  <br>
  <br>

---

## Necessary scripts:

- GLS css: https://myfirstwebapp-siwvh.run-eu-central1.goorm.io/apirequests/pclshopfindercss
- GLS plugin: https://myfirstwebapp-siwvh.run-eu-central1.goorm.io/apirequests/pclshopfinderjs
- jQuery: https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
- Leaflet Css: https://unpkg.com/leaflet@1.6.0/dist/leaflet.css
- Leaflet JS: https://unpkg.com/leaflet@1.6.0/dist/leaflet.js

---

<br>

## How to implement?

To implement this plugin you will need a DIV with FIX size, for example:

## Body:

<br>The map should be initialized this way:

- CSS: #big-canvas{ width:600px; height:500px; }

## Div element:

![alt text](https://myfirstwebapp-siwvh.run-eu-central1.goorm.io/apirequests/pssmapscriptjpg)


---

## Parameters:

- country:The target country’s iso country code. Example: ‘HU’,’SK’,’SI’,’HR’,’RO’

- startingCoords: The preset coordinates for the first load.<br>
  By the NULL value the startingCoords will be the target country’s capital city.<br>
  Unique coords must be set in the next format: [{lat:47.525,lng:46.258}]

- startingDefaultZoomLevel: Zoom level after the first load

- minMaxZoomLevel: It is possible to set the minimum and maximum value of the zoom.
  <br> Example:{min:7,max:15}

- uiLanguage: Set the PopUp element’s preset language. Example:’hu’,’sk’,’si’,’hr’,’cz’,’ro’

- isPopUpEnabled:If the value is true, click on the marker will display a popup window,<br> if the value is
  false, the popup will not show up.

---

## How to use the selected ParcelShop data

You have to include the **mainDataExtractor(event)** function in the source of your webpage. This function returns the actually selected parcelShop data in an object.

The mainDataExtractor function works with the click event as an argument. The function triggers when the click event happens on the selected marker icon, or one of the sideBar list elements. If the click happens not on the marker icon, the active parcelshop will be DESELECTED.

The MainMap.activeIconID stores the actually selected ParcelshopID too.

---

## Parameters of the data object:

- **_address_**:The parcelshop’s address
- **_city_**: The city where the parcelshop is located.
- **_ctrcode_**:The country’s iso code where the parcelshop is located.
- **_email_**:The parcelshop’s email address.
- **_geolat_**: The geo latitude of the parcelshop
- **_geolng_**: The geo longtitudeof the parcelshop
- **_holidaystarts_**:Optional. Holds a value if the holiday is set by the parcelshop.
- **_holidayends_**:Optional. Holds a value if the holiday is set by the parcelshop.
- **_imgIcon_**:current element of the selected parcelshop on the map.
- **_info_**:Optional: It could hold additional infos about the parcelshop.
- **_iscodhandler_**:Is cash on demand avalaible. (Always true)
- **_isparcellocker_**: Is the ID a parcellocker (t) ow an original parcelshop (f)
- **_latlng_**:The geo latitude and longitude of the parcelshop
- **_name_**: The name of the parcelshop
- **_openings_**:Array of the parcelshop’s openings
- **_paybankcard_**: Is the bankcardpayment avalaible (t) or not.(f)
- **_pcl_pickup_time_**:The time intervall when the pickup happens by the GLS.
- **_pclshopid_**:The unique ID of the parcelShop. **_You have to work with this ID._**
- **_phone_**:Phone number of the parcelshop.
- **_vendor_url_**:Webpage of the parcelshop
- **_zipcode_**:Zipcode of the parcelshop.

---

## Sample source code:

You can easily download the sample html code through this link: https://myfirstwebapp-siwvh.run-eu-central1.goorm.io/apirequests/pclshopsamplehtmlcode

## Live demo: https://myfirstwebapp-siwvh.run-eu-central1.goorm.io/leafletpclshopfinder

---

## Code:

The main code has been written in **_ES2021_**. However the targeted browsers ends with **_Internet explorer 11_**.

The default Javascript code that is linked into the sample html file is a **_transpiled code_** from the original.

That means the plugin with standard settings runs easily on Internet explorer 11 too.

You can get the modern version of the code from this link: https://myfirstwebapp-siwvh.run-eu-central1.goorm.io/apirequests/glsparcelshopfindermodern

### Please feel free to use and modify.

---

## Have fun during the development!!! 🎉🎉

### Ákos Paska

### 2021.09.04.
