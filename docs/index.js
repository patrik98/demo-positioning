// Wie kann diese API genutzt werden innerhalb einer Web-Anwendung?

// A: Die API nennt sich Geolociation API und kann über navigator.geolocation verwendet werden. Danach wird der Nutzer um Berechtigung zum Abgreifen der momentanen Position gefragt.
//    Wenn dieser annimmt, können die Geo-Informationen abgegriffen werden.

function useApi() {
    function success(position) {
        console.log(position);
        const latitude  = position.coords.latitude;
        const longitude = position.coords.longitude;
        console.log(`Latitude: ${latitude} °, Longitude: ${longitude} °`);
    }
    
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(success);
    } else {
        console.log('Keine Geolocation möglich.')
    }
}

// Welche Ergebnisse liefert diese API?

// A: Vor allem Breiten- und Längengrade in Form eines GeolocationCoordinates-Objekts
//    Zusätzlich kann GeolocationCoordinates auch altitude, speed und accuracy liefern
//    Das GeolocationPosition-Objekt besteht aus Koordinaten (siehe oben) sowie einem Zeitstempel
    
// Können wir eine kleine Demonstration dieser API machen?
// A: siehe oben

// Kann die API mit Testdaten genutzt werden, oder muss man sich im Freien bewegen?
// A: Die API gibt Geolocation-Daten zurück, man kann aber bspw. kein GeolocationCoordinates-Objekt mit eigenen Positionsdaten instanzieren.
//    Man kann direkt mit dieser API keine Testdaten einspeisen, man muss sich für die Erzeugung von untersch. Positionsdaten wirklich im Freien bewegen.

// Eine Liste von 5 POIs soll definiert werden, welche die Benutzerin im Spiel abgehen muss.
// A:   1. POI - Gebäude B - 47.584040, 12.173309
//      2. POI - Gebäude C - 47.583690, 12.173462
//      3. POI - Gebäude D - 47.583403, 12.173129
//      4. POI - Stadtpark - 47.583989, 12.172339
//      5. POI - Kletterwand - 47.583620, 12.172893

const pois = [
    [47.584040, 12.173309], [47.583690, 12.173462], [47.583403, 12.173129], [47.583989, 12.172339], [47.583620, 12.172893]
];

// Wie können wir den Abstand unserer gemessenen Position zu einem Point of Interest(POI) ausrechnen?
// A: Haversine formula (https://stackoverflow.com/questions/365826/calculate-distance-between-2-gps-coordinates)
//                      (http://www.movable-type.co.uk/scripts/latlong.html)

// Die Formel arbeitet mit Radians
function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

// Haversine formula
function distanceInMeters(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371000; // in m

    var dLat = degreesToRadians(lat2 - lat1);
    var dLon = degreesToRadians(lon2 - lon1);
  
    lat1 = degreesToRadians(lat1);
    lat2 = degreesToRadians(lat2);
  
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 

    return earthRadius * c;
}

// Ein POI soll bestätigt werden, falls der Benutzer sich innerhalb von 1-3 Meter im Radius um den POI befindet. Können wir das berechnen?
// A: ja, siehe folgendes

const reachedPois = [];

function watchPosition() {
    function success(pos) {
      // const crd = [pos.coords.latitude, pos.coords.longitude]; // meine wahre Position

      const testPos = [47.583861, 12.172767]; // Testdaten

      pois.map((poiPos, index) => {
        console.log('POI ' + index + ': ' + distanceInMeters(testPos[0], testPos[1], poiPos[0], poiPos[1]));

        if (distanceInMeters(testPos[0], testPos[1], poiPos[0], poiPos[1]) <= 3) {
            reachedPois.push(poiPos);
        }
      });
    }
    
    function error(err) {
      console.warn('ERROR(' + err.code + '): ' + err.message);
    }
    
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };
    
    navigator.geolocation.watchPosition(success, error, options);
}

// Welchen Kartenausschnitt brauchen wir, um das Gelände der FH Kufstein darzustellen? Ein Kartenausschnitt mit Geo-Koordinaten (Boundary) soll definiert werden.
// A:
                        // North-west corner       // South-east corner
const boundaries = [[47.584724, 12.171843], [47.583015, 12.174000]];

const map = L.map('map', {
    maxBounds: boundaries,
    center: [47.5839578, 12.1733215],
    minZoom: 17,
    maxZoom: 18
}).fitBounds(boundaries);

L.tileLayer('https://{s}.wien.gv.at/basemap/geolandbasemap/normal/google3857/{z}/{y}/{x}.png', {
    subdomains: ['maps', 'maps1', 'maps2', 'maps3', 'maps4']
})
.addTo(map);