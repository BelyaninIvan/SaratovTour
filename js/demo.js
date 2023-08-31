let iconObject = L.icon({
    iconUrl: './../style/images/marker-icon.png',
    shadowSize: [50, 64],
    shadowAnchor: [4, 62],
    iconAnchor: [12, 40]
});
let points = [];
const roatingForm = document.querySelector('[name="roatingCreate"]');
const startRoating = roatingForm.querySelector('#start');
const endRoating = roatingForm.querySelector('#end');
const roating = {};
const routeObj = {
    latlng: {}
};
const route = [];
let query;

$(document).ready(function () {
    jQuery.support.cors = true; 
    
    function showTab(thisDiv) {
        thisDiv.parent().addClass("current");
        thisDiv.parent().siblings().removeClass("current");
        let tab = thisDiv.attr("href");
        console.log(tab)
        $(tab).fadeIn();

        // a bit hackish to refresh the map
        routingMap.invalidateSize(false);
    }

    let host;// = "http://localhost:9000/api/1";

    //
    // Sign-up for free and get your own key: https://graphhopper.com/#directions-api
    //
    let defaultKey = "0cdf8671-f0b8-4cb6-9702-1f73a10c9a4c";

    // create a routing client to fetch real routes, elevation.true is only supported for vehicle bike or foot
    let ghRouting = new GraphHopper.Routing({key: defaultKey, host: host}, {elevation: false});

//    if (location.protocol === "file:") {
//        ghOptimization.host = 'http://localhost:9000/api/1';
//        ghOptimization.basePath = '/vrp';
//    }

    let overwriteExistingKey = function () {
        let key = $("#custom_key_input").val();
        if (key && key !== defaultKey) {
            $("#custom_key_enabled").show();

            ghRouting.key = key;
            ghMatrix.key = key;
            ghGeocoding.key = key;
            ghOptimization.key = key;
            ghIsochrone.key = key;
            ghMapMatching.key = key;
        } else {
            $("#custom_key_enabled").hide();
        }
    };
    overwriteExistingKey();
    $("#custom_key_button").click(overwriteExistingKey);

    let routingMap = createMap('routing-map');
    setupRoutingAPI(routingMap, ghRouting);

    var latlngs = [[51.601812, 45.968051],[51.601834, 45.975336],[51.594024, 45.971842],[51.596950, 45.961520]];

    var polygon = L.polygon(latlngs, {color: 'red'}).addTo(routingMap);
    var point = L.marker([51.598215, 45.969479]);
    var point2 = L.marker([51.569864, 45.980205]);

    function getMap(position, tooltip) {
        routingMap.setView(position, 17);
        L.marker(position).addTo(routingMap).bindPopup(tooltip).openPopup();
        
        /* if(polygon.contains(L.marker(position).getLatLng())) {
            alert('Вы в области!');
        } */

        console.log(polygon.contains(point.getLatLng()));
        console.log(polygon.contains(point2.getLatLng()));
    }
    
    document.getElementById('my_position').addEventListener('click', () => {
        navigator.geolocation.getCurrentPosition(success, error, {
            enableHighAccuracy: true
        });
    });
    
    function success({ coords }) {
        const { latitude, longitude } = coords;
        const currentPosition = [latitude, longitude];
        // вызываем функцию, передавая ей текущую позицию и сообщение
        getMap(currentPosition, 'Ты здесь');
    }
    
    function error({ message }) {
        console.log(message);
    }

    function setupRoutingAPI(map, ghRouting) {
        map.setView([51.5406, 46.0086], 12);

        let instructionsDiv = $("#instructions");
        roatingForm.addEventListener('submit', (evt) => {
            evt.preventDefault();
            roating.startRoute = startRoating.value;
            roating.endRoute = endRoating.value;
            JSON.stringify(roating);
            
            for(const place in roating) {
                const address = roating[place];
                query = address.replace(
                    /([А-ЯЁа-яё]+)\s([А-ЯЁа-яё]+),\s([0-9А-ЯЁа-яё]+)/,
                    '$3+$1+$2,+Саратов'
                )
                points.push(query);
            };
            console.log(points);

            points.forEach(element  => {
                console.log(element);
                fetch(
                    `https://nominatim.openstreetmap.org/search?q=${element}&format=json&limit=1`
                )
                .then((res) => res.json())
                .then((result) => {
                    routeObj.latlng.lat = Number(result[0].lat);
                    routeObj.latlng.lon = Number(result[0].lon);
                    route.push([routeObj.latlng.lon, routeObj.latlng.lat]); 
                    console.log(route);

                    if (points.length > 1) {
                        points.length = 0;
                        routingLayer.clearLayers();
                    }
            
                    L.marker(routeObj.latlng, {icon: iconObject}).addTo(routingLayer);

                    if (route.length > 1) {
                        // ******************
                        //  Calculate route! 
                        // ******************
                        ghRouting.doRequest({points: route})
                            .then(function (json) {
                                let path = json.paths[0];
                                routingLayer.addData({
                                    "type": "Feature",
                                    "geometry": path.points
                                });
                                let outHtml = "Distance in meter:" + path.distance;
                                outHtml += "<br/>Times in seconds:" + path.time / 1000;
                                $("#routing-response").html(outHtml);
        
                                if (path.bbox) {
                                    let minLon = path.bbox[0];
                                    let minLat = path.bbox[1];
                                    let maxLon = path.bbox[2];
                                    let maxLat = path.bbox[3];
                                    let tmpB = new L.LatLngBounds(new L.LatLng(minLat, minLon), new L.LatLng(maxLat, maxLon));
                                    map.fitBounds(tmpB);
                                }
        
                                instructionsDiv.empty();
                                if (path.instructions) {
                                    let allPoints = path.points.coordinates;
                                    let listUL = $("<ol>");
                                    instructionsDiv.append(listUL);
                                    for (let idx in path.instructions) {
                                        let instr = path.instructions[idx];
        
                                        // use 'interval' to find the geometry (list of points) until the next instruction
                                        let instruction_points = allPoints.slice(instr.interval[0], instr.interval[1]);
        
                                        // use 'sign' to display e.g. equally named images
        
                                        $("<li>" + instr.text + " <small>(" + ghRouting.getTurnText(instr.sign) + ")</small>"
                                            + " for " + instr.distance + "m and " + Math.round(instr.time / 1000) + "sec"
                                            + ", geometry points:" + instruction_points.length + "</li>").appendTo(listUL);
                                    }
                                }
        
                            })
                            .catch(function (err) {
                                let str = "An error occured: " + err.message;
                                $("#routing-response").text(str);
                            });
                    }
                });
            });
            

        });

        let instructionsHeader = $("#instructions-header");
        instructionsHeader.click(function () {
            instructionsDiv.toggle();
        });

        let routingLayer = L.geoJson().addTo(map);
        routingLayer.options = {
            style: {color: "#00cc33", "weight": 5, "opacity": 0.6}
        };
    }
    
    
    
    
    function createMap(divId) {

        var host = 'https://maps.omniscale.net/v2/{id}/style.default/{z}/{x}/{y}.png';

        var attribution = '&copy; 2023 &middot; <a href="https://maps.omniscale.com/">Omniscale</a> ' +
            '&middot; Map data: <a href="https://www.openstreetmap.org/copyright">OpenStreetMap (Lizenz: ODbL)</a>';

        var map = L.map(divId).setView([53.14, 8.22], 13);
          L.tileLayer(host, {
            id: 'saratovroute-fb2ec590',
            attribution: attribution
          }).addTo(map);
        map.attributionControl.setPrefix(false);

        return map;
    }




const watchRouteButton = document.querySelector('.ready-route');

watchRouteButton.addEventListener('click', sendPost);

function sendPost() {
    const query = new URLSearchParams({
        key: '0cdf8671-f0b8-4cb6-9702-1f73a10c9a4c'
        }).toString();
        
        fetch(
        `https://graphhopper.com/api/1/route?${query}`,
        {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            points:  [ 
                [45.961520, 51.596950],
                [45.968051, 51.601812],
                [45.971842, 51.594024],
                [45.975336, 51.601834]
            ],
            /* [51.601812, 45.968051],[51.601834, 45.975336],[51.594024, 45.971842],[51.596950, 45.961520] */
            /* [45.968051, 51.601812],[45.975336, 51.601834],[45.971842, 51.594024],[45.961520, 51.596950] */
            snap_preventions: [
                'motorway',
                'ferry',
                'tunnel'
            ],
            details: ['road_class', 'surface'],
            vehicle: 'bike',
            locale: 'en',
            instructions: true,
            calc_points: true,
            points_encoded: false
            })
        }
        )
        .then((res) => res.json())
        .then(function (json) {
            let path = json.paths[0];
            routingLayer.addData({
                "type": "Feature",
                "geometry": path.points
            });
            let outHtml = "Distance in meter:" + path.distance;
            outHtml += "<br/>Times in seconds:" + path.time / 1000;
            $("#routing-response").html(outHtml);
    
            if (path.bbox) {
                let minLon = path.bbox[0];
                let minLat = path.bbox[1];
                let maxLon = path.bbox[2];
                let maxLat = path.bbox[3];
                let tmpB = new L.LatLngBounds(new L.LatLng(minLat, minLon), new L.LatLng(maxLat, maxLon));
                map.fitBounds(tmpB);
            }
    
            instructionsDiv.empty();
            if (path.instructions) {
                let allPoints = path.points.coordinates;
                let listUL = $("<ol>");
                instructionsDiv.append(listUL);
                for (let idx in path.instructions) {
                    let instr = path.instructions[idx];
    
                    // use 'interval' to find the geometry (list of points) until the next instruction
                    let instruction_points = allPoints.slice(instr.interval[0], instr.interval[1]);
    
                    // use 'sign' to display e.g. equally named images
    
                    $("<li>" + instr.text + " <small>(" + ghRouting.getTurnText(instr.sign) + ")</small>"
                        + " for " + instr.distance + "m and " + Math.round(instr.time / 1000) + "sec"
                        + ", geometry points:" + instruction_points.length + "</li>").appendTo(listUL);
                }
            }
    
        })
        .catch(function (err) {
            let str = "An error occured: " + err.message;
            $("#routing-response").text(str);
        });

        let instructionsHeader = $("#instructions-header");
        instructionsHeader.click(function () {
            instructionsDiv.toggle();
        });
    
        let routingLayer = L.geoJson().addTo(routingMap);
        routingLayer.options = {
            style: {color: "#00cc33", "weight": 5, "opacity": 0.6}
        };
}

});

// Тест: Саратов, Производственная 13 Саратов, Производственная 10



/* function setupMapMatching(map, mmClient) {
    map.setView([50.9, 13.4], 9);
    let routeLayer = L.geoJson().addTo(map);
    routeLayer.options = {
        // use style provided by the 'properties' entry of the geojson added by addDataToRoutingLayer
        style: function (feature) {
            return feature.properties && feature.properties.style;
        }
    };

    function mybind(key, url, profile) {
        $("#" + key).click(function (event) {
            $("#" + key).prop('disabled', true);
            $("#map-matching-response").text("downloading file ...");
            $.get(url, function (content) {
                let dom = (new DOMParser()).parseFromString(content, 'text/xml');
                let pathOriginal = toGeoJSON.gpx(dom);
                routeLayer.clearLayers();
                pathOriginal.features[0].properties = {style: {color: "black", weight: 2, opacity: 0.9}};
                routeLayer.addData(pathOriginal);
                $("#map-matching-response").text("send file ...");
                $("#map-matching-error").text("");
                mmClient.doRequest(content, {profile: profile})
                    .then(function (json) {
                        $("#map-matching-response").text("calculated map matching for " + profile);
                        let matchedPath = json.paths[0];
                        let geojsonFeature = {
                            type: "Feature",
                            geometry: matchedPath.points,
                            properties: {style: {color: "#00cc33", weight: 6, opacity: 0.4}}
                        };
                        routeLayer.addData(geojsonFeature);
                        if (matchedPath.bbox) {
                            let minLon = matchedPath.bbox[0];
                            let minLat = matchedPath.bbox[1];
                            let maxLon = matchedPath.bbox[2];
                            let maxLat = matchedPath.bbox[3];
                            let tmpB = new L.LatLngBounds(new L.LatLng(minLat, minLon), new L.LatLng(maxLat, maxLon));
                            map.fitBounds(tmpB);
                        }
                        $("#" + key).prop('disabled', false);
                    })
                    .catch(function (err) {
                        $("#map-matching-response").text("");
                        $("#map-matching-error").text(err.message);
                        $("#" + key).prop('disabled', false);
                    });//doRequest
            });// get
        });//click
    }

    let host = "https://graphhopper.com/api/1/examples/map-matching-examples";
    mybind("bike_example1", host + "/bike.gpx", "bike");
    mybind("car_example1", host + "/car.gpx", "car");
} */

