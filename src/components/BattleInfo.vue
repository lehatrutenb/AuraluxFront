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
            <vs-button style="display: inline-block" size="xl" gradient v-model="run_creating" @click="run_creating=!run_creating">
                Create run
            </vs-button>
            <vs-dialog v-if="run_creating" overflow-hidden blur auto-width v-model="run_creating"> <!--auto-width-->
                <template #header>
                <h3>
                    Run creating
                </h3>
                </template>
                <div style="padding: 0px 30px 30px 30px">
                    <select required>
                        <optgroup label="Choose map">
                            <option value="" disabled selected></option>
                            <option v-for="tr in map_ids" :ket="tr.id" v-bind:key="tr.id">{{ `${tr.name}[${tr.id}]` }}</option>
                        </optgroup>
                    </select>
                    <vs-button style="top:20px" size="xl" gradient @click="SumbitRun()">
                        Submit
                    </vs-button>
                </div>
            </vs-dialog>
            <!--<vs-table striped v-model="selected">
                <template #thead>
                    <vs-tr>
                        <vs-th>
                            Participants
                        </vs-th>
                        <vs-th>
                            Battle status
                        </vs-th>
                    </vs-tr>
                </template>
                <template #tbody>
                    <vs-tr
                        :key="i"
                        v-for="(tr, i) in runs"
                        <vs-td>
                            {{ tr.Participants.join(", ") }}
                        </vs-td>
                        <vs-td>
                            {{ tr.isStarted }}
                        </vs-td>
                    </vs-tr>
                </template>
            </vs-table>-->
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
            creating_map: [] // need to show map during creating run
        }),
        mounted() {
            this.battle_id = this.$route.params.battle_id;
            this.GetRuns();
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
            async GetRuns() {
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
            async AddRun() {
                var formData = new FormData();
                //formData.append("map", new File([map_text], "map.txt"));
                formData.append("battleID", this.battle_id);
                formData.append("gameRunSettings", {"mapID": 5, "startPositions": [1, 2]});
                await this.axios.post("http://127.0.0.1:8080/battle/add_run",
                {
                    formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${ this.$cookies.get("SessionToken") }`
                    },
                }).then(response => {
                    console.log(response);
                }).catch(error => {
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
                        var is_last = false;
                        if (i == map_data.length - 1) {
                            is_last = true;
                        }
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
            SumbitRun() {

            }
        }
    }
</script>