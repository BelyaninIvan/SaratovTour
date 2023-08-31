$(document).ready(function () {
    /* ----------Переход по блокам---------- */
    const pedestrianRingRoute = document.querySelector('#pedestrian-ring-route');
    const routePageDescription = document.querySelector('.route-page__description');
    const routeListMain = document.querySelector('#route-list');
    const routeListButton = document.querySelector('#routeListButton');
    const routeMapMain = document.querySelector('#main');
    const watchInfo = document.querySelector('#watch-info');
    const watchRoute = document.querySelector('#watch-route');
    const watchVechile = document.querySelector('#watch-vechile');
    const buttonList = document.querySelector('.button-list');

    /* ----------Переменные для создания карточек и их размещения---------- */
    const restaurantsContainer = document.querySelector('.restaurants-container');
    const vechileContainer = document.querySelector('.vichile-container');
    const famousContainer = document.querySelector('.famous-container');
    const restaurantsCard = document.getElementById('restaurants');
    const vechileCard = document.getElementById('vechile');
    const famousCard = document.getElementById('famous');
    const seeRestaurantsButton = document.getElementById('see-restaurants');
    const seeVechileButton = document.getElementById('see-vechile');
    const seeFamousButton = document.getElementById('see-famous');
    const closeButton = document.querySelector('#close-button');
    /* ---------------------------------------------------------------------- */
    const helpContainers = document.querySelector('.help-containers');
    const sectionMap = document.querySelector('.section-map__map');

    /* ----------Иконки для карты---------- */
    var positionIcon = L.icon({
        iconUrl: '../image/positionMarker.png',
        iconSize: [25, 41],
    });
    var routeMarker = L.icon({
        iconUrl: '../image/routeMarker.png',
        iconSize: [25, 41],
    });
    var markers= {};


    var resp = fetch('../db/database.json')
    .then(res => res.json())
    .then((result) => {

        pedestrianRingRoute.addEventListener('click', () => {
            openRoutePage(routeListMain, routeMapMain);
            let routingMap = createMap('routing-map');

            sendPost();

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
                            [46.00008, 51.51964],
                            [46.00241, 51.52057],
                            [46.00790, 51.52397],
                            [46.01498, 51.53333],
                            [46.02101, 51.53330]
                        ],
                        snap_preventions: [
                            'motorway',
                            'ferry',
                            'tunnel'
                        ],
                        details: ['road_class', 'surface'],
                        vehicle: 'foot',
                        locale: 'en',
                        instructions: true,
                        calc_points: true,
                        points_encoded: false
                        })
                    }
                    )
                    .then((res) => res.json())
                    .then(function (json) {
                        const startRoute = L.marker([51.51964,46.00008]);
                        const endRoute = L.marker([51.53330, 46.02101]);
                        L.marker(startRoute.getLatLng(), {icon: routeMarker}).addTo(routingMap).bindPopup("Начало маршрута").openPopup();
                        L.marker(endRoute.getLatLng(), {icon: routeMarker}).addTo(routingMap).bindPopup("Конец маршрута").openPopup();
                        let path = json.paths[0];
                        routingLayer.addData({
                            "type": "Feature",
                            "geometry": path.points
                        });
                        if (path.bbox) {
                            let minLon = path.bbox[0];
                            let minLat = path.bbox[1];
                            let maxLon = path.bbox[2];
                            let maxLat = path.bbox[3];
                            let tmpB = new L.LatLngBounds(new L.LatLng(minLat, minLon), new L.LatLng(maxLat, maxLon));
                            map.fitBounds(tmpB);
                        }
                    })
                    .catch(function (err) {
                        let str = "An error occured: " + err.message;
                        $("#routing-response").text(str);
                    });
                
                    let routingLayer = L.geoJson().addTo(routingMap);
                    routingLayer.options = {
                        style: {color: "purple", "weight": 5, "opacity": 0.7}
                    };
            }

            watchRoute.addEventListener('click', monitorRoute);

            function monitorRoute() {
                const myPosition = L.marker([51.521280, 46.003633]);
                L.marker(myPosition.getLatLng(), {icon: positionIcon}).addTo(routingMap).bindPopup("Вы здесь").openPopup();
                const polygon1 = L.polygon([
                    [51.514328,45.999419],
                    [51.516604,46.00783],
                    [51.517795,46.006865],
                    [51.522266,45.999548],
                    [51.51888,45.994119],
                    [51.517032,45.997413],
                    [51.514328,45.999419]
                    ], 
                    {color: 'transparent'}).addTo(routingMap);
                const polygon2 = L.polygon([
                    [51.519066,46.005206],
                    [51.519641,46.006085],
                    [51.521141,46.003983],
                    [51.525344,46.010892],
                    [51.527472,46.012158],
                    [51.527699,46.011278],
                    [51.525303,46.009175],
                    [51.520832,46.00233],
                    [51.519066,46.005206]
                    ], 
                    {color: 'transparent'}).addTo(routingMap);
                const polygon3 = L.polygon([
                    [51.527835,46.011164],
                    [51.527527,46.012022],
                    [51.533549,46.015691],
                    [51.533737,46.01479],
                    [51.527835,46.011164]
                    ], 
                    {color: 'transparent'}).addTo(routingMap);
                const polygon4 = L.polygon([
                    [51.533582,46.014745],
                    [51.534947,46.015581],
                    [51.533743,46.020474],
                    [51.534385,46.020688],
                    [51.533863,46.022534],
                    [51.531066,46.020924],
                    [51.531963,46.016783],
                    [51.532859,46.016858],
                    [51.533582,46.014745]
                    ], 
                    {color: 'transparent'}).addTo(routingMap);
        
                if(polygon1.contains(myPosition.getLatLng())){ 
                    buttonList.classList.remove('hidden');
                    sectionMap.classList.remove('section-map__map_active');
                    seeRestaurantsButton.addEventListener('click', (e) => {
                        result.polygon1.restaurants.forEach((item) => {
                          cloneRestaurantCard(item, routingMap);
                        });
                        openHelpContainer(e.target);
                      });
                    
                      seeVechileButton.addEventListener('click', (e) => {
                        result.polygon1.vechile.forEach((item) => {
                          cloneVechileCard(item, routingMap);
                        });
                        openHelpContainer(e.target);
                      });
                    
                      seeFamousButton.addEventListener('click', (e) => {
                        result.polygon1.famousPlace.forEach((item) => {
                          cloneFamousCard(item, routingMap);
                        });
                        openHelpContainer(e.target);
                      });
                } else if(polygon2.contains(myPosition.getLatLng())) {
                    buttonList.classList.remove('hidden');
                    sectionMap.classList.remove('section-map__map_active');
                    seeRestaurantsButton.addEventListener('click', (e) => {
                        result.polygon2.restaurants.forEach((item) => {
                          cloneRestaurantCard(item, routingMap);
                        });
                        openHelpContainer(e.target);
                      });
                    
                      seeVechileButton.addEventListener('click', (e) => {
                        result.polygon2.vechile.forEach((item) => {
                          cloneVechileCard(item, routingMap);
                        });
                        openHelpContainer(e.target);
                      });
                    
                      seeFamousButton.addEventListener('click', (e) => {
                        result.polygon2.famousPlace.forEach((item) => {
                          cloneFamousCard(item, routingMap);
                        });
                        openHelpContainer(e.target);
                      });
                } else if(polygon3.contains(myPosition.getLatLng())) {
                    buttonList.classList.remove('hidden');
                    sectionMap.classList.remove('section-map__map_active');
                    seeRestaurantsButton.addEventListener('click', (e) => {
                        result.polygon3.restaurants.forEach((item) => {
                          cloneRestaurantCard(item, routingMap);
                        });
                        openHelpContainer(e.target);
                      });
                    
                      seeVechileButton.addEventListener('click', (e) => {
                        result.polygon3.vechile.forEach((item) => {
                          cloneVechileCard(item, routingMap);
                        });
                        openHelpContainer(e.target);
                      });
                    
                      seeFamousButton.addEventListener('click', (e) => {
                        result.polygon3.famousPlace.forEach((item) => {
                          cloneFamousCard(item, routingMap);
                        });
                        openHelpContainer(e.target);
                      });
                } else if(polygon4.contains(myPosition.getLatLng())) {
                    buttonList.classList.remove('hidden');
                    sectionMap.classList.remove('section-map__map_active');
                    seeRestaurantsButton.addEventListener('click', (e) => {
                        result.polygon4.restaurants.forEach((item) => {
                          cloneRestaurantCard(item, routingMap);
                        });
                        openHelpContainer(e.target);
                      });
                    
                      seeVechileButton.addEventListener('click', (e) => {
                        result.polygon4.vechile.forEach((item) => {
                          cloneVechileCard(item, routingMap);
                        });
                        openHelpContainer(e.target);
                      });
                    
                      seeFamousButton.addEventListener('click', (e) => {
                        result.polygon4.famousPlace.forEach((item) => {
                          cloneFamousCard(item, routingMap);
                        });
                        openHelpContainer(e.target);
                      });
                } else {
                    alert('Вы вышли за область маршрута, вернитесь и старайтесь не уходить далеко.');
                }
            }

            closeButton.addEventListener('click', () => {
                
                routingMap.removeLayer(markers);
            });
        });

        
    });

    const cloneRestaurantCard = ((item, map) => {
        var clone = restaurantsCard.content.cloneNode(true);
        const cardImg = clone.querySelector('.card__img');
        const cardTtile = clone.querySelector('.card__title');
        const cardKitchen = clone.querySelector('.card__kitchen-type');
        const cardMidlePrice = clone.querySelector('.card__middle-price');
        var coord = L.marker(item.coordinates);
        cardImg.src = item.img;
        cardTtile.textContent = item.name;
        cardKitchen.textContent = item.kitchen;
        cardMidlePrice.textContent = item.middlePrice;
        L.marker(coord.getLatLng()).addTo(map).bindPopup(item.name).openPopup();
        
        restaurantsContainer.prepend(clone);
    });
    
    const cloneVechileCard = ((item, map) => {
        var clone = vechileCard.content.cloneNode(true);
        const cardImg = clone.querySelector('.card__img');
        const cardTtile = clone.querySelector('.card__title');
        const cardButton = clone.querySelector('.button');
        var coord = L.marker(item.coordinates);
        cardImg.src = item.img;
        cardTtile.textContent = item.type;
        console.log(item.service);
        if(item.service != undefined) {
            cardButton.textContent = 'Посмотреть прокат';
            cardButton.classList.remove('hidden')
        }
        cardButton.addEventListener('click', () => {
            L.marker(coord.getLatLng()).addTo(map).bindPopup(`Прокат ${item.type}ов`).openPopup();
        })
        vechileContainer.prepend(clone);
    });

    const cloneFamousCard = ((item, map) => {
        var clone = famousCard.content.cloneNode(true);
        const cardImg = clone.querySelector('.card__img');
        const cardTtile = clone.querySelector('.card__title');
        const cardDescriprion = clone.querySelector('.card__description');
        const cardButton = clone.querySelector('.button');
        cardImg.src = item.img;
        cardTtile.textContent = item.name;
        cardDescriprion.textContent = item.description;
        cardButton.addEventListener('click', () => {
            item.place.forEach((seconditem) => {
                var coord = L.marker(seconditem.coordinates);
                L.marker(coord.getLatLng()).addTo(map).bindPopup(seconditem.name).openPopup();
            })
        })
        famousContainer.prepend(clone);
    });

    const openHelpContainer = ((traget) => {
        traget.classList.add('hidden');
        closeButton.classList.remove('hidden');
        helpContainers.style.rowGap = "10px";
        helpContainers.style.padding = "10px";
    });
    
    closeButton.addEventListener('click', () => {
        seeRestaurantsButton.classList.remove('hidden');
        seeVechileButton.classList.remove('hidden');
        seeFamousButton.classList.remove('hidden');
        closeButton.classList.add('hidden');
        helpContainers.style.removeProperty('row-gap');
        helpContainers.style.removeProperty('padding');
        const cardList = document.querySelectorAll('.card');
        cardList.forEach((item) => {
          item.remove();
        });
    });

    watchInfo.addEventListener('click', () => {
        routePageDescription.classList.toggle('hidden');
    })

    routeListButton.addEventListener('click', () => {
        routeListMain.classList.remove('hidden');
        routeMapMain.classList.add('hidden');
    });

    /*----------Открытие страницы маршрута----------*/

    function openRoutePage(startContainer, endContainer) {
        startContainer.classList.add('hidden');
        endContainer.classList.remove('hidden');
        sectionMap.classList.add('section-map__map_active');
    }

    /*----------Отображение карты----------*/
    
    function createMap(divId) {
        var host = 'https://maps.omniscale.net/v2/{id}/style.default/{z}/{x}/{y}.png';
        var attribution = '&copy; 2023 &middot; <a href="https://maps.omniscale.com/">Omniscale</a> ' +
            '&middot; Map data: <a href="https://www.openstreetmap.org/copyright">OpenStreetMap (Lizenz: ODbL)</a>';
        var map = L.map(divId).setView([51.5406, 46.0086], 12);
        L.tileLayer(host, {
            id: 'saratovroute-28c8c9ae',
            attribution: attribution
        }).addTo(map);
        map.attributionControl.setPrefix(false);
        return map;
    }
    
})