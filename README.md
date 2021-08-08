GLS ParcelShop finder with map

Description

Used for searching, displaying and selecting parcelshops on webpage of GLS customer.
it is a Javascript based on Leaflet Map.

Functions

- lt is possible to change this address dynamically
- ParcelShop can be selected from list and clicking on the map
  - lt is possible to search between displayed ParcelShops
  - selecting a ParcelShop from the map or from the list will fire an event, which can supply to the  
     base page of the ParcelShop ID and other data about the selected ParcelShop.

Necessary scripts:

GLS css: https://myfirstwebapp-siwvh.run-eu-central1.goorm.io/apirequests/pclshopfindercss
GLS plugin: https://myfirstwebapp-siwvh.run-eu-central1.goorm.io/apirequests/pclshopfinderjs

jQuery: https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js

Leaflet Css: https://unpkg.com/leaflet@1.6.0/dist/leaflet.css
Leaflet JS: https://unpkg.com/leaflet@1.6.0/dist/leaflet.js

How to implement?

To implement this plugin you will need a DIV with FIX size, for example:

Body:

<div id=”big-canvas”></div>
CSS:
#big-canvas{
	width:600px;
	height:500px;
	       }

The map should be initialized this way:

var scriptLoadOptions={
country:’HU’,
startingCoords: null,
startingDefaultZoomLevel:15,
minMaxZoomLevel:{min:7,max:15},
uiLanguage:’hu’,
isPopUpEnabled:true,
}

Parameters:

    country:The target country’s iso country code. Example: ‘HU’,’SK’,’SI’,’HR’,’RO’

    startingCoords: The preset coordinates for the first load.
    		  By the NULL value the startingCoords will be the target country’s capital city.
    		  Unique coords must be set in the next format: [{lat:47.525,lng:46.258}]

    startingDefaultZoomLevel: Zoom level after the first load

    minMaxZoomLevel: It is possible to set the minimum and maximum value of the zoom.
    		         Example:{min:7,max:15}

    uiLanguage: Set the PopUp element’s preset language. Example:’hu’,’sk’,’si’,’hr’,’cz’,’ro’

    isPopUpEnabled:If the value is true, click on the marker will display a popup window, if the value is
                                              false, the popup will not show up.

How to use the selected ParcelShop data

You have to include the mainDataExtractor(event) function in the source of your webpage. This function returns the actually selected parcelShop data in an object.

The mainDataExtractor function works with the click event as an argument.
The function triggers when the click event happens on the selected marker icon, or one of the sideBar list elements.
If the click happens not on the marker icon, the active parcelshop will be DESELECTED.

The MainMap.activeIconID stores the actually selected ParcelshopID too.

Parameters of the data object:

address:The parcelshop’s address
city: The city where the parcelshop is located.
ctrcode:The country’s iso code where the parcelshop is located.
email:The parcelshop’s email address.
geolat: The geo latitude of the parcelshop
geolng: The geo longtitudeof the parcelshop
holidaystarts:Optional. Holds a value if the holiday is set by the parcelshop.
holidayends:Optional. Holds a value if the holiday is set by the parcelshop.
imgIcon:current <img> element of the selected parcelshop on the map.
info:Optional: It could hold additional infos about the parcelshop.
iscodhandler:Is cash on demand avalaible. (Always true)
isparcellocker: Is the ID a parcellocker (t) ow an original parcelshop (f)
latlng:The geo latitude and longitude of the parcelshop
name: The name of the parcelshop
openings:Array of the parcelshop’s openings
paybankcard: Is the bankcardpayment avalaible (t) or not.(f)
pcl_pickup_time:The time intervall when the pickup happens by the GLS.
pclshopid:The unique ID of the parcelShop. You have to work with this ID.
phone:Phone number of the parcelshop.
vendor_url:Webpage of the parcelshop
zipcode:Zipcode of the parcelshop.

Sample source code:

You can easily download the sample html code through this link:
https://myfirstwebapp-siwvh.run-eu-central1.goorm.io/apirequests/pclshopsamplehtmlcode

Live demo:
https://myfirstwebapp-siwvh.run-eu-central1.goorm.io/leafletpclshopfinder

Code:

The main code has been written in ES2021. Hoewer the targeted browsers ends with Internet explorer 11.

The default Javascript code that is linked into the sample html file is a transpiled code from the original.

That means the plugin with standard settings runs easily on Internet explorer 11 too.

You can get the modern version of the code from this link:
https://myfirstwebapp-siwvh.run-eu-central1.goorm.io/apirequests/glsparcelshopfindermodern

Please feel free to use and modify.
