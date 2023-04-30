let HourTitles = [],
    currentHourImg = [],
    currentHourConditions = [],
    currentHourTemp = [],
    currentHourInfo = [],
    currentHourRain = [],
    searchHourRain = [],
    searchHourTemp = [],
    searchHourImg = [],
    searchHourInfo = [],
    searchHourConditions = [],
    DailyTitles = [],
    currentDailyImg = [],
    currentDailyConditions = [],
    currentDailyTemp = [],
    currentDailyInfo = [],
    currentDailyRain = [],
    searchDailyRain = [],
    searchDailyTemp = [],
    searchDailyImg = [],
    searchDailyInfo = [],
    searchDailyConditions = []

const apiKey = "96ef4b80e6d934610538d335d0ab793e";


function weather() {
    navigator.geolocation.getCurrentPosition(function (position) {
        let x = position.coords.latitude;
        let y = position.coords.longitude;
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${x}&lon=${y}&appid=${apiKey}&units=metric`)
            .then(response => response.json()).then(data => {
                const { name, weather } = data;
                if (JSON.stringify(name).length > 17) {
                    document.getElementById('currentLocation').style.fontSize = "clamp(0.5rem, 1vw + 0.8rem, 1.8rem)";
                }
                document.getElementById('currentLocation').textContent = name;
                document.getElementById('currentIcon').src = `https://matt54633.com/weather/weatherIcons/${weather[0]["icon"]}.svg`;
            });
        console.log(`https://api.openweathermap.org/data/2.5/onecall?lat=${x}&lon=${y}&appid=${apiKey}&units=metric`);
        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${x}&lon=${y}&appid=${apiKey}&units=metric`)
            .then(response => response.json()).then(data => {
                const { current, hourly, daily, minutely, alerts } = data;
                displayAlerts(alerts);
                rainDisplay(minutely);
                displayedAlerts();
                createListItems("hourlyForecast", "current", "Hour", 10);
                createListItems("dailyForecast", "current", "Daily", 8);
                forecastItemLabels(hourly, 'current');
                document.getElementById('currentTemp').innerHTML = Math.round(current.temp) + "°";
                document.getElementById('currentConditions').textContent = capitaliseConditions(current.weather[0].description);
                document.getElementById('highLow').textContent = "H:" + Math.round(daily[0].temp.max) + "° L:" + Math.round(daily[0].temp.min) + "°";
                //fill in the 10-hour forecast
                for (let i = 0; i < 10; i++) {
                    currentHourConditions[i] = capitaliseConditions(hourly[i].weather[0]["description"]);
                    calculateRain("hourly", hourly, i);
                    document.getElementById("currentHourTemp" + [i]).textContent = Math.round(hourly[i].temp) + "°";
                    document.getElementById("currentHourImg" + [i]).src = `https://matt54633.com/weather/weatherIcons/${hourly[i].weather[0]["icon"]}.svg`;
                    currentHourImg[i] = `https://matt54633.com/weather/weatherIcons/${hourly[i].weather[0]["icon"]}.svg`;
                    currentHourTemp[i] = Math.round(hourly[i].temp) + "°";
                    if (hourly[i].rain == null) {
                        currentHourInfo[i] = currentHourConditions[i] + "<br>Feels Like: " + Math.round(hourly[i].feels_like) + "°&nbsp;&nbsp;&nbsp;&nbsp;Humidity: " + hourly[i].humidity + "%<br>Wind: " + (Math.round(hourly[i].wind_speed * 2.237)) + "mph&nbsp;&nbsp;&nbsp;&nbsp;Rain: " + Math.floor((hourly[i].pop * 100)) + "%";
                    } else {
                        currentHourInfo[i] = currentHourConditions[i] + "<br>Feels Like: " + Math.round(hourly[i].feels_like) + "°&nbsp;&nbsp;&nbsp;&nbsp;Humidity: " + hourly[i].humidity + "%<br>Wind: " + (Math.round(hourly[i].wind_speed * 2.237)) + "mph&nbsp;&nbsp;&nbsp;&nbsp;Rain: " + Math.floor((hourly[i].pop * 100)) + "% / " + currentHourRain[i];
                    }
                }
                for (let i = 0; i < 8; i++) {
                    calculateRain("daily", daily, i);
                    currentDailyConditions[i] = capitaliseConditions(daily[i].weather[0]["description"]);
                    //fill in the 7-day forecast
                    document.getElementById("currentDailyImg" + [i]).src = `https://matt54633.com/weather/weatherIcons/${daily[i].weather[0]["icon"]}.svg`;
                    document.getElementById("currentDailyTemp" + [i]).innerHTML = Math.round(daily[i].temp.max) + "°<br>" + Math.round(daily[i].temp.min) + "°";
                    currentDailyImg[i] = `https://matt54633.com/weather/weatherIcons/${daily[i].weather[0]["icon"]}.svg`;
                    currentDailyTemp[i] = Math.round(daily[i].temp.max) + "° / " + Math.round(daily[i].temp.min) + "°";
                    if (daily[i].rain == null) {
                        currentDailyInfo[i] = currentDailyConditions[i] + "<br>Feels Like: " + Math.round(daily[0].feels_like.day) + "°&nbsp;&nbsp;&nbsp;&nbsp;Humidity: " + daily[i].humidity + "%<br>Wind: " + (Math.round(daily[i].wind_speed * 2.237)) + "mph&nbsp;&nbsp;&nbsp;&nbsp;Rain: " + Math.floor((daily[i].pop * 100)) + "%";
                    } else {
                        currentDailyInfo[i] = currentDailyConditions[i] + "<br>Feels Like: " + Math.round(daily[0].feels_like.day) + "°&nbsp;&nbsp;&nbsp;&nbsp;Humidity: " + daily[i].humidity + "%<br>Wind: " + (Math.round(daily[i].wind_speed * 2.237)) + "mph&nbsp;&nbsp;&nbsp;&nbsp;Rain: " + Math.floor((daily[i].pop * 100)) + "% / " + currentDailyRain[i];
                    }
                }
                createMap('currentLocationMap', [y, x]);
            });
            animate();
        return false;
    });
}

function chosenLocation(previousSearch, previousCall) {
    document.getElementById('searchLocation').style.display = "block";
    let searchLocation = document.getElementById('input').value;
    let geoLocationApiCall;
    if (previousSearch != null) { searchLocation = previousSearch; }
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${searchLocation}&appid=${apiKey}&units=metric`)
        .then(response => response.json()).then(data => {
            const { name, sys, cod } = data;
            if (cod != 200) {
                displayError(cod);
            } else {
                console.log(`https://api.openweathermap.org/geo/1.0/direct?q=${searchLocation},${sys.country}&appid=${apiKey}`);
                fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${searchLocation},${sys.country}&appid=${apiKey}`)
                    .then(response => response.json()).then(data => {
                        if (previousCall == null) {
                            geoLocationApiCall = `https://api.openweathermap.org/data/2.5/onecall?lat=${data[0].lat}&lon=${data[0].lon}&appid=${apiKey}&units=metric`;
                        } else {
                            geoLocationApiCall = previousCall;
                        }
                        fetch(geoLocationApiCall)
                            .then(response => response.json()).then(data => {
                                const { current, hourly, daily } = data;
                                if (JSON.stringify(name).length > 14) {
                                    document.getElementById('searchLocationTitle').style.fontSize = "clamp(0.5rem, 1vw + 1rem, 1.4rem)";
                                }
                                createListItems("hourlyForecast2", "search", "Hour", 10);
                                createListItems("dailyForecast2", "search", "Daily", 8);
                                forecastItemLabels(hourly, 'search');
                                localStorage.setItem('Previous Call', geoLocationApiCall);
                                document.getElementById('errorText').style.display = 'none';
                                document.getElementById('searchLocationDetails').style.display = "block";
                                document.getElementById('searchLocationImg').style.display = "inline-block";
                                document.getElementById('searchLocationTitle').textContent = name;
                                document.getElementById('searchLocationTemp').innerHTML = Math.round(current.temp) + "°";
                                document.getElementById('searchLocationInfo').innerHTML = capitaliseConditions(current.weather[0].description) + "<br>H:" + Math.round(daily[0].temp.max) + "° L:" + Math.round(daily[0].temp.min) + "°";
                                document.getElementById('searchLocationImg').src = `https://matt54633.com/weather/weatherIcons/${current.weather[0]["icon"]}.svg`;
                                document.getElementById('input').value = "";

                                for (let i = 0; i < 10; i++) {
                                    searchHourConditions[i] = capitaliseConditions(hourly[i].weather[0]["description"]);
                                    calculateRain("hourly", hourly, i);
                                    //fill in the 10 hour forecast
                                    document.getElementById("searchHourTemp" + [i]).textContent = Math.round(hourly[i].temp) + "°";
                                    document.getElementById("searchHourImg" + [i]).src = `https://matt54633.com/weather/weatherIcons/${hourly[i].weather[0]["icon"]}.svg`;
                                    searchHourImg[i] = `https://matt54633.com/weather/weatherIcons/${hourly[i].weather[0]["icon"]}.svg`;
                                    searchHourTemp[i] = Math.round(hourly[i].temp) + "°";
                                    if (hourly[i].rain == null) {
                                        searchHourInfo[i] = searchHourConditions[i] + "<br>Feels Like: " + Math.round(hourly[i].feels_like) + "°&nbsp;&nbsp;&nbsp;&nbsp;Humidity: " + hourly[i].humidity + "%<br>Wind: " + (Math.round(hourly[i].wind_speed * 2.237)) + "mph&nbsp;&nbsp;&nbsp;&nbsp;Rain: " + Math.floor((hourly[i].pop * 100)) + "%";
                                    } else {
                                        searchHourInfo[i] = searchHourConditions[i] + "<br>Feels Like: " + Math.round(hourly[i].feels_like) + "°&nbsp;&nbsp;&nbsp;&nbsp;Humidity: " + hourly[i].humidity + "%<br>Wind: " + (Math.round(hourly[i].wind_speed * 2.237)) + "mph&nbsp;&nbsp;&nbsp;&nbsp;Rain: " + Math.floor((hourly[i].pop * 100)) + "% / " + searchHourRain[i];
                                    }
                                }
                                for (let i = 0; i < 8; i++) {
                                    //fill in the 7-day forecast
                                    searchDailyConditions[i] = capitaliseConditions(daily[i].weather[0]["description"]);
                                    calculateRain("daily", daily, i);
                                    document.getElementById("searchDailyImg" + [i]).src = `https://matt54633.com/weather/weatherIcons/${daily[i].weather[0]["icon"]}.svg`;
                                    document.getElementById("searchDailyTemp" + [i]).innerHTML = Math.round(daily[i].temp.max) + "°<br>" + Math.round(daily[i].temp.min) + "°";
                                    searchDailyImg[i] = `https://matt54633.com/weather/weatherIcons/${daily[i].weather[0]["icon"]}.svg`;
                                    searchDailyTemp[i] = Math.round(daily[i].temp.max) + "° / " + Math.round(daily[i].temp.min) + "°";
                                    if (daily[i].rain == null) {
                                        searchDailyInfo[i] = searchDailyConditions[i] + "<br>Feels Like: " + Math.round(daily[i].feels_like.day) + "°&nbsp;&nbsp;&nbsp;&nbsp;Humidity: " + daily[i].humidity + "%<br>Wind: " + (Math.round(daily[i].wind_speed * 2.237)) + "mph&nbsp;&nbsp;&nbsp;&nbsp;Rain: " + Math.floor((daily[i].pop * 100)) + "%";
                                    } else {
                                        searchDailyInfo[i] = searchDailyConditions[i] + "<br>Feels Like: " + Math.round(daily[i].feels_like.day) + "°&nbsp;&nbsp;&nbsp;&nbsp;Humidity: " + daily[i].humidity + "%<br>Wind: " + (Math.round(daily[i].wind_speed * 2.237)) + "mph&nbsp;&nbsp;&nbsp;&nbsp;Rain: " + Math.floor((daily[i].pop * 100)) + "% / " + searchDailyRain[i];
                                    }
                                }
                                searchLocation = name + ", " + sys.country;
                                localStorage.setItem('Previous Search', searchLocation);
                                mapboxgl.accessToken = 'pk.eyJ1IjoibWF0dDU0NjMzIiwiYSI6ImNrN3FqeTM3djA0eGszZnA5ZzFzdHU5cncifQ.E05mbOmq5K83ZmeVeIPk8A';
                                let mapboxClient = mapboxSdk({ accessToken: mapboxgl.accessToken });
                                mapboxClient.geocoding
                                    .forwardGeocode({
                                        query: searchLocation,
                                        autocomplete: false,
                                        limit: 1
                                    })
                                    .send().then(function (response) {
                                        if (
                                            response &&
                                            response.body &&
                                            response.body.features &&
                                            response.body.features.length
                                        ) {
                                            let feature = response.body.features[0];
                                            createMap('searchLocationMap', feature.center)
                                        }
                                    });
                                document.getElementById('input').blur();
                            })
                    });
            }
        });
    return false;
}

function animate() {
    const fadeElements = document.querySelectorAll('.fadeMiddle');
    document.getElementById('loader').style.display = 'none';
    fadeElements.forEach((el) => { el.classList.add('fadeMiddleShow') });
}

function openInfoPanel(locationType, forecastType, number) {
    document.getElementById('infoPanel').classList.add('fadeUpShow');
    document.getElementById('infoPanelTitle').textContent = eval(`${forecastType}Titles[${number}]`);
    document.getElementById('infoPanelImg').src = eval(`${locationType}${forecastType}Img[${number}]`);
    document.getElementById('infoPanelTemp').textContent = eval(`${locationType}${forecastType}Temp[${number}]`);
    document.getElementById('infoPanelInfo').innerHTML = eval(`${locationType}${forecastType}Info[${number}]`);
}

function closeInfoPanel() {
    document.getElementById('infoPanel').classList.remove('fadeUpShow');
}

// refresh event handler
const refreshSpin = [{ transform: 'rotate(0) scale(1)' }, { transform: 'rotate(720deg) scale(1)' }];
const refreshTiming = { duration: 300, iterations: 1, }
const refresh = document.getElementById('refresh');

refresh.addEventListener('click', () => {
    refresh.animate(refreshSpin, refreshTiming);
    weather();
    if (localStorage.getItem('Previous Search') != null) { 
        chosenLocation(
            localStorage.getItem('Previous Search'), 
            localStorage.getItem('Previous Call')
            );
    }
});

//window load event handler
window.addEventListener('load', () => {
    if (localStorage.getItem('Previous Search') != null) {
        chosenLocation(
            localStorage.getItem('Previous Search'), 
            localStorage.getItem('Previous Call')
            );
    }
});

closeIcon = document.getElementById('closeSearch');
closeIcon.addEventListener('click', () => {
    localStorage.removeItem('Previous Search');
    localStorage.removeItem('Previous Call');
    document.getElementById('searchLocation').style.display = 'none';
});

//search logo event handler 
const searchLogo = document.getElementById('searchLogo');
searchLogo.addEventListener('click', () => {
    return chosenLocation();
});

//info panel event handler
let infoPanel = document.getElementById('infoPanel');
let initialY = null;

infoPanel.addEventListener('touchstart', startTouch, false);
infoPanel.addEventListener('touchmove', moveTouch, false);

function startTouch(e) {
    initialY = e.touches[0].clientY;
};

function moveTouch(e) {
    if (initialY === null) {
        return;
    }
    let currentY = e.touches[0].clientY;
    let diffY = initialY - currentY;

    if (diffY < 0) {
        document.getElementById('infoPanel').classList.remove('fadeUpShow');
    }
    initialY = null;
    e.preventDefault();
};

//auto-capitalise conditions
function capitaliseConditions(conditionsType) {
    conditionsType = JSON.stringify(conditionsType).replaceAll('"', '');
    conditionsType = conditionsType.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
    return conditionsType;
}

//map function
function createMap(mapType, centerPoint) {
    mapboxgl.accessToken = 'pk.eyJ1IjoibWF0dDU0NjMzIiwiYSI6ImNrN3FqeTM3djA0eGszZnA5ZzFzdHU5cncifQ.E05mbOmq5K83ZmeVeIPk8A';
    let map = new mapboxgl.Map({
        container: mapType,
        style: 'mapbox://styles/matt54633/cl8zz39b100om16piowm9gvs2?optimize=true',
        center: centerPoint,
        zoom: 6,
        animate: false,
        interactive: false
    });
    new mapboxgl.Marker({
        color: "#8E2DE2",
    }).setLngLat(centerPoint).addTo(map);

    window.map = map;
    map.on("load", () => {
        fetch("https://api.rainviewer.com/public/weather-maps.json")
            .then(res => res.json()).then(apiData => {
                apiData.radar.past.forEach(frame => {
                    map.addLayer({
                        id: `rainviewer_${frame.path}`,
                        type: "raster",
                        source: {
                            type: "raster",
                            tiles: [
                                apiData.host + frame.path + '/256/{z}/{x}/{y}/2/1_1.png'
                            ],
                            tileSize: 256
                        },
                        layout: { visibility: "none" },
                        minzoom: 0,
                        maxzoom: 12
                    });
                });

                let i = 0;
                const interval = setInterval(() => {
                    if (i > apiData.radar.past.length - 1) {
                        clearInterval(interval);
                        return;
                    } else {
                        apiData.radar.past.forEach((frame, index) => {
                            map.setLayoutProperty(
                                `rainviewer_${frame.path}`,
                                "visibility",
                                index === i || index === i - 1 ? "visible" : "none"
                            );
                        });
                        if (i - 1 >= 0) {
                            const frame = apiData.radar.past[i - 1];
                            let opacity = 1;
                            setTimeout(() => {
                                const i2 = setInterval(() => {
                                    if (opacity <= 0) {
                                        return clearInterval(i2);
                                    }
                                    map.setPaintProperty(
                                        `rainviewer_${frame.path}`,
                                        "raster-opacity",
                                        opacity
                                    );
                                    opacity -= 0.1;
                                }, 50);
                            }, 400);
                        }
                        i += 1;
                    }
                }, 1500);
            })
            .catch(console.error);
    });
};

function calculateRain(rainType, rainArray, index) {
    if (rainType == "hourly") {
        if (eval(rainArray[index].rain) == null) {
            currentHourRain[index] = "0mm";
            searchHourRain[index] = "0mm";
        } else {
            currentHourRain[index] = Math.ceil(rainArray[index].rain["1h"]) + "mm";
            searchHourRain[index] = Math.ceil(rainArray[index].rain["1h"]) + "mm";
        }
    } else {
        if (eval(rainArray[index].rain) == null) {
            currentDailyRain[index] = "0mm";
            searchDailyRain[index] = "0mm";
        } else {
            currentDailyRain[index] = Math.ceil(rainArray[index].rain) + "mm";
            searchDailyRain[index] = Math.ceil(rainArray[index].rain) + "mm";
        }
    }
};

function createListItems(ulName, locationType, forecastType, index) {
    let ul = document.getElementById(ulName);
    if (ul.querySelectorAll("li").length > 0) {
        for (let i = 0; i < index; i++) {
            document.getElementById(`${forecastType}${locationType}Li${i}`).remove();
        }
    }
    for (let i = 0; i < index; i++) {
        let listItem = document.createElement("li");
        let listItemH2 = document.createElement("h2");
        let listItemImg = document.createElement("img");
        let listItemH3 = document.createElement("h3");
        listItem.setAttribute("id", `${forecastType}${locationType}Li${i}`)
        listItem.setAttribute('onclick', 'openInfoPanel();');
        listItemImg.setAttribute('alt', 'Forecast Image');
        listItem.onclick = function () { openInfoPanel(locationType, forecastType, i); };
        listItemH2.setAttribute("id", `${locationType}${forecastType}Title${i}`);
        listItemImg.setAttribute("id", `${locationType}${forecastType}Img${i}`);
        listItemH3.setAttribute("id", `${locationType}${forecastType}Temp${i}`);

        listItem.append(listItemH2, listItemImg, listItemH3);
        document.getElementById(ulName).appendChild(listItem);
    }
};

function forecastItemLabels(hourlyArray, locationType) {
    let day = new Date();
    let week = new Array("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");
    for (let i = 0; i < 10; i++) {
        let date = new Date(hourlyArray[i].dt * 1000);
        HourTitles[i] = (date.getHours() + ":00").toString();
        DailyTitles[i] = week[(day.getDay() + 1 + (i - 1)) % 7];
        document.getElementById(locationType + 'HourTitle' + [i]).innerText = HourTitles[i];
    }
    for (let i = 0; i < 8; i++) {
        document.getElementById(locationType + 'DailyTitle' + [i]).innerText = DailyTitles[i];
    }
    document.getElementById(locationType + 'DailyTitle0').innerText = 'Today';
}

function rainDisplay(rainData) {
    let precipitation = [];
    let labels = [];
    let counter = 0;
    let rainDisplay = document.getElementById('rainDisplay');
    for (let i = 0; i < 60; i++) {
        labels[i] = i;
        precipitation[i] = rainData[i].precipitation;
        if (rainData[i].precipitation > 0) { counter += 1; }
    }
    let chartStatus = Chart.getChart("rainChart"); // <canvas> id
    if (chartStatus != undefined) {
        chartStatus.destroy();
    }
    if (counter > 5) {
        rainDisplay.style.display = "block";    
            let container = document.getElementById('rainChart');
            new Chart(container, {
                type: 'bar',
                data: {
                  labels: labels,
                  datasets: [{
                    label: 'Rain (mm)',
                    data: precipitation,
                    backgroundColor: '#60AFFF',
                    borderRadius: 20
                  }]
                },
                options: {
                    animations: false,
                    plugins: { legend: { display: false } },
                    maintainAspectRatio: false,
                  scales: {
                    y: { display: false, suggestedMax: 0.65 },
                    x: { display: false }
                  }}
              });
    } else { rainDisplay.style.display = "none"; }
}

function displayAlerts(alertsData) {
    let alertsDisplay = document.getElementById('alertsDisplay');
    if (alertsData != null) {
        alertsDisplay.style.display = 'block';
        document.getElementById('alertsDisplayTitle').innerText = alertsData[0].event;
        let date = new Date(alertsData[0].end * 1000).toUTCString();
        document.getElementById('alertsDisplayInfo').innerHTML = "From the " + alertsData[0].sender_name + ". A " + alertsData[0].event + " is in place until: " + date + ".";
    } else { alertsDisplay.style.display = 'none'; }
};

function displayedAlerts() {
    let alertsDisplay = document.getElementById('alertsDisplay');
    let rainDisplay = document.getElementById('rainDisplay');
    if (window.innerWidth < window.innerHeight) {
        alertsDisplay.style.width = '90vw';
        rainDisplay.style.width = '90vw';
    }
    else if (alertsDisplay.style.display == 'block' && rainDisplay.style.display != 'block') {
        alertsDisplay.style.width = '100%';
    } else if (alertsDisplay.style.display != 'block' && rainDisplay.style.display == 'block' ) { 
        rainDisplay.style.width = '100%'; 
    } else {
        alertsDisplay.style.width = '30%';
        rainDisplay.style.width = '70%';
    }
};
window.addEventListener('resize', displayedAlerts);

function displayError(cod) {
    document.getElementById('errorText').style.display = 'block';
    document.getElementById('errorText').innerHTML = cod + " Error<br>Please search again.";
    document.getElementById('searchLocationDetails').style.display = "none";
    document.getElementById('searchLocationImg').style.display = "none";
    document.getElementById('input').value = "";
    document.getElementById('input').blur();
}

document.getElementById('footerInfo').innerText = '©Matt Sullivan - ' + new Date().getFullYear();