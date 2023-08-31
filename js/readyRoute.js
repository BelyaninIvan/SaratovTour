/* ----------Создание маршрута---------- */
/* ----------const addCafeForm = document.querySelector('');---------- */
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
const createRoatingMap = document.querySelector('.create-route__map');
const roating = {};
const routeObj = {
    latlng: {}
};
const route = [];
let query;

$(document).ready(function () {

    let host;
    let defaultKey = "0cdf8671-f0b8-4cb6-9702-1f73a10c9a4c";
    let ghRouting = new GraphHopper.Routing({key: defaultKey, host: host}, {elevation: false});

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

    
    roatingForm.addEventListener('submit', (evt) => {
        evt.preventDefault();
        let routingMap = createMap('create-route__map');
        setupRoutingAPI(routingMap, ghRouting);
        createRoatingMap.classList.add('create-route__map_active');
    });
    

    function setupRoutingAPI(map, ghRouting) {
        map.setView([51.5406, 46.0086], 12);

        let instructionsDiv = $("#instructions");
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
            id: 'saratovroute-28c8c9ae',
            attribution: attribution
          }).addTo(map);
        map.attributionControl.setPrefix(false);
        return map;
    }
});


/* ----------Работа с модальным окном---------- */
const modalCafe = document.querySelector('.modal_cafe');
const addCafeForm = document.querySelector('[name="addCafe"]');
const openAddCafeForm = document.querySelector('#roatingCreateCafe');
const closeModal = document.querySelector('.modal__button-close');
const addCafeFormSubmit = document.querySelector('#roatingAddCafe');

const openModalWindow = (window) => {
    window.classList.add('view');
};

const closeModalWindow = (window) => {
    window.classList.remove('view');
};

openAddCafeForm.addEventListener('click', () => {
    openModalWindow(modalCafe);
});

closeModal.addEventListener('click', () => {
    closeModalWindow(modalCafe);
});

/* ----------Работа с добавлением карточки---------- */
const restaurantsCard = document.getElementById('restaurants');
const imgCafe = document.querySelector('[name="cafeImg"]');
const nameCafe = document.querySelector('[name="cafeName"]');
const typeKitchenCafe = document.querySelector('[name="kitchenType"]');
const middlePriceCafe = document.querySelector('[name="middlePrice"]');
const coordCafe = document.querySelector('[name="coordCafe"]');
const addRestaurantsContainer = document.querySelector('.add-restaurants-container');
const helpContainers = document.querySelector('.help-containers__container');

addCafeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addRestaurantsContainer.classList.remove('hidden');
    var clone = restaurantsCard.content.cloneNode(true);
    const cardImg = clone.querySelector('.card__img');
    const cardTtile = clone.querySelector('.card__title');
    const cardKitchen = clone.querySelector('.card__kitchen-type');
    const cardMidlePrice = clone.querySelector('.card__middle-price');
    var coord = coordCafe.value;
    cardImg.src = imgCafe.value;
    cardTtile.textContent = nameCafe.value;
    cardKitchen.textContent = typeKitchenCafe.value;
    cardMidlePrice.textContent = middlePriceCafe.value + ' руб.';

    helpContainers.append(clone);
    closeModalWindow(modalCafe);
});