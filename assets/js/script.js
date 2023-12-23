
const today = $('#today'); //selecting the section to append info for today's forecast
const forecast = $('#forecast'); // selecting the section to append a div of info for the next 5 days of forecast
let storedCity = [];
let isToday = true;

renderLocalStorage();

$('#search-button').on('click', function(event){
    event.preventDefault();
    let citySearched = $('#search-input').val();
    fetchCityLatLon(citySearched) //run the fetch with the city the user searched
});

$('#clear-button').on('click', function(event){
    event.preventDefault();
    localStorage.clear();
    forecast.empty(); 
    today.empty(); 
    today.css('border', '');
    $('.history-btns').empty();
    storedCity = [];
});

let cityLat;
let cityLon;


function fetchCityLatLon(city){ //this fetch takes the users city input and pulls the coordinates
    forecast.empty(); 
    today.empty();

    let queryCityURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=metric&appid=6b4a10c6ed815160709463b2908e2d4d";

    fetch(queryCityURL)
    .then(function(response){
        return response.json();
    }).then(function(data){
    
        cityLat = data.city.coord.lat;
        cityLon = data.city.coord.lon;

        fetchCityForecast(cityLat, cityLon); //calls the next fetch using the coordinates

    }).catch(function(){
        today.css('border', '1px solid black');
        today.append($('<h5>').text('Incorrect input, please try again.').css('color', 'red'))
    });
};

function fetchCityForecast(cityLat, cityLon){ //this fetch uses coordinates 

    let queryLatLonURL = "https://api.openweathermap.org/data/2.5/forecast?lat=" + cityLat + "&lon=" + cityLon + "&units=metric&appid=6b4a10c6ed815160709463b2908e2d4d";

    fetch(queryLatLonURL)
    .then(function(response){
        return response.json();
    }).then(function(data){
        console.log(data);

        let apiCity = data.city.name;

        for(let i = 0; i < data.list.length; i++){

            let apiDate = data.list[i].dt_txt.substr(0, 10); //.substr(0, 10) keeps the first 10 characters of the string so from this: 2023-12-18 12:00:00 to this: 2023-12-18
            let properDate = dayjs(`${apiDate}`, `YYYY-MM-DD`).format(`DD/MM/YYYY`); // converts the API date to a different format
            let weatherIcon = `https://openweathermap.org/img/w/${data.list[i].weather[0].icon}.png`;
            let wind = (data.list[i].wind.speed * 2.237).toFixed(2); //the API wind speed is in meters per sec (MPS) so to get MPH = MPS * 2.237
            let temp = data.list[i].main.temp;
            let humidity = data.list[i].main.humidity;
            let day = data.list[i].dt_txt.substr(8, 2); //to obtain the day from the date text of the API - to use to add dates to id's
            let time = data.list[i].dt_txt.substr(11, 2); //to obtain the hour from the date text of the API - to use to show only midday forecasts

            if(isToday){ //this will render the forecast for todays most current time  
                today.css('border', '1px solid black');
                const forecast5Day = $('<h2>');
                forecast5Day.attr('class', 'ps-0');
                forecast5Day.text('5-Day Forecast:');
                forecast.append(forecast5Day);
                renderWeather(day, apiCity, properDate, weatherIcon, temp, wind, humidity);
                isToday = false; // changes to false so that on the next loop it will render the else if statement
            }else if (!isToday && (time == '09') ){ //this will render 9am forecasts for other dates that aren't today's date
                renderWeather(day, apiCity, properDate, weatherIcon, temp, wind, humidity);
            }
        };
        isToday = true; //after for loop runs, change isToday back to true so when fetchCityForecast() runs again, the today section is rendered

        if(storedCity.includes(apiCity)){
            return // prevents duplicate history btns being made
        }else{
            createSearchHistoryBtn(apiCity);
            storeSearchHistory(apiCity);
        }; 
    });
};

function renderWeather(day, city, properDate, weatherIcon, temp, wind, humidity){
    
    const newImg = $('<img>');
    newImg.attr({'src': weatherIcon, 'id': `day-${day}-img`});
    
    const newTemp = $('<p>');
    newTemp.attr('id', `day-${day}-temp`);
    newTemp.text(`Temp: ${temp}°c`);

    const newWind = $('<p>');
    newWind.attr('id', `day-${day}-wind`);
    newWind.text(`Wind: ${wind} MPH`);

    const newHumidity = $('<p>');
    newHumidity.attr('id', `day-${day}-humidity`);
    newHumidity.text(`Humidity: ${humidity}%`);

    if(isToday){
        const newH2 = $('<h2>');
        newH2.attr('id', `todays-date-${day}`);
        newH2.text(`${city} ${properDate}`);
        newH2.append(newImg); //adds img to the header

        today.append(newH2, newTemp, newWind, newHumidity);
    }else{
        const newDiv = $('<div>');
        newDiv.attr({'id': `day-${day}-weather`, 'class': 'col-lg-2 mx-auto my-2 smaller-text'}); 
        newDiv.css({'background-color': '#304356', 'color': 'white', 'border-radius': '5px'});

        const newH5 = $('<h5>');
        newH5.attr({'id': `date-${day}`, 'class': 'mt-2 smaller-text'});
        newH5.text(`${properDate}`);

        newDiv.append(newH5,newImg, newTemp, newWind, newHumidity);
        forecast.append(newDiv);
    };
};

/****************************** LOCAL STORAGE & HISTORY ****************************************/

function createSearchHistoryBtn(city){
    let newBtn = $('<button>');
    newBtn.attr({'class': 'btn btn-secondary col-12 mt-2', 'data-city': `${city}`});
    newBtn.text(`${city}`);
    $('.history-btns').append(newBtn);
};

function storeSearchHistory(city){
    storedCity.push(city);
    localStorage.setItem("city", JSON.stringify(storedCity));
};

function renderLocalStorage(){
    storedCity = (JSON.parse(localStorage.getItem('city')) || storedCity);
    for(let i = 0; i < storedCity.length; i++){
        createSearchHistoryBtn(storedCity[i]);
    };
};


//bring up the city forecast when a history button is clicked
$('.history-btns').on('click', '.btn-secondary', function(event){ 
    event.preventDefault();
    let target = event.target.dataset.city;
    fetchCityLatLon(target)
    // fetchCityForecast(target);
})

/********************************************************************************************/


