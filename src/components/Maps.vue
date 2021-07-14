<template>
    <div>
        <vs-navbar text-white :color="'rgb(250,128,114)'" v-model="page_now">
            <template #left>
                <i class='bx bxs-planet bx-md'></i>
                <h4 class="not-margin">
                    <b>Auralux</b>
                </h4>
            </template>
            <template #right>
                <vs-navbar-item :page_now="page_now == 'battles'" @click="CheckRedirecting('battles')" id="battles">
                    Battles
                </vs-navbar-item>

                <vs-navbar-item :page_now="page_now == 'maps'" @click="CheckRedirecting('maps')" id="maps">
                    Maps
                </vs-navbar-item>

                <vs-navbar-item :page_now="page_now == 'strategies'" @click="CheckRedirecting('strategies')" id="strategies">
                    Strategies
                </vs-navbar-item>

                <vs-navbar-item :page_now="page_now == 'tournaments'" @click="CheckRedirecting('tournaments')" id="tournaments">
                    Tournaments
                </vs-navbar-item>
            </template>
        </vs-navbar>

        <div v-if="page_now == 'maps'" style="padding: 70px 30px 30px 20px">
            <div style="padding: 10px 30px 30px 50px">
                <vs-button size="xl" v-if="active == 0 && !map_creating" gradient @click="active = 0; map_creating = true; Clear(true); SetFirtDraw();">
                    Add map
                </vs-button>
            </div>

            <div style="padding: 10px 30px 30px 50px">
                <vs-button size="xl" style="display:inline-block" gradient v-if="active == 0 && !map_creating" @click="active = 0; map_creating = true; Clear(true); CopyMap(); SetFirtDraw()">
                    Copy map
                </vs-button>
                <vs-input v-if="active == 0 && !map_creating" style="position:relative; left: 20px; display:inline-block" v-model="CopyMapId" placeholder="MapId" />
            </div>

            <vs-dialog blur v-model="map_creating">
                <vs-checkbox style="padding: 15px 0px 0px 40%;" @click="Draw(1)" v-model="grid">
                    Enable grid
                    <template #icon>
                        <i class='bx bxs-grid' ></i>
                    </template>
                </vs-checkbox>

                <canvas style="padding: 25px" id="MapCreating" class="canvas" v-on:click="Clicked" width="1" height="1"/>
                <vs-input style="left: 32%" v-model="MapName" placeholder="MapName" />
                <vs-button style="left: 43%; top: 10px" size="l" gradient @click="SubmitMap()">
                    Submit
                </vs-button>
            </vs-dialog>

            <div style="padding: 20px 0px 0px 0px" class="center grid">
                <span v-for="i in (Math.ceil(this.maps.length / 4))" :key="i">
                    <vs-row>
                        <vs-col :key="index" v-for="col,index in 4" vs-justify="center" vs-align="center" w="3">
                            <canvas v-bind:id="'MapCanvas'+ (index + (i - 1) * 4)" class="canvas" width="310" height="310"/>

                            <vs-td style="padding: 0px 0px 15px 120px" v-if="index + (i - 1) * 4 < maps.length">
                                Name: {{ maps[index + (i - 1) * 4]["name"] }}
                                <br/>
                                Id: {{ maps[index + (i - 1) * 4]["id"] }}
                            </vs-td>
                        </vs-col>
                    </vs-row>
                </span>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                page_now: 'maps',
                active: 0,
                map_creating: false,
                grid: true,
                map: [],
                width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
                height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
                DrawInterwal: null,
                MapName: '',
                CopyMapId: '',
                maps: [],
                MapsFirstDrawTimer: null,
            }
        },
        mounted() {
            this.GetMaps();
        },
        methods: {
            CheckRedirecting(RedirectTo) {
                if (this.page_now != RedirectTo) {
                    this.page_now = RedirectTo;
                    this.$router.push(RedirectTo);
                }
            },
            openNotification(position = null, color, text) {
                this.$vs.notification({
                    sticky: true,
                    color,
                    position,
                    title: 'Something went wrong',
                    text: text
                })
            },
            Pass(Param) {
                return Param;
            },
            SetFirtDraw() {
                if (this.DrawInterwal == null) {
                    this.DrawInterwal = setInterval(this.SetFirtDraw, 50);
                }
                if (document.getElementById("MapCreating") != null) {
                    clearInterval(this.DrawInterwal);
                    this.Draw(0);
                }
            },
            MapsFirstDrawFunc() {
                clearInterval(this.MapsFirstDrawTimer);
                try {
                    var MapKoef = 3, X_OFFSET = 5, Y_OFFSET = 5;
                    for (var i = 0; i < this.maps.length; i++) {
                        var canvas = document.getElementById("MapCanvas" + i.toString());
                        var ctx = canvas.getContext("2d");
                        ctx.moveTo(X_OFFSET, Y_OFFSET);
                        ctx.lineTo(X_OFFSET, Y_OFFSET + 100 * MapKoef);
                        ctx.moveTo(X_OFFSET, Y_OFFSET + 100 * MapKoef);
                        ctx.lineTo(X_OFFSET + 100 * MapKoef, Y_OFFSET + 100 * MapKoef);
                        ctx.moveTo(X_OFFSET + 100 * MapKoef, Y_OFFSET + 100 * MapKoef);
                        ctx.lineTo(X_OFFSET + 100 * MapKoef, Y_OFFSET);
                        ctx.moveTo(X_OFFSET + 100 * MapKoef, Y_OFFSET);
                        ctx.lineTo(X_OFFSET, Y_OFFSET);
                        ctx.stroke();
                        for (var j = 0; j < this.maps[i]["map"].length; j++) {
                            ctx.beginPath();
                            ctx.arc(this.maps[i]["map"][j][0] * MapKoef + X_OFFSET, this.maps[i]["map"][j][1] * MapKoef, 5, 0, 2 * Math.PI);
                            ctx.stroke();
                        }
                    }
                } finally {
                    this.Pass(null);
                }
            },
            async GetMaps() {
                await this.axios.get("http://127.0.0.1:8080/map/all", {
                    headers: {
                        Authorization: `Bearer ${ this.$cookies.get("SessionToken") }`
                    },
                }).then(response => {
                    var map_data = response["data"];
                    for (var i = 0; i < map_data.length; i++) {
                        var is_last = false;
                        if (i == map_data.length - 1) {
                            is_last = true;
                        }
                        var not_here = true;
                        for (var j = 0; j < this.maps.length; j++) {
                            if (this.maps[j]["id"] == map_data[i]['id']) {
                                not_here = false;
                                break;
                            }
                        }
                        if (not_here) {
                            this.AddMapById(map_data[i]['id'], map_data[i]['name'], is_last);
                        }
                    }
                }).catch(error => {
                    if (error.response["data"]["reason"] == "Unauthorized") {
                        this.$router.push('/');
                        this.openNotification('top-left', 'danger', 'You need to login');
                    } else {
                        this.openNotification('top-left', 'danger', 'Check if your internet is fast enough and try again');
                    }
                });
            },
            async AddMapById(MapId, MapName, is_last) {
                await this.axios.get("http://127.0.0.1:8080/map",
                {
                    params: { id: MapId },
                    headers: {
                        Authorization: `Bearer ${ this.$cookies.get("SessionToken") }`
                    }
                }).then(response => {
                    var map = [], splitted_data = response["data"].split("\n");
                    for (var i = 0; i < splitted_data.length - 1; i++) {
                        map.push([parseInt(splitted_data[i].split(' ')[0]), parseInt(splitted_data[i].split(' ')[1])]);
                    }
                    this.maps.push({"id": MapId, "name": MapName, "map": map});
                    if (is_last) {
                        this.MapsFirstDrawTimer = setInterval(this.MapsFirstDrawFunc, 100);
                    }
                }).catch(error => {
                    if (error.response["data"]["reason"] == "Unauthorized") {
                        this.$router.push('/');
                        this.openNotification('top-left', 'danger', 'You need to login');
                    } else {
                        this.openNotification('top-left', 'danger', 'Check if your internet is fast enough and try again');
                    }
                    if (is_last) {
                        this.MapsFirstDrawTimer = setInterval(this.MapsFirstDrawFunc, 100);
                    }
                });
            },
            CopyMap() {
                for (var i = 0; i < this.maps.length; i++) {
                    if (this.maps[i]['id'] == this.CopyMapId) {
                        this.map = this.maps[i]['map'];
                        break;
                    }
                }
            },
            Draw(type) {
                var Gridded = false;
                if (type == 1 & !this.grid) {
                    Gridded = true;
                } else if (type == 0 & this.grid) {
                    Gridded = true;
                }
                var MAP_KOEF = 5, X_OFFSET = 20, GRID_SIZE = 5 * MAP_KOEF;
                var canvas = document.getElementById("MapCreating");
                canvas.width = 100 * MAP_KOEF + X_OFFSET + 20;
                canvas.height = 100 * MAP_KOEF + 30;
                var ctx = canvas.getContext("2d");
                ctx.beginPath(); // may be useless
                ctx.clearRect(X_OFFSET, 0, 100 * MAP_KOEF, canvas.height);
                ctx.stroke();

                ctx.beginPath();
                ctx.rect(X_OFFSET, 0, 100 * MAP_KOEF, 100 * MAP_KOEF);
                ctx.stroke();
                for (var i = 0; i <= 100; i += 10) {
                    if (i == 0) {
                        ctx.strokeText(i, 8, i * MAP_KOEF + 10);
                        ctx.strokeText(i, i * MAP_KOEF + X_OFFSET - 3, 100 * MAP_KOEF + 10);
                    } else if (i != 100) {
                        ctx.strokeText(i, 5, i * MAP_KOEF);
                        ctx.strokeText(i, i * MAP_KOEF + X_OFFSET - 5, 100 * MAP_KOEF + 10);
                    } else {
                        ctx.strokeText(i, 2, i * MAP_KOEF);
                        ctx.strokeText(i, i * MAP_KOEF + X_OFFSET - 8, 100 * MAP_KOEF + 10);
                    }
                }
                if (Gridded) {
                    for (i = GRID_SIZE + X_OFFSET; i <= 100 * MAP_KOEF + X_OFFSET; i += GRID_SIZE) {
                        ctx.moveTo(i, 0);
                        ctx.lineTo(i, 100 * MAP_KOEF);
                        ctx.moveTo(X_OFFSET, i - X_OFFSET);
                        ctx.lineTo(100 * MAP_KOEF + X_OFFSET, i - X_OFFSET);
                    }
                    ctx.stroke();
                }
                for (i = 0; i < this.map.length; i++) {
                    ctx.beginPath();
                    ctx.arc(this.map[i][0] * MAP_KOEF + X_OFFSET, this.map[i][1] * MAP_KOEF, 15, 0, 2 * Math.PI);
                    ctx.stroke();
                }
            },
            Clicked(event) {
                if (this.map_creating) {
                    var MAP_KOEF = 5, X_OFFSET = 20;
                    var x = Math.round(Math.max(event["offsetX"] - X_OFFSET - 25, 0) / MAP_KOEF), y = Math.round(Math.max(event["offsetY"] - 25, 0) / MAP_KOEF);
                    var uniq = true;
                    for (var i = 0; i < this.map.length; i++) {
                        if (this.map[i][0] == x && this.map[i][1] == y) {
                            uniq = false;
                        }
                    }
                    if (uniq) {
                        this.map.push([x, y]);
                        this.Draw(0);
                    }
                }
            },
            Clear(map_creating) {
                this.active = 0;
                this.map_creating = map_creating;
                this.grid = true;
                this.map = [];
                this.DrawInterwal = null;
                this.MapName = '';
            },
            async SubmitMap() {
                var map_text = "";
                for (var i = 0; i < this.map.length; i++) {
                    map_text += this.map[i][0].toString() + ' ' + this.map[i][1].toString() + '\n';
                }
                var formData = new FormData();
                formData.append("map", new File([map_text], "map.txt"));
                formData.append("name", this.MapName);
                await this.axios.post("http://127.0.0.1:8080/map/create",
                formData, {
                headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${ this.$cookies.get("SessionToken") }`
                    }
                })
                .then(response => {
                    this.Pass(response);

                    this.Clear(false);
                    this.GetMaps();
                }).catch(error => {
                    this.Pass(error);
                    this.Clear(false);
                    this.openNotification('top-left', 'danger', 'Check if your map name is correct');
                });
            }
        }
    }
</script>