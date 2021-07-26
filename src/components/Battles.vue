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
        <div style="padding:80px 30px 30px 50px" v-if="page_now == 'battles'">
            <vs-button style="display: inline-block" size="xl" gradient v-model="map_creating" @click="map_creating=!map_creating">
                Create battle
            </vs-button>
            <vs-dialog v-if="map_creating" overflow-hidden blur auto-width v-model="map_creating"> <!--auto-width-->
                <template #header>
                <h3>
                    Battle creating
                </h3>
                </template>
                <div style="padding: 15px 30px 30px 30px">
                    <vs-input style="display: inline-block" label="Strategy id" v-model="strategy_id" placeholder="Strategy id" @keyup="ChangeStrategyInput">
                        <template #message-danger>
                            {{ StrategiesInputMessage }}
                        </template>
                    </vs-input>
                    <vs-button style="display: inline-block; left: 20px; bottom: 15px" gradient @click="CheckStrategyAdding(strategy_id)">
                        Add
                    </vs-button>
                    <br/>
                    <div style="padding: 5px 0px 0px 0px; max-width: 250px; white-space: pre-wrap"><p v-for="(stategy, i) in creating_strategies_text" :key="i" style="margin-top: 5px; margin-left: 5px">{{ stategy }}</p></div>
                    <vs-button style="top: 15px" gradient @click="SubmitBattle(); map_creating=!map_creating">
                        Create
                    </vs-button>
                </div>
            </vs-dialog>
            <div style="padding:40px 30px 30px 0px" v-if="page_now == 'battles'">
                <div>
                    <vs-table striped v-model="selected">
                        <template #thead>
                            <vs-tr>
                                <vs-th>
                                    Participants
                                </vs-th>
                                <vs-th style="width: 100px">
                                    Battle status
                                </vs-th>
                            </vs-tr>
                        </template>
                        <template #tbody>
                            <vs-tr
                                :key="i"
                                v-for="(tr, i) in battles"
                                :data="tr"
                                :is-selected="selected == tr">
                                <vs-td @click="selected = tr">
                                    <div style="display: flex; justify-content: space-around">
                                      <p style="font-size: 20px" v-for="(part, j) in tr.Participants" :key="j">{{part}}</p>
                                    </div>
                                </vs-td>

                                <vs-td @click="selected = tr" style="width: 100px">
                                    <div style="padding: 5px; background-color: #ff9d5c; width: 100px; text-align: center; border-radius: 5px" v-if="!tr.isStarted">Start game</div>
                                    <div style="padding: 5px; background-color: seagreen; color: white; width: 100px; text-align: center; border-radius: 5px" v-if="tr.isStarted">Started</div>
                                </vs-td>
                            </vs-tr>
                        </template>
                    </vs-table>
                    <pre>
                        <div v-if="selected != null">
                            {{ this.$router.push(`/battle/${selected.id}`) }}
                            {{ selected = null }}
                        </div>
                    </pre>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data:() => ({
            page_now: 'battles',
            battles: [],
            map_creating: false,
            strategy_id: "",
            creating_strategies: [],
            creating_strategies_text: [],
            StrategiesInputMessage: "",
            selected: null
        }),
        created() {
            document.title = "Auralux";
            this.GetBattles();
        },
        methods: {
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
                if (this.page_now != RedirectTo) {
                    this.page_now = RedirectTo;
                    this.$router.push(RedirectTo);
                }
            },
            async GetBattles() {
                await this.axios.get("http://127.0.0.1:8080/battle/all",
                {
                    headers: {
                        Authorization: `Bearer ${ this.$cookies.get("SessionToken") }`
                    },
                }).then(response => {
                    var battles_data = response["data"];
                    for (var i = 0; i < battles_data.length; i++) {
                        var not_here = true;
                        for (var j = 0; j < this.battles.length; j++) {
                            if (this.battles[j]["id"] == battles_data[i]["id"]) {
                                not_here = false;
                                var participants = [];
                                for (var k = 0; k < battles_data[i]["participants"].length; k++) {
                                    var name = "";
                                    if (battles_data[i]["participants"][k]["username"].length <= 3) {
                                        name = battles_data[i]["participants"][k]["username"];
                                    } else {
                                        name = battles_data[i]["participants"][k]["username"].substring(0, 3);
                                    }
                                    participants.push(`${name}[${battles_data[i]["participants"][k]["submissionID"]}]:${battles_data[i]["scores"][k]}`);
                                }
                                this.battles[j] = {"Participants": participants, "isStarted": battles_data[i]["isStarted"], "id": battles_data[i]["id"]};
                                break;
                            }
                        }
                        if (not_here) {
                            participants = [];
                            for (k = 0; k < battles_data[i]["participants"].length; k++) {
                                name = "";
                                if (battles_data[i]["participants"][k]["username"].length <= 3) {
                                    name = battles_data[i]["participants"][k]["username"];
                                } else {
                                    name = battles_data[i]["participants"][k]["username"].substring(0, 3);
                                }
                                var id = battles_data[i]["participants"][k]["submissionID"];
                                participants.push(`${name}[${id.substring(0, 3) + '-' + id.substring(3, 6) }]:${battles_data[i]["scores"][k]}`);
                            }
                            this.battles.push({"Participants": participants, "isStarted": battles_data[i]["isStarted"], "id": battles_data[i]["id"]});
                        }
                    }
                    this.battles.reverse();
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
            async CheckStrategyAdding() {
                if (this.strategy_id.length != 7) {
                    this.StrategiesInputMessage = "Strategy id look like: 123-456"
                } else {
                    await this.axios.get(`http://127.0.0.1:8080/submission/author?id=${this.strategy_id.substring(0, 3) + this.strategy_id.substring(4, 7)}`, // надо чекнуть реально ли стратегия есть и взять автора
                    {
                        headers: {
                            Authorization: `Bearer ${ this.$cookies.get("SessionToken") }`
                        },
                    }).then(response => {
                        this.creating_strategies.push(this.strategy_id.substring(0, 3) + this.strategy_id.substring(4, 7));
                        this.creating_strategies_text.push(`${response["data"]}[${this.strategy_id}]`);
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

                    this.strategy_id = '';
                    this.StrategiesInputMessage = '';
                }
            },
            ChangeStrategyInput(event) {
                if (event["key"] != "Backspace") {
                    if (this.strategy_id != '' && this.strategy_id.length != 4) {
                        if (this.strategy_id[this.strategy_id.length - 1] < '0' || this.strategy_id[this.strategy_id.length - 1] > '9') {
                            this.strategy_id = this.strategy_id.slice(0, -1);
                        }
                    }
                    if (this.strategy_id.length == 3) {
                        this.strategy_id += '-';
                    }
                }
            },
            async SubmitBattle() {
                this.strategy_id = "";
                await this.axios.post("http://127.0.0.1:8080/battle/create",
                { "submissionIDs": this.creating_strategies },
                {
                    headers: {
                        Authorization: `Bearer ${ this.$cookies.get("SessionToken") }`
                    },
                }).then(response => {
                    var respone_data = response["data"]
                    this.creating_strategies = [];
                    var participants = [];
                    for (var k = 0; k < respone_data["participants"].length; k++) {
                        var name = "";
                        if (respone_data["participants"][k]["username"].length <= 3) {
                            name = respone_data["participants"][k]["username"];
                        } else {
                            name = respone_data["participants"][k]["username"].substring(0, 3);
                        }
                        var id = respone_data["participants"][k]["submissionID"];
                        participants.push(`${name}[${id.substring(0, 3) + '-' + id.substring(3, 6) }]`);
                    }
                    this.battles.unshift({"Participants": participants, "isStarted": false, "id": respone_data["id"]});
                }).catch(error => {
                    if (error.response["data"]["reason"] == "Unauthorized") {
                        this.$router.push('/');
                        this.openNotification('top-left', 'danger', 'You need to login');
                    } else {
                        this.openNotification('top-left', 'danger', 'Check if your internet is fast enough and try again');
                    }
                });
            },
            Selected() {
                this.Pass(1);
            }
        }
    }
</script>