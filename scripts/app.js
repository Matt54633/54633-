const apiKey = '96ef4b80e6d934610538d335d0ab793e';

let HourlyTitles = [];
let DailyTitles = [];
// info panel arrays
let currentHourlyTemp = [];
let currentHourlyConditions = [];
let currentHourlyImg = [];
let currentHourlyInfo = [];
let currentHourlyRain = [];
let searchHourlyTemp = [];
let searchHourlyConditions = [];
let searchHourlyImg = [];
let searchHourlyInfo = [];
let searchHourlyRain = [];
let currentDailyTemp = [];
let currentDailyConditions = [];
let currentDailyImg = [];
let currentDailyInfo = [];
let currentDailyRain = [];
let searchDailyTemp = [];
let searchDailyConditions = [];
let searchDailyImg = [];
let searchDailyInfo = [];
let searchDailyRain = [];

async function weather(locationType, x, y, searchString) {
    let mapCenter;
    // get x and y coord
    navigator.geolocation.getCurrentPosition(position => {
        if (x == null || y == null) {
            x = position.coords.latitude;
            y = position.coords.longitude;
        }
        // get name of location using x and y coordinates
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${x}&lon=${y}&appid=${apiKey}&units=metric`)
            .then(response => response.json()).then(data => {
                var { name, weather } = data;
                if (locationType == "search") {
                    document.getElementById(`${locationType}Location`).textContent = searchString;
                    localStorage.setItem('previousSearch', searchString);
                } else {
                    document.getElementById(`${locationType}Location`).textContent = name;
                }
                document.getElementById(`${locationType}Icon`).src = `https://matt54633.com/weather/weatherIcons/${weather[0]["icon"]}.svg`;
            })
        // get weather data using x and y coordinates
        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${x}&lon=${y}&appid=${apiKey}&units=metric`)
            .then(response => response.json()).then(data => {
                var { current, hourly, daily, minutely, alerts } = data;
                // create list items
                createListItems(locationType, 'Hourly', 10);
                createListItems(locationType, 'Daily', 8);
                forecastItemLabels(hourly, locationType);
                // display weather data
                document.getElementById(`${locationType}Temp`).innerHTML = Math.round(current.temp) + "°";
                document.getElementById(`${locationType}Conditions`).textContent = capitaliseConditions(current.weather[0].description);
                document.getElementById(`${locationType}HighLow`).textContent = "H:" + Math.round(daily[0].temp.max) + "° L:" + Math.round(daily[0].temp.min) + "°";

                //fill in the 10-hour forecast
                for (let i = 0; i < 10; i++) {
                    eval(locationType + 'HourlyConditions')[i] = capitaliseConditions(hourly[i].weather[0]["description"]);
                    calculateRain(locationType, "hourly", hourly, i);
                    document.getElementById(`${locationType}HourlyTemp` + [i]).textContent = Math.round(hourly[i].temp) + "°";
                    document.getElementById(`${locationType}HourlyImg` + [i]).src = `https://matt54633.com/weather/weatherIcons/${hourly[i].weather[0]["icon"]}.svg`;
                    eval(locationType + 'HourlyImg')[i] = `https://matt54633.com/weather/weatherIcons/${hourly[i].weather[0]["icon"]}.svg`;
                    eval(locationType + 'HourlyTemp')[i] = Math.round(hourly[i].temp) + "°";
                    if (hourly[i].rain == null) {
                        eval(locationType + 'HourlyInfo')[i] = eval(locationType + 'HourlyConditions')[i] + "<br>Feels Like: " + Math.round(hourly[i].feels_like) + "°&nbsp;&nbsp;&nbsp;&nbsp;Humidity: " + hourly[i].humidity + "%<br>Wind: " + (Math.round(hourly[i].wind_speed * 2.237)) + "mph&nbsp;&nbsp;&nbsp;&nbsp;Rain: " + Math.floor((hourly[i].pop * 100)) + "%";
                    } else {
                        eval(locationType + 'HourlyInfo')[i] = eval(locationType + 'HourlyConditions')[i] + "<br>Feels Like: " + Math.round(hourly[i].feels_like) + "°&nbsp;&nbsp;&nbsp;&nbsp;Humidity: " + hourly[i].humidity + "%<br>Wind: " + (Math.round(hourly[i].wind_speed * 2.237)) + "mph&nbsp;&nbsp;&nbsp;&nbsp;Rain: " + Math.floor((hourly[i].pop * 100)) + "% / " + eval(locationType + 'HourlyRain')[i];
                    }
                }
                // //fill in the 8-day forecast
                for (let i = 0; i < 8; i++) {
                    eval(locationType + 'DailyConditions')[i] = capitaliseConditions(daily[i].weather[0]["description"]);
                    calculateRain(locationType, "daily", daily, i);
                    //fill in the 7-day forecast
                    document.getElementById(`${locationType}DailyImg` + [i]).src = `https://matt54633.com/weather/weatherIcons/${daily[i].weather[0]["icon"]}.svg`;
                    document.getElementById(`${locationType}DailyTemp` + [i]).innerHTML = Math.round(daily[i].temp.max) + "°<br>" + Math.round(daily[i].temp.min) + "°";
                    eval(locationType + 'DailyImg')[i] = `https://matt54633.com/weather/weatherIcons/${daily[i].weather[0]["icon"]}.svg`;
                    eval(locationType + 'DailyTemp')[i] = Math.round(daily[i].temp.max) + "° / " + Math.round(daily[i].temp.min) + "°";
                    if (daily[i].rain == null) {
                        eval(locationType + 'DailyInfo')[i] = eval(locationType + 'DailyConditions')[i] + "<br>Feels Like: " + Math.round(daily[0].feels_like.day) + "°&nbsp;&nbsp;&nbsp;&nbsp;Humidity: " + daily[i].humidity + "%<br>Wind: " + (Math.round(daily[i].wind_speed * 2.237)) + "mph&nbsp;&nbsp;&nbsp;&nbsp;Rain: " + Math.floor((daily[i].pop * 100)) + "%";
                    } else {
                        eval(locationType + 'DailyInfo')[i] = eval(locationType + 'DailyConditions')[i] + "<br>Feels Like: " + Math.round(daily[0].feels_like.day) + "°&nbsp;&nbsp;&nbsp;&nbsp;Humidity: " + daily[i].humidity + "%<br>Wind: " + (Math.round(daily[i].wind_speed * 2.237)) + "mph&nbsp;&nbsp;&nbsp;&nbsp;Rain: " + Math.floor((daily[i].pop * 100)) + "% / " + eval(locationType + 'DailyRain')[i];
                    }
                }
                if (locationType == "current") {
                    mapCenter = [y, x];
                    createMap(`${locationType}Map`, mapCenter);
                    displayRain(minutely);
                    displayAlerts(alerts);
                } else {
                    searchMap(locationType);
                }
            })
        }
    )
    if (locationType == "current") {
        await animate();
    }
}
// function to animate the page
async function animate() {
    // wait one second
    setTimeout(() => {
        const fadeElements = document.querySelectorAll('.fadeMiddle');
        document.getElementById('loader').style.display = 'none';
        fadeElements.forEach((el) => { el.classList.add('fadeMiddleShow') });
    }, 600);
}
// function to create the list items for the forecast
function createListItems(locationType, forecastType, index) {
    let ul = document.getElementById(`${locationType}${forecastType}Forecast`);
    while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
    }

    for (let i = 0; i < index; i++) {
        let listItem = document.createElement("li");
        let listItemH2 = document.createElement("h2");
        let listItemImg = document.createElement("img");
        let listItemH3 = document.createElement("h3");
        listItem.setAttribute("id", `forecastLi${i}`)
        listItem.setAttribute('onclick', 'openInfoPanel();');
        listItemImg.setAttribute('alt', 'Forecast Image');
        listItem.onclick = function () { openInfoPanel(locationType, forecastType, i); };
        listItemH2.setAttribute("id", `${locationType}${forecastType}Title${i}`);
        listItemImg.setAttribute("id", `${locationType}${forecastType}Img${i}`);
        listItemH3.setAttribute("id", `${locationType}${forecastType}Temp${i}`);

        listItem.append(listItemH2, listItemImg, listItemH3);
        ul.appendChild(listItem);
    }
};
// function to create the labels for the forecast items
function forecastItemLabels(hourlyArray, locationType) {
    let day = new Date();
    let week = new Array("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");
    for (let i = 0; i < 10; i++) {
        let date = new Date(hourlyArray[i].dt * 1000);
        HourlyTitles[i] = (date.getHours() + ":00").toString();
        DailyTitles[i] = week[(day.getDay() + 1 + (i - 1)) % 7];
        document.getElementById(locationType + "HourlyTitle" + [i]).innerText = HourlyTitles[i];
    }
    for (let i = 0; i < 8; i++) {
        document.getElementById(locationType + "DailyTitle" + [i]).innerText = DailyTitles[i];
    }
    document.getElementById(locationType + "DailyTitle0").innerText = "Today";
}
// function to open info panel
function openInfoPanel(locationType, forecastType, number) {
    document.getElementById('infoPanel').classList.add('fadeUpShow');
    document.getElementById('infoPanelTitle').textContent = eval(`${forecastType}Titles[${number}]`);
    document.getElementById('infoPanelImg').src = eval(`${locationType}${forecastType}Img[${number}]`);
    document.getElementById('infoPanelTemp').textContent = eval(`${locationType}${forecastType}Temp[${number}]`);
    document.getElementById('infoPanelInfo').innerHTML = eval(`${locationType}${forecastType}Info[${number}]`);
}
// function to close the info panel
function closeInfoPanel() {
    document.getElementById('infoPanel').classList.remove('fadeUpShow');
}
// function to auto-capitalise conditions
function capitaliseConditions(conditions) {
    conditions = JSON.stringify(conditions).replaceAll('"', '');
    conditions = conditions.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
    return conditions;
}
// refresh event handler
const refresh = document.getElementById('refresh');
refresh.addEventListener('click', () => {
    refresh.animate([{ transform: 'rotate(0) scale(1)' }, { transform: 'rotate(720deg) scale(1)' }], { duration: 300, iterations: 1, });
    weather('current', null, null);
    if (localStorage.getItem('previousSearch') != null) { 
        search(localStorage.getItem('previousSearch'));
    }
});
// search event handler
const searchLogo = document.getElementById('searchLogo');
searchLogo.addEventListener('click', () => {
    search();
})
// window load event handler
window.addEventListener('load', () => {
    weather('current', null, null);
    let previousSearch = localStorage.getItem('previousSearch');
    if (previousSearch != null) {
        search(previousSearch);
    }
});
// close search event handler
document.querySelectorAll('.closeSearch').forEach((el) => { el.addEventListener('click', () => {
    document.getElementById('search').style.display = 'none';
    localStorage.removeItem('previousSearch');
})});
// function to search for a location
function search(previousSearch) {
    let searchLocation;
    if (previousSearch != null) {
        searchLocation = previousSearch;
    } else {
        searchLocation = document.getElementById('input').value;
    }
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${searchLocation}&appid=${apiKey}&units=metric`)
        .then(response => response.json()).then(data => {
        const {name, sys, cod } = data;
        if (cod != 200) {
            alert(cod + " error: Please search again.");
        } else {
            fetch( `https://api.openweathermap.org/geo/1.0/direct?q=${searchLocation}&appid=${apiKey}`)
                .then(response => response.json()).then(data => {
                    let x = data[0].lat;
                    let y = data[0].lon;
                    document.getElementById('search').style.display = 'block';
                    let searchString = name + ", " + sys.country;
                    return weather('search', x, y, searchString);
                })
        }
        document.getElementById('input').value = "";
        document.getElementById('input').blur();
    })
    return false;
}
// function to calculate rain
function calculateRain(locationType, rainType, rainArray, index) {
    if (rainType == "hourly") {
        if (eval(rainArray[index].rain) == null) {
            eval(locationType + 'HourlyRain')[index] = "0mm";
        } else {
            eval(locationType + 'HourlyRain')[index] = Math.ceil(rainArray[index].rain["1h"]) + "mm";
        }
    } else {
        if (eval(rainArray[index].rain) == null) {
            eval(locationType + 'DailyRain')[index] = "0mm";
        } else {
            eval(locationType + 'DailyRain')[index] = Math.ceil(rainArray[index].rain) + "mm";
        }
    }
};
// function to create maps
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
// function to create a map from a search
function searchMap(locationType) {
    mapboxgl.accessToken = 'pk.eyJ1IjoibWF0dDU0NjMzIiwiYSI6ImNrN3FqeTM3djA0eGszZnA5ZzFzdHU5cncifQ.E05mbOmq5K83ZmeVeIPk8A';
    let mapboxClient = mapboxSdk({ accessToken: mapboxgl.accessToken });
    mapboxClient.geocoding.forwardGeocode({
            query: localStorage.getItem('previousSearch'),
            autocomplete: false,
            limit: 1
        })
        .send().then(function (response) {
            if (response && response.body && response.body.features && response.body.features.length) {
                mapCenter = response.body.features[0];
                mapCenter = mapCenter.center;
                createMap(`${locationType}Map`, mapCenter);
            }
        });
}
// function to create a rain chart
function displayRain(rainData) {
    let precipitation = [];
    let labels = [];
    let counter = 0;
    let rainDisplay = document.getElementById('rainDisplay');
    let rainChart = document.getElementById('rainChart');

    for (let i = 0; i < 60; i++) {
        labels[i] = i;
        precipitation[i] = rainData[i].precipitation;
        if (rainData[i].precipitation > 0) { 
            counter += 1;
        }
    }
    if (Chart.getChart("rainChart") != undefined) {
        Chart.getChart("rainChart").destroy();
    } 
    if (counter > 5) {
        rainDisplay.style.display = "block";    
        new Chart(rainChart, {
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
                }
            }
        });
    } else { 
        rainDisplay.style.display = "none";
    }
}
// function to display weather alerts
function displayAlerts(alertsData) {
    if (alertsData != null) {
        document.getElementById('alertsDisplay').style.display = 'block';

        alertsData[0].event = JSON.stringify(alertsData[0].event).replaceAll('"', '');
        alertsData[0].event = alertsData[0].event.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
        document.getElementById('alertsDisplayTitle').innerText = alertsData[0].event;

        let date = new Date(alertsData[0].end * 1000);
        date = date.toLocaleString('en-GB');
        date = date.slice(0, -3);
        document.getElementById('alertsDisplayInfo').innerHTML = "A " + alertsData[0].event + " is active until: " + date + " - " + alertsData[0].sender_name;
    } else { 
        document.getElementById('alertsDisplay').style.display = 'none'; 
    }
};
// copyright footer
document.getElementById('footerInfo').innerText = '©Matt Sullivan - ' + new Date().getFullYear();