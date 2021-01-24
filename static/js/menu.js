let aircraftPoint;

//Стартовое меню
function left_menu_constructor() {
    $('.right-menu').css({ display: "none" });
    $('.left-menu').empty();
    if (prewGraphicAircraft) prewLayerAircraft.remove(prewGraphicAircraft);
    if (list) {
        console.log('Внутри');
        $(".left-menu").append(list);
    } else {
        $('.left-menu').append(`
      <!-- Блок формы -->
            <div class="input-form">
              <div class="input-form-margin">
                <div class="form-group">
                  <div class="label-text head-text"><label>Aircraft Identificator (icao24)</label></div>
                  <input class="form-control" id="icao24" placeholder="search" aria-describedby="emailHelp">
              </div>
              <div class="label-text head-text"> <label>Time interval</label> </div>
              <div class="form-row">
                  <div class="form-group col margin-date">
                    <input type="datetime-local" class="form-control date-form" id="start_date" onchange="changeLeftDate(this)">
                    <div id="date-error-1" class="date-error"> Здесь будет ошибка. </div>
                  </div>
                  <div class="form-group col-md-1 text-center date-tire">
                    -
                  </div>
                  <div class="form-group col margin-date">
                    <input type="datetime-local" class="form-control date-form" id="end_date">
                    <div id="date-error-2" class="date-error"> Здесь будет ошибка. </div>
                  </div>
              </div>
              <div class="d-flex flex-row-reverse">
                <div class="p bd-highlight">
                    <div class="btn-center">
                  <button class="btn btn-primary btn-search" onclick="validate()">Search</button>
                  </div>
                </div>
              </div>
              
            </div>
          </div>

          <!-- Блок таблицы -->
          <div class="table-left table-responsive">
            <table class="table-sm table-bordered table-1">
              <thead>
                <tr>
                  <th scope="col">icao24</th>
                  <th scope="col">Callsign</th>
                  <th scope="col">First seen</th>
                  <th scope="col">Last seen</th>
                  <th scope="col">Departure airport</th>
                  <th scope="col">Arrival airport</th>
                </tr>
              </thead>
              <tbody id="flyingTable">
              </tbody>
            </table>
          </div>
          <div class="d-flex flex-row-reverse">
            <div class="p bd-highlight">
              <button class="btn btn-primary btn-ok" onclick="add_menu_data()">Ok</button>
            </div>
          </div>`);
    }
    resize_left_menu();
}

// Открытие опредленного рейса
function add_menu_data() {
    if (coords) {
        list = $('.left-menu').html();
        $('.right-menu').css({ display: "block" });
        $('.left-menu').empty();
        $('.left-menu').append(`
          <img class="btn-return" onclick="left_menu_constructor()" src="static/img/arrow-left.png">
            <h6 class="left-menu-name head-text">Flight data</h4>
            <table class="table-2">
            <tr>
              <td>Aircraft Identificator (icao24):</td>
              <td class="dataFlying-icao24">xxx</td>
            </tr>
            <tr>
              <td>Callsign:</td>
              <td class="dataFlying-callsign">xxx</td>
            </tr>
            <tr>
              <td>Departure airport:</td>
              <td class="dataFlying-estdepartureairport">xxx</td>
            </tr>
            <tr>
              <td>Arrival airport:</td>
              <td class="dataFlying-estarrivalairport">xxx</td>
            </tr>
            <tr>
              <td>First seen:</td>
              <td class="dataFlying-firstseen">xxx</td>
            </tr>
            <tr>
              <td>Last seen:</td>
              <td class="dataFlying-lastseen">xxx</td>
            </tr>
          </table>
          <h6 class="left-menu-name head-text">Magnetic field data</h4>
          <table class="table-3">
            <tr>
              <td>Time</td>
              <td>xxx</td>
            </tr>
            <tr>
              <td>Latitude</td>
              <td>xxx</td>
            </tr>
            <tr>
              <td>Longitude</td>
              <td>xxx</td>
            </tr>
            <tr>
              <td>Barometric atitude, [m]</td>
              <td>xxx</td>
            </tr>
            <tr>
              <td>North Component (Bx), [nT]</td>
              <td>xxx</td>
            </tr>
            <tr>
              <td>East Component (By), [nT]</td>
              <td>xxx</td>
            </tr>
            <tr>
              <td>Down Component (Bz), [nT]</td>
              <td>xxx</td>
            </tr>
            <tr>
              <td>Geomagnetic field induction (|B|), [nT]</td>
              <td>xxx</td>
            </tr>
            <tr>
              <td>Rate of change (|ΔB|/Δt), [nT/sec]</td>
              <td>xxx</td>
            </tr>
          </table>
          <div class="d-flex bd-highlight button-play">
            <div id="btn-play" class="p-2 bd-highlight btn-play" onclick="start()">
              <img src="static/img/play.svg">
            </div>
            <div id="btn-speedUp" class="p-2 bd-highlight btn-play" onclick="speedUp()">
              <img src="static/img/speed-up.svg">
            </div>
            <div id="btn-pause" class="p-2 bd-highlight btn-play" onclick="pauseAircraft()">
              <img src="static/img/pause.svg">
            </div>
            <div id="btn-stop" class="p-2 bd-highlight btn-play" onclick="stop()">
              <img src="static/img/stop.svg">
            </div>
          </div>`);
        resize_left_menu();

        //Создаем объект
        aircraftPoint = {};
        aircraftPoint.Latitude = coords[0][1];
        aircraftPoint.Longitude = coords[0][0];
        aircraftPoint.time = timePoints[0];

        $('.dataFlying-icao24').text(dataFlying.icao24);
        $('.dataFlying-firstseen').text(dataFlying.firstseen);
        $('.dataFlying-callsign').text(dataFlying.callsign);
        $('.dataFlying-estdepartureairport').text(dataFlying.estdepartureairport);
        $('.dataFlying-estarrivalairport').text(dataFlying.estarrivalairport);
        $('.dataFlying-lastseen').text(dataFlying.lastseen);

        addAircraft(aircraftPoint);
    }
}