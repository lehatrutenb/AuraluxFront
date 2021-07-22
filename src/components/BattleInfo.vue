<style scoped>
    select {
        outline: none;
        padding: 13px;
        font-family: 'Poppins', sans-serif;
        font-weight: normal;
        font-size: 22px;
        border: none;
        background: #FFFFFF;
        border: 1px solid #ECEAF3;
        border-radius: 18px;
        min-width: 150px;
        -webkit-appearance: none;
        -moz-appearance: none;
        text-indent: 1px;
        text-overflow: '';
        }
</style>

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
      <div style="padding:80px 30px 30px 50px">
        <div style="display: flex; justify-content: space-between; align-items: center">
          <div style="display: flex; ">
            <h1 style="margin-right: 15px">Battle with submissions: </h1>
            <h1>{{ strategies.map ( (element) => element["submissionID"] ).join(", ") }}</h1>
          </div>
          <div v-if="battle_started" style="padding: 20px; background-color: forestgreen; border-radius: 10px; vertical-align: center"><h3 style="margin: 0; color: white">
            Started</h3></div>
          <div v-if="battle_started === false" style="padding: 20px; background-color: #ff9d5c; border-radius: 10px; vertical-align: center"><h3 style="margin: 0; color: white">
            Not started</h3></div>
        </div>
        <vs-button style="margin-bottom: 20px" size="xl" gradient v-model="run_creating" @click="run_creating=!run_creating">
          Add run
        </vs-button>
        <vs-dialog v-if="run_creating" width="1000px" overflow-hidden blur v-model="run_creating">
          <template #header>
            <h3>
              Run creating
            </h3>
          </template>
          <div>
            <vs-row>
              <vs-col :key="index" v-for="col,index in 2" vs-type="flex" vs-justify="center" vs-align="center" w="6">
                <div style="padding: 20px 0px 0px 50px" v-if="index == 0">
                  <select required v-model="map_id" @change="AddMapById()">
                    <optgroup label="Choose map">
                      <option value="" disabled selected></option>
                      <option v-for="tr in map_ids" :ket="tr.id" v-bind:value="tr.id" v-bind:key="tr.id">{{ `${tr.name}[${tr.id}]` }}</option>
                    </optgroup>
                  </select>
                  <div style="padding: 20px 0px 0px 0px">
                    <h4>
                      Start planets
                    </h4>
                    <div style="width:50px">
                      <vs-tr
                          :key="i"
                          v-for="(tr, i) in strategies">
                        {{ `${tr.username}[${tr.submissionID}] - ${startPositions[i]}` }}
                        <vs-input v-model="startPositions[i]" v-bind:id="'StartPointInput' + i" placeholder="Planet id" />
                      </vs-tr>
                    </div>
                    <vs-button style="top:20px" size="xl" gradient @click="SumbitRun()">
                      Submit
                    </vs-button>
                  </div>
                </div>
                <div v-if="index == 1">
                  <canvas id="MapCanvas" class="canvas" width="310" height="310"/>
                </div>
              </vs-col>
            </vs-row>
          </div>
        </vs-dialog>
        <vs-table striped>
          <template #thead>
            <vs-tr>
              <vs-th style="width: 10px">
                id
              </vs-th>
              <vs-th v-for="(strategy, i) in strategies" :key="i">
                {{strategy["submissionID"]}}
              </vs-th>
              <vs-th>
                map
              </vs-th>
              <vs-th>
                status
              </vs-th>
              <vs-th>
                view
              </vs-th>
            </vs-tr>
          </template>
          <template #tbody>
            <vs-tr
                :key="i"
                v-for="(tr, i) in runs">
              <vs-td>
                {{ tr.id }}
              </vs-td>
              <vs-td v-for="(score, j) in tr.scores" :key="j">
                {{score}}
              </vs-td>
              <vs-td>
                {{ tr.map }}
              </vs-td>
              <vs-td>
                {{ tr.status }}
              </vs-td>
              <vs-td>
                  <vs-button style="display: inline-block; left: 3px" color="rgb(222,59,94)" gradient @click="CheckRedirecting(`battle/${battle_id}/${tr.id}`)">
                      <i class='bx bx-movie'></i>
                  </vs-button>
              </vs-td>
            </vs-tr>
          </template>
        </vs-table>
        <vs-button  v-if="battle_started === false" style="margin-bottom: 20px; margin-top: 40px" size="xl" gradient @click="StartBattle">
          Start battle
        </vs-button>
      </div>
    </div>
</template>

<script>
    export default {
        data:() => ({
            runs: [],
            battle_id: null,
            run_creating: false,
            map_id: '',
            map_ids: [],
            creating_map: [],
            strategies: [],
            startPositions: [],
            value: '',
            battle_started: null
        }),
        created() {
            document.title = "Auralux";
            this.battle_id = this.$route.params.battle_id;
            this.GetBattleInfo();
            this.GetMaps();
        },
        methods : {
            openNotification(position = null, color, text) {
                this.$vs.notification({
                    sticky: true,
                    color,
                    position,
                    title: 'Something went wrong',
                    text: text
                })
            },
            CheckRedirecting(RedirectTo) {
                this.$router.push('/' + RedirectTo);
            },
            async StartBattle() {
              await this.axios.post("http://127.0.0.1:8080/battle/start",
                    {
                      "battleID": this.battle_id
                    },
                    {
                    headers: {
                      Authorization: `Bearer ${ this.$cookies.get("SessionToken") }`
                    }}).then(response => {
                console.log(response);
                this.GetBattleInfo()

              }).catch(error => {
                console.log(error);
                if (error.response["data"]["reason"] == "Unauthorized") {
                  this.$router.push('/');
                  this.openNotification('top-left', 'danger', 'You need to login');
                } else {
                  this.openNotification('top-left', 'danger', 'Check if your internet is fast enough and try again');
                }
              });
            },
            async GetBattleInfo() {
                console.log(this.battle_id);
                await this.axios.get("http://127.0.0.1:8080/battle",
                {
                    params: {
                        "id": this.battle_id
                    },
                    headers: {
                        Authorization: `Bearer ${ this.$cookies.get("SessionToken") }`
                    },
                }).then(response => {
                    console.log(response);
                    this.battle_started = response["data"]["isStarted"]
                    this.strategies = response["data"]["participants"];
                    console.log(response["data"]["participants"])
                    this.runs = response["data"]["runs"];
                    for (var i = 0; i < this.strategies.length; i++) {
                        this.startPositions.push(null);
                    }
                }).catch(error => {
                    console.log(error);
                    if (error.response["data"]["reason"] == "Unauthorized") {
                        this.$router.push('/');
                        this.openNotification('top-left', 'danger', 'You need to login');
                    } else {
                        this.openNotification('top-left', 'danger', 'Check if your internet is fast enough and try again');
                    }
                });
            },
            async SumbitRun()  {

                await this.axios.post("http://127.0.0.1:8080/battle/add_run",
                    {battleID :  this.battle_id,
                          gameRunSettings: {mapID: this.map_id, startPositions: this.startPositions.map((position) => parseInt(position))},
                          },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${ this.$cookies.get("SessionToken") }`
                        },
                    }
                ).then(response => {
                  for (var i = 0; i < this.strategies.length; i++) {
                    this.startPositions[i] = null;
                  }
                  this.map_id = '';
                  this.run_creating = false;
                  this.creating_map = [];
                  console.log(response);
                  this.GetBattleInfo();
                }).catch(error => {
                  this.map_id = '';
                  this.run_creating = false;
                  this.creating_map = [];
                  for (var i = 0; i < this.strategies.length; i++) {
                    this.startPositions[i] = null;
                  }
                    console.log(error);
                    if (error.response["data"]["reason"] == "Unauthorized") {
                        this.$router.push('/');
                        this.openNotification('top-left', 'danger', 'You need to login');
                    } else {
                        this.openNotification('top-left', 'danger', 'Battle has been already started');
                    }
                });
            },
            async GetMaps() {
                await this.axios.get("http://127.0.0.1:8080/map/all", {
                    headers: {
                        Authorization: `Bearer ${ this.$cookies.get("SessionToken") }`
                    },
                }).then(response => {
                    var map_data = response["data"];
                    for (var i = 0; i < map_data.length; i++) {
                        var not_here = true;
                        for (var j = 0; j < this.map_ids.length; j++) {
                            if (this.map_ids[j]["id"] == map_data[i]["id"]) {
                                not_here = false;
                                break;
                            }
                        }
                        if (not_here) {
                            console.log(map_data[i]);
                            this.map_ids.push({"id": map_data[i]["id"], "name": map_data[i]["name"]});
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
            Pass(Param) {
                return Param;
            },
            DrawMap() {
                var MapKoef = 3, X_OFFSET = 5;
                var canvas = document.getElementById("MapCanvas");
                var ctx = canvas.getContext("2d");
                ctx.beginPath();
                ctx.clearRect(X_OFFSET, 0, canvas.width, canvas.height);
                ctx.stroke();
                for (var i = 0; i < this.creating_map.length; i++) {
                    ctx.beginPath();
                    var x = this.creating_map[i][0] * MapKoef + X_OFFSET, y = this.creating_map[i][1] * MapKoef;
                    ctx.arc(x, y, 10, 0, 2 * Math.PI);
                    ctx.stroke();
                    ctx.font = "2px";
                    if (i < 10) {
                        ctx.strokeText(i, x - 3, y + 3);
                    } else if (i < 100) {
                        ctx.strokeText(i, x - 5, y + 3);
                    } else {
                        ctx.strokeText(100, x - 8, y + 3);
                    }
                }
            },
            async AddMapById() {
                await this.axios.get("http://127.0.0.1:8080/map",
                {
                    params: { id: this.map_id },
                    headers: {
                        Authorization: `Bearer ${ this.$cookies.get("SessionToken") }`
                    }
                }).then(response => {
                    var map = [], splitted_data = response["data"].split("\n");
                    for (var i = 0; i < splitted_data.length - 1; i++) {
                        map.push([parseInt(splitted_data[i].split(' ')[0]), parseInt(splitted_data[i].split(' ')[1])]);
                    }
                    this.creating_map = map;
                    this.DrawMap();
                }).catch(error => {
                    if (error.response["data"]["reason"] == "Unauthorized") {
                        this.$router.push('/');
                        this.openNotification('top-left', 'danger', 'You need to login');
                    } else {
                        this.openNotification('top-left', 'danger', 'Check if your internet is fast enough and try again');
                    }
                });
            },
        }
    }
</script>