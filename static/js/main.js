let openRightMenu = true;
let errorsDate = [
    "Дата должна быть не раньше месяца.",
    "Рейс должен быть не более 2 часов.",
    "Введите дату.",
    "Нет данных.",
    "Рейс должен быть не более месяца.",
];
let map, view, simpleMarkerSymbol, simpleLineSymbol;
let dateTable;
// Скорость
let speed = 1;
// 1 - пауза, 2 -стоп, 0 - работает
let pause = 2;
// Текущая точка
let currentPoint = 0;
// Переменные координат и времени
let coords, timePoints;
// Переменная сохранения всех путей
let list, dataFlying;
let graphicsLayerName, graphicName;
let prewGraphic, prewGraphicsLayer, prewLayerAircraft, prewGraphicAircraft;
let stepFunction;

$(function () {
    // При загрузке страницы
    left_menu_constructor();
    resize_left_menu();

    // Расположение картинки сворачивания окна
    $('.holding').offset({ top: (($(window).height() - $('.holding').height()) / 2) });
    $('.holding').offset({ left: ($('.holding').offset().left - $('.holding').width() / 2) });
});

// При нажатии на правое меню
$('.holding').on('click', function (e) {
    // Открыть меню
    if (!openRightMenu) {
        //$('.right-menu').width('20%');
        $(".right-menu").animate({ width: "20%" }, 100);
        $('.right-menu-table').css({ display: "block" });
        openRightMenu = true;
    } else { // Закрыть меню
        //$('.right-menu').width('5%');
        $(".right-menu").animate({ width: "5%" }, 100);
        $('.right-menu-table').css({ display: "none" });
        openRightMenu = false;
    }
});

function resize_left_menu() {
    $('.table-left').height($(window).height() - $('.input-form').height() - 130);

    if ($('.left-menu').height() < $(window).height())
        $('.left-menu').height($(window).height());
}

// Работа с картой (Инициализация)
require([
    "esri/Map",
    "esri/views/MapView",
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/layers/MapImageLayer",
    "esri/layers/support/MapImage",
], function (Map, MapView, Graphic, GraphicsLayer, MapImageLayer, MapImage) {
    graphicsLayerName = GraphicsLayer;
    graphicName = Graphic;
    map = new Map({
        basemap: "streets",
    });

    view = new MapView({
        container: "map",
        map: map,
        center: [-118.80500, 34.02700],
        zoom: 2,
    });

    simpleMarkerSymbol = {
        type: "simple-marker",
        color: [0, 0, 0],
        size: 5,
        outline: {
            color: [255, 255, 255],
            width: 1,
        },
    };

    simpleLineSymbol = {
        type: "simple-line",
        color: [226, 119, 40], // orange
        width: 1,
    };
    prewLayerAircraft = new graphicsLayerName();
    map.add(prewLayerAircraft);
});

// Валидация
function validate() {
    $('#flyingTable').empty();
    let errors = false;
    $('#date-error-1').css({ display: "none" });
    $('#date-error-2').css({ display: "none" });
    let startDate = getTimeToGTM($('#start_date').val(), false),
        endDate = getTimeToGTM($('#end_date').val(), false),
        nowDate = getTimeToGTM('', true),
        icao = $('#icao24').val();

    // Если больше месяца
    if (nowDate - 2629743 > startDate) {
        errors = setErrorDate('#date-error-1', 0);
    }
    // Промежуток при наличии icao
    if (icao && endDate - startDate >= 2628000) {
        errors = setErrorDate('#date-error-2', 4);
    } else {// Промежуток в 2 часа для просто даты
        if ((endDate - startDate >= 7200 && !endDate) || (endDate - startDate < 0 && !endDate)) {
            errors = setErrorDate('#date-error-2', 1);
        }
    }
    // Если начальная дата пустая
    if (!startDate) {
        errors = setErrorDate('#date-error-1', 2);
    }


    if (!errors) {
        let url = (icao) ? 'https://opensky-network.org/api/flights/aircraft?icao24=' + icao + '&begin=' + startDate + '&end=' + endDate :
            'https://opensky-network.org/api/flights/all?begin=' + startDate + '&end=' + endDate;
        getAllFlightsWithinDateRange(url, 'getFlights');
    }
}

function setErrorDate(id_date, error) {
    $(id_date).text(errorsDate[error]);
    $(id_date).css({ display: "block" });
    return true;
}

function entryInTheTableFlying(data) {
    data.forEach(function (item, i) {
        $("#flyingTable").append(`
        <tr onclick="setFocusTable(this)" data-icao24 = "` + item.icao24 + `" data-firstSeen = "` + item.firstSeen + `" data-callsign = "` + item.callsign + `" data-estDepartureAirport = "` + item.estDepartureAirport + `" data-estArrivalAirport = "` + item.estArrivalAirport + `" data-lastSeen = "` + item.lastSeen + `">
          <th scope="row">` + item.icao24 + `</th>
          <td>` + item.callsign + `</td>
          <td>` + dateConverter(item.firstSeen) + `</td>
          <td>` + dateConverter(item.lastSeen) + `</td>
          <td>` + item.estDepartureAirport + `</td>
          <td>` + item.estArrivalAirport + `</td>
        </tr>
      `);
    });
}

// При нажатии на определенный полет
function setFocusTable(tr) {
    $('.table-1 tr').removeClass('marked');
    $(tr).addClass('marked');
    let url = 'https://opensky-network.org/api/tracks/all?icao24=' + $(tr).data('icao24') + '&time=' + ($(tr).data('firstseen') + 1);
    getAllFlightsWithinDateRange(url, 'getPoints');

    // Заполнение данных полей
    dataFlying = {};
    dataFlying.icao24 = $(tr).data('icao24');
    dataFlying.firstseen = $(tr).data('firstseen');
    dataFlying.callsign = $(tr).data('callsign');
    dataFlying.estdepartureairport = $(tr).data('estdepartureairport');
    dataFlying.estarrivalairport = $(tr).data('estarrivalairport');
    dataFlying.lastseen = $(tr).data('lastseen');
}

function dateConverter(unix_timestamp) {
    let time = new Date(unix_timestamp * 1000).getTimezoneOffset() * 60;
    let date = new Date((unix_timestamp + time) * 1000)
    let month = date.getMonth() + 1,
        hours = (date.getHours() < 10) ? '0' + date.getHours() : date.getHours(),
        minutes = (date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes(),
        seconds = (date.getSeconds() < 10) ? '0' + date.getSeconds() : date.getSeconds();
    month = (month < 10) ? '0' + month : month;
    let years = date.getDate() + '.' + month + '.' + date.getFullYear();
    hours = hours + '.' + minutes + '.' + seconds;
    return years + ' ' + hours;
}

function getTimeToGTM(time, nowDate) {
    date = (nowDate) ? new Date() : new Date(time);
    let difference = date.getTimezoneOffset() * 60; // Разница текущего пояса с UTC
    return date.getTime() / 1000 - difference;
}

// При изменении начальной даты 
function changeLeftDate(obj) {
    if (!$('#end_date').val()) {
        //$('#end_date').val()
        let hours, days, time = $(obj).val() + '';
        let t = time.indexOf('T');
        hours = Number(time[t + 1] + '' + time[t + 2]);
        days = Number(time[t - 2] + '' + time[t - 1]);
        if (hours + 2 >= 24) days++;
        hours = (hours + 2) % 24;
        hours = (hours < 10) ? '0' + hours : String(hours);
        days = (days < 10) ? '0' + days : String(days);
        let date = time.slice(0, t - 2) + days + 'T' + hours + time.slice(t + 3, time.length);
        $('#end_date').val(date);
    }
}

function setCoordinates(data) {
    let minLatitude = data[0][2];
    let maxLatitude = data[0][2];
    let minLongitude = data[0][1];
    let maxLongitude = data[0][1];

    coords = [];
    timePoints = [];

    data.forEach(function (item, i) {
        coords[i] = [item[2], item[1]];
        timePoints[i] = item[0];
        if (item[2] > maxLatitude) maxLatitude = item[2];
        if (item[2] < minLatitude) minLatitude = item[2];
        if (item[1] > maxLongitude) maxLongitude = item[1];
        if (item[1] < minLongitude) minLongitude = item[1];
    });
    getCenter(minLatitude, maxLatitude, minLongitude, maxLongitude);
    drawPolyline(coords);
}

function drawPolyline(points) {
    let graphicsLayer = new graphicsLayerName();
    map.add(graphicsLayer);

    if (prewGraphic) prewGraphicsLayer.remove(prewGraphic);

    var polyline = {
        type: "polyline",  // autocasts as new Polyline()
        paths: points,
    };

    var polylineSymbol = {
        type: "simple-line",  // autocasts as SimpleLineSymbol()
        color: [0, 255, 0],
        width: 4,
    };

    var polylineGraphic = new graphicName({
        geometry: polyline,
        symbol: polylineSymbol,
    });

    prewGraphic = polylineGraphic;

    graphicsLayer.add(polylineGraphic);
    prewGraphicsLayer = graphicsLayer;
}

function getCenter(minLatitude, maxLatitude, minLongitude, maxLongitude) {
    view.center = [(maxLatitude + minLatitude) / 2, (maxLongitude + minLongitude) / 2];
    view.zoom = 6;
}

// Добавление самолета
function addAircraft(aircraft) {
    setPoint(aircraft.Longitude, aircraft.Latitude)
}

function start() {
    speed = 1;
    if (pause == 2) {
        pause = 0;
        nextPoint();
    } else {
        pause = 0;
    }
    $(".btn-play").css("background-color", "white");
    $("#btn-play").css("background-color", "#007bff");
}

function nextPoint() {
    let nextPoint = {};
    nextPoint.time = timePoints[currentPoint + 1];
    nextPoint.Longitude = coords[currentPoint + 1][0];
    nextPoint.Latitude = coords[currentPoint + 1][1];
    movePoint(aircraftPoint, nextPoint);
}

function stop() {
    pause = 2;
    aircraftPoint.Latitude = coords[0][1];
    aircraftPoint.Longitude = coords[0][0];
    aircraftPoint.time = timePoints[0];
    currentPoint = 0;
    if (stepFunction) clearTimeout(stepFunction);
    setPoint(aircraftPoint.Longitude, aircraftPoint.Latitude);
    $(".btn-play").css("background-color", "white");
}

function pauseAircraft() {
    pause = 1;
    $(".btn-play").css("background-color", "white");
    $("#btn-pause").css("background-color", "#007bff");
}

function speedUp() {
    speed = 2;
    if (pause == 2) {
        pause = 0;
        nextPoint();
    } else {
        pause = 0;
    }
    $(".btn-play").css("background-color", "white");
    $("#btn-speedUp").css("background-color", "#007bff");
}

function setPoint(Longitude, Latitude) {
    var point = {
        type: "point",
        longitude: Longitude,
        latitude: Latitude,
    };

    var simpleMarkerSymbol = {
        type: "simple-marker",
        color: [255, 0, 0],  // orange
        outline: {
            color: [255, 255, 255], // white
            width: 1,
        },
    };

    if (prewGraphicAircraft) prewLayerAircraft.remove(prewGraphicAircraft);

    prewGraphicAircraft = new graphicName({
        geometry: point,
        symbol: simpleMarkerSymbol,
    });

    prewLayerAircraft.add(prewGraphicAircraft);
}

// Aircraft - данные о начальной точке, point данные о конечной точке
function movePoint(aircraft, point) {
    // количество секунд необходимых для передвижения
    let seconds = point.time - aircraft.time;
    // Шаги за 1 секунду
    let stepLongitude = (point.Longitude - aircraft.Longitude) / seconds;
    let stepLatitude = (point.Latitude - aircraft.Latitude) / seconds;

    console.log(seconds, stepLongitude, stepLatitude, point.Longitude - aircraft.Longitude, point.Latitude - aircraft.Latitude);

    step();

    function step() {
        switch (pause) {
            case 0:

                let speedPlay = (seconds - speed < 0) ? seconds : speed;

                aircraft.Longitude += stepLongitude * speedPlay;
                aircraft.Latitude += stepLatitude * speedPlay;
                seconds -= speedPlay;

                setPoint(aircraft.Longitude, aircraft.Latitude);

                if (seconds > 0 && !(stepLongitude == 0 && stepLatitude == 0))
                    stepFunction = setTimeout(step, 1000);
                else {
                    currentPoint++;
                    nextPoint();
                }
                break;

            case 1:
                stepFunction = setTimeout(step, 1000);
                break;

            case 2:
                return 0;
                break;
        }
    }
}