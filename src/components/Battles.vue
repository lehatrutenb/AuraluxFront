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
                    <div style="padding: 20px 0px 0px 0px">
                        Your strategies:
                    </div>
                    <div style="padding: 10px 0px 0px 0px; text-align: center; max-width: 250px">
                        {{ creating_strategies.join(", ") }}
                    </div>
                    <vs-button style="top: 15px" gradient @click="RedirectWithParam()">
                        Create
                    </vs-button>
                </div>
            </vs-dialog>
            <!--<div style="padding:80px 30px 30px 50px" v-if="page_now == 'strategies'">
                <div style="padding:30px 0px 0px 0px">
                    <vs-table striped>
                        <template #thead>
                            <vs-tr>
                                <vs-th>
                                    Is main stategy
                                </vs-th>
                                <vs-th>
                                    Id
                                </vs-th>
                                <vs-th>
                                    Name
                                </vs-th>->
                                <vs-th>
                                    Status
                                </vs-th>
                                <vs-th>
                                    Source
                                </vs-th>
                                <vs-th>
                                    Compilation messages
                                </vs-th>
                            </vs-tr>
                        </template>
                        <template #tbody>
                            <vs-tr
                                :key="i"
                                v-for="(tr, i) in strategies">
                                <vs-td checkbox>
                                    <vs-checkbox @click="CheckMain(i)" v-model="tr.main_strategy" >
                                        <template #icon>
                                            <i class='bx bx-crown' ></i>
                                        </template>
                                    </vs-checkbox>
                                </vs-td>
                                <vs-td>
                                    {{ tr.id.substring(0, 3) + '-' + tr.id.substring(3, 6) }}
                                </vs-td>
                                <vs-td>
                                    {{ tr.name }}
                                </vs-td>->
                                <vs-td>
                                    {{ tr.status }}
                                </vs-td>
                                <vs-td>
                                    <vs-button style="display: inline-block; left: 3px" color="rgb(59,222,200)" gradient @click="GetSource(tr.id); ShowSource=!ShowSource">
                                        <i class='bx bx-code-alt'></i>
                                    </vs-button>
                                </vs-td>
                                <vs-td>
                                    <vs-button style="display: inline-block; left: 50px" warn gradient @click="GetComments(tr.id); ShowComments=!ShowComments">
                                        <i class='bx bx-comment-detail'></i>‌‌
                                    </vs-button>
                                </vs-td>
                            </vs-tr>
                        </template>
                    </vs-table>
                </div>
            </div> -->
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
            StrategiesInputMessage: ""
        }),
        mounted() {
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
                await this.axios.get("http://127.0.0.1:8080//battle/all",
                {
                    headers: {
                        Authorization: `Bearer ${ this.$cookies.get("SessionToken") }`
                    },
                }).then(response => {
                    console.log(response);
                    /*var battles_data = response["data"];
                    for (var i = 0; i < battles_data.length; i++) {
                        var not_here = true;
                        for (var j = 0; j < this.battles.length; j++) {
                            if (this.battles[j]["id"] == battles_data[i]['id']) {
                                not_here = false;
                                this.battles[j] = {"id": battles_data[i]['id'], "main_strategy": false, "name": "SomeName", "status": "SomeStatus"};
                                break;
                            }
                        }
                        if (not_here) {
                            this.battles.push({"id": battles_data[i]['id'], "main_strategy": false, "name": "SomeName", "status": "SomeStatus"});
                        }
                    }*/
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
            CheckStrategyAdding() {
                if (this.strategy_id.length != 7) {
                    this.StrategiesInputMessage = "Strategy id look like: 123-456"
                } else {
                    this.creating_strategies.push(this.strategy_id);
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
            RedirectWithParam() {
                this.strategy_id = "";
                var strategies = this.creating_strategies;
                this.creating_strategies = [];
                //this.$router. got to battle info
            }
        }
    }
</script>