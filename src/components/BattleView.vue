<template>
    <div>
        <vs-navbar text-white :color="'rgb(250,128,114)'">
            <template #left>
                <i class='bx bxs-planet bx-md'></i>
                <h4 class="not-margin">
                    <b>Auralux</b>
                </h4>
            </template>
            <template #right>
                <vs-navbar-item @click="CheckRedirecting('battles')" id="battles">
                    Battles
                </vs-navbar-item>
                <vs-navbar-item @click="CheckRedirecting('maps')" id="maps">
                    Maps
                </vs-navbar-item>
                <vs-navbar-item @click="CheckRedirecting('strategies')" id="strategies">
                    Strategies
                </vs-navbar-item>
                <vs-navbar-item @click="CheckRedirecting('tournaments')" id="tournaments">
                    Tournaments
                </vs-navbar-item>
            </template>
        </vs-navbar>
        <br/>
        <br/>
        <div>
            <canvas id="myCanvas" class="canvas" width="700" height="700"/>
        </div>
        <div style="padding: 30px" class="input-set">
            <label id="SpeedInput">Скорость игры: 1</label><br>
            <input id="GameSpeed" value="1" type="range" class="SpeedRange" step="1" min="000" max="100">
        </div>
    </div>
</template>

<script>
    export default {
        data:() => ({
            battle_id: null,
            run_id: null,
            planets: [],
            PlanetsCount: 0,
            lines: [],
            game_not_stopped: true,
            groups_ship: [],
            colors: ["rgb(0, 0, 0)", "rgb(255, 0, 0)", "rgb(0, 255, 0)", "rgb(0, 0, 255)", "rgb(255, 215, 0)", "rgb(255, 0, 255)", "rgb(0, 255, 255)", "rgb(0, 100, 0)", "rgb(128, 0, 0)"],
            planet_state: [],
            distance: [],
            MaxX: 0,
            MaxY: 1,
            Koef: 1,
            LineNow: 0,
            Run: 0,
            TryToSetDataInterval: null,
            height: 700,
            width: 700
        }),
        mounted() {
            this.battle_id = this.$route.params.battle_id;
            this.run_id = this.$route.params.run_id;
            this.GetLogs();
            this.TryToSetDataInterval = setInterval(this.TryToSetData(), 100);
        },
        created() {
            document.title = "Auralux";
        },
        methods : {
            openNotification(position = null, color, text) {
                this.$vs.notification({
                    sticky: true,
                    color,
                    position,
                    title: 'Something went wrong',
                    text: text
                });
            },
            CheckRedirecting(RedirectTo) {
                this.$router.push('/' + RedirectTo);
            },
            async GetLogs() {
                await this.axios.get("http://127.0.0.1:8080/battle/run_vis",
                {
                    params: {
                        "id": this.run_id
                    },
                    headers: {
                        Authorization: `Bearer ${ this.$cookies.get("SessionToken") }`
                    },
                }).then(response => {
                    this.lines = response["data"].split("\n");
                    this.parseFile();
                }).catch(error => {
                    if (error.response["data"]["reason"] == "Unauthorized") {
                        this.$router.push('/');
                        this.openNotification('top-left', 'danger', 'You need to login');
                    } else if (error.response["data"]["reason"] == "Not Found") {
                        this.openNotification('top-left', 'danger', 'You typed non-existent submission id');
                    }
                    else {
                        this.openNotification('top-left', 'danger', 'Check if your internet is fast enough and try again');
                    }
                });
            },
            TimeNow() {
                return new Date().getTime() / 1000 + new Date().getTimezoneOffset() * 60;
            },
            TryToSetData() {
                if (document.getElementById('GameSpeed') != null) {
                    clearInterval(this.TryToSetDataInterval);
                    window.addEventListener("resize", function() {
                        document.location.reload();
                    });
                    var GameSpeed = document.getElementById('GameSpeed');
                    var SpeedInput = document.getElementById('SpeedInput');
                    GameSpeed.addEventListener('input', function() {
                        SpeedInput.innerHTML = "Скорость игры: " + this.value;
                    }, false);
                }
            },
            parseFile() {
                let splitted = this.lines[this.LineNow];
                this.LineNow++;
                this.PlanetsCount = parseInt(splitted);
                this.planet_state = new Array(this.PlanetsCount);
                this.distance = new Array(this.PlanetsCount);
                for (var i = 0; i < this.PlanetsCount; i++) {
                    splitted = this.lines[this.LineNow].split(' ');
                    this.LineNow++;
                    this.planets.push([parseInt(splitted[0]), parseInt(splitted[1])]);
                }
                for (i = 0; i < this.PlanetsCount; i++)
                {
                    this.planets[i][0] += 5;
                    this.planets[i][1] += 5;
                }
                for (i = 0; i < this.PlanetsCount; i++)
                {
                    this.MaxX = Math.max(this.MaxX, this.planets[i][0]);
                    this.MaxY = Math.max(this.MaxY, this.planets[i][1])
                }
                this.Koef = (this.height - 100) / this.MaxY;
                for (i = 0; i < this.PlanetsCount; i++)
                {
                    this.planets[i][0] *= this.Koef;
                    this.planets[i][1] *= this.Koef;
                }
                for (i = 0; i < this.PlanetsCount; i++)
                {
                    this.distance[i] = new Array(this.PlanetsCount);
                    for (var j = 0; j < this.PlanetsCount; j++)
                    {
                        var x = this.planets[i][0] - this.planets[j][0];
                        var y = this.planets[i][1] - this.planets[j][1];
                        this.distance[i][j] = Math.round(Math.sqrt(x * x + y * y));
                    }
                }
                this.Run = setInterval(this.Visualize, 100 - document.getElementById('GameSpeed').value);
            }, ReadEvent() {
                var m = parseInt(this.lines[this.LineNow]);
                this.LineNow++;
                if (m == -1)
                {
                    this.game_not_stopped = false;
                    return;
                }
                var FromPlanetId, ToPlanetId, Count, PlayerId;
                for (var i = 0; i < m; i++)
                {
                    var splitted = this.lines[this.LineNow].split(' ');
                    this.LineNow++;
                    PlayerId = parseInt(splitted[0]);
                    FromPlanetId = parseInt(splitted[1]);
                    ToPlanetId = parseInt(splitted[2]);
                    Count = parseInt(splitted[3]);
                    this.groups_ship.push([FromPlanetId - 1, ToPlanetId - 1, Count, 0, PlayerId]);
                }
                var ShipCount, Level;
                for (i = 0; i < this.PlanetsCount; i++)
                {
                    splitted = this.lines[this.LineNow].split(' ');
                    this.LineNow++;
                    PlayerId = parseInt(splitted[0]);
                    ShipCount = parseInt(splitted[1]);
                    Level = parseInt(splitted[2]);
                    this.planet_state[i] = [PlayerId, ShipCount, Level];
                }
            }, MoveShips() {
                var groups_ship_new = [];
                var FromPlanetId, ToPlanetId, Count, time, PlayerId;
                for (var i = 0; i < this.groups_ship.length; i++)
                {
                    FromPlanetId = this.groups_ship[i][0];
                    ToPlanetId = this.groups_ship[i][1];
                    Count = this.groups_ship[i][2];
                    time = this.groups_ship[i][3];
                    PlayerId = this.groups_ship[i][4];
                    if (time + 3.9 < this.distance[FromPlanetId][ToPlanetId])
                    {
                        groups_ship_new.push([FromPlanetId, ToPlanetId, Count, time + 3.9, PlayerId]);
                    }
                }
                this.groups_ship = groups_ship_new;
            }, coord_move(from, to, time)
            {
                var from_c = this.planets[from];
                var to_c = this.planets[to];
                var x = from_c[0] + (to_c[0] - from_c[0]) * time / this.distance[from][to];
                var y = from_c[1] + (to_c[1] - from_c[1]) * time / this.distance[from][to];
                return [x, y];
            }, Draw () {
                var canvas = document.getElementById("myCanvas");
                var ctx = canvas.getContext("2d");
                ctx.beginPath();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.stroke();
                var PlayerId, ShipCount, Level, x, y, r;
                for (var i = 0; i < this.PlanetsCount; i++)
                {
                    x = this.planets[i][0];
                    y = this.planets[i][1];
                    PlayerId = this.planet_state[i][0];
                    ShipCount = this.planet_state[i][1];
                    Level = this.planet_state[i][2];
                    r = (5 * Level) + 5 * 2 / 3;
                    var gradient = ctx.createRadialGradient(x, y, 2, x, y, Math.max(4, 5 * Math.sqrt(ShipCount) / ((Level + 1))));
                    gradient.addColorStop(0, this.colors[PlayerId]);
                    gradient.addColorStop(1, 'white');
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(x, y, r, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.stroke();
                    ctx.fillStyle = "rgb(0, 0, 0)";
                    var minus_x = (ShipCount.toString()).length + 5;
                    if ((ShipCount.toString()).length == 1) {
                        minus_x = 2;
                    }
                    ctx.beginPath();
                    ctx.fillText(ShipCount, x - minus_x, y + r + 10, 16);
                    ctx.stroke();
                }
                r = 3;
                var FromPlanetId, ToPlanetId, Count, time;
                for (i = 0; i < this.groups_ship.length; i++)
                {
                    FromPlanetId = this.groups_ship[i][0];
                    ToPlanetId = this.groups_ship[i][1];
                    Count = this.groups_ship[i][2];
                    time = this.groups_ship[i][3];
                    PlayerId = this.groups_ship[i][4];
                    ctx.fillStyle = this.colors[PlayerId];
                    var cords = this.coord_move(FromPlanetId, ToPlanetId, time);
                    ctx.beginPath();
                    ctx.arc(cords[0], cords[1], r, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.fillStyle = "rgb(0, 0, 0)";
                    ctx.beginPath();
                    minus_x = (Count.toString()).length + 5;
                    if ((Count.toString()).length == 1) {
                        minus_x = 2;
                    }
                    ctx.fillText(Count, cords[0] - minus_x, cords[1] + r + 10, 16);
                    ctx.stroke();
                }
            }, Visualize() {
                this.ReadEvent();
                if (this.game_not_stopped) {
                    this.Draw();
                    this.MoveShips();
                }
                clearInterval(this.Run);
                this.Run = setInterval(this.Visualize, 100 - document.getElementById('GameSpeed').value);
            }
        }
    }
</script>


<style scoped>
    .dropbtn {
        background:orange;
        background-image: url("https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Windows_Settings_app_icon.png/50px-Windows_Settings_app_icon.png");
        padding: 25px;
        border:2px solid rgba(255, 166, 0, 0.459);
        border-radius:100px;
        cursor: pointer;
      }
      .dropbtn:hover {
        background-color:rgb(218, 147, 16);
      }
      .dropdown {
        position: relative;
        display: inline-block;
      }
      .dropdown-content {
        display: none;
        position: absolute;
        min-width: 250px;
        overflow: auto;
        z-index: 1;
      }
      .dropdown-content a {
        color: black;
        padding: 12px 16px;
        text-decoration: none;
        display: block;
      }
      .dropdown a:hover {background-color: #ddd;}
      .show {display: block;}
    #animate {
        width: 50px;
        height: 50px;
        position: absolute;
        background-color: rgb(59, 159, 253);
    }
    .btn {
        border: 2px solid black;
        background-color: white;
        color: black;
        padding: 7px 14px;
        font-size: 14px;
        cursor: pointer;
        display: none;
    }
    .add_point {
        position: absolute;
        border-radius: 50px;
        border-color: #4CAF50;
        border-color: #4CAF50;
        color: green;
    }
    .show {display: block;}
    .date {
        display: none;
        position: absolute;
        transform: scale(1, 1);
    }
    .show {display: block;}
    .close {
        display: none;
        cursor: pointer;
        position: absolute;
        padding: 12px 16px;
        transform: translate(0%, -50%);
      }
    .show {display: block;}
    .close:hover {background: #bbb;}
    .delete {
        display: none;
        position: absolute;
        padding: 12px 16px;
        color: red;
    }
    .show {display: block;}
    .delete:hover {background: rgb(250, 249, 249);}
    .description {
        display: none;
        position: absolute;
    }
    .show {display: block;}
    .canvas {
        position: absolute;
        pointer-events: none;
    }
</style>