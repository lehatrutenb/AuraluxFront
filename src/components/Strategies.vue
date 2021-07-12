<style lang="stylus">
    .con-content
        p
            margin 20px 0px
            position relative
            display block
            font-size .9rem
</style>

<template>
    <div>
        <vs-dialog v-if="ShowComments" overflow-hidden blur scroll auto-width v-model="ShowComments">
            <template #header>
            <h3>
                Compiller comments
            </h3>
            </template>
            <div class="con-content">
                {{ this.CommentsText }}
            </div>
        </vs-dialog>

        <vs-dialog v-if="ShowSource" overflow-hidden blur auto-width v-model="ShowSource">
            <template #header>
            <h3>
                Source
            </h3>
            </template>
            <code style="white-space: pre-wrap;" class="con-content">
                {{ this.SourceText }}
            </code>
        </vs-dialog>

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
        <div style="padding:80px 30px 30px 50px" v-if="page_now == 'strategies'">
            <vs-button style="display: inline-block" size="xl" gradient @click="SubmitStrategy()">
                Load strategy
            </vs-button>
            <!-- <vs-input id="UploadStrategy" style="display: inline-block" type="file" v-model="new_strategy"/> -->
            <input style="display: inline-block; padding:0px 0px 0px 20px" id="UploadStrategy" type="file">
            <div style="padding:30px 0px 0px 0px">
                <vs-table striped>
                    <template #thead>
                        <vs-tr>
                            <vs-th>
                                Is main stategy
                            </vs-th>
                            <vs-th>
                                Status
                            </vs-th>
                            <vs-th>
                                Name
                            </vs-th>
                            <vs-th>
                                Id
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
                                Some status
                            </vs-td>
                            <vs-td>
                                {{ tr.name }}
                            </vs-td>
                            <vs-td>
                                {{ tr.id.substring(0, 3) + '-' + tr.id.substring(3, 6) }}
                            </vs-td>

                            <template #expand>
                                <div class="con-content">
                                    <div style="padding:10px 0px 0px 3%">
                                        <vs-button style="display: inline-block" warn gradient @click="GetComments(tr.id); ShowComments=!ShowComments">
                                            <i class='bx bx-comment-detail'></i>‌‌ ‌‌ ‌‌Сompiler comments
                                        </vs-button>
                                        <vs-button style="display: inline-block; left: 5%" color="rgb(59,222,200)" gradient @click="GetSource(tr.id); ShowSource=!ShowSource">
                                            <i class='bx bx-code-alt'></i>‌‌ ‌‌ Source
                                        </vs-button>
                                    </div>
                                </div>
                            </template>
                        </vs-tr>
                    </template>
                </vs-table>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data:() => ({
            page_now: 'strategies',
            new_strategy: null,
            selected: [],
            strategies: [],
            ShowSource: false,
            ShowComments: false,
            CommentsText: "",
            SourceText: ""
        }),
        mounted() {
            this.GetStrategies();
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
            async GetStrategies() {
                await this.axios.get("http://127.0.0.1:8080/submission", {
                    headers: {
                        Authorization: `Bearer ${ this.$cookies.get("SessionToken") }`
                    },
                }).then(response => {
                    var strategies_data = response["data"];
                    for (var i = 0; i < strategies_data.length; i++) {
                        var not_here = true;
                        for (var j = 0; j < this.strategies.length; j++) {
                            if (this.strategies[j]["id"] == strategies_data[i]['id']) {
                                not_here = false;
                                break;
                            }
                        }
                        if (not_here) {
                            this.strategies.push({"id": strategies_data[i]['id'], "main_strategy": false, "name": "SomeName", "email": "some_email"})
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
            CheckMain(StrategyInd) {
                if (!this.strategies[StrategyInd].main_strategy) {
                    var StrategyId = null;
                    for (var i = 0; i < this.strategies.length; i++) {
                        if (i != StrategyInd) {
                            this.strategies[i].main_strategy = false;
                        } else {
                            StrategyId = this.strategies[i].id;
                        }
                    }
                    this.SetBestStrategy(StrategyId);
                } else {
                    this.strategies[StrategyInd].main_strategy = false;
                }
            },
            async SubmitStrategy() {
                try {
                    var formData = new FormData();
                    var strategy = document.getElementById("UploadStrategy").files[0];
                    formData.append("source", strategy);
                    formData.append("lang", strategy.name.split('.')[1]);
                } catch (error) {
                    const pass = (error) => {return error};
                    pass(error);
                    this.openNotification('top-left', 'danger', 'Check if your file is correct');
                }
                await this.axios.post("http://127.0.0.1:8080/submission/submit", 
                formData, {
                headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${ this.$cookies.get("SessionToken") }`
                    }
                })
                .then(response => {
                    this.Pass(response);
                    this.GetStrategies();
                }).catch(error => {
                    this.Pass(error);
                    this.openNotification('top-left', 'danger', 'Check if your file is correct');
                });
            },
            async SetBestStrategy(StrategyId) {
                await this.axios.post("http://127.0.0.1:8080/submission/best", { "id": StrategyId },
                {
                    headers: {
                        Authorization: `Bearer ${ this.$cookies.get("SessionToken") }`
                    }
                })
                .then(response => {
                    this.Pass(response);
                }).catch(error => {
                    this.Pass(error);
                    this.openNotification('top-left', 'danger', 'Check if your file is correct');
                });
            },
            async GetComments(StrategyId) {
                await this.axios.get("http://127.0.0.1:8080/submission/comments", {
                    params: {
                        "id": StrategyId
                    },
                    headers: {
                        Authorization: `Bearer ${ this.$cookies.get("SessionToken") }`
                    },
                }).then(response => {
                    this.Pass(response);
                    this.CommentsText = response["data"];
                })
            },
            async GetSource(StrategyId) {
                await this.axios.get("http://127.0.0.1:8080/submission/source", {
                    params: {
                        "id": StrategyId
                    },
                    headers: {
                        Authorization: `Bearer ${ this.$cookies.get("SessionToken") }`
                    },
                }).then(response => {
                    this.Pass(response);
                    this.SourceText = response["data"];
                })
            }
        }
    }
</script>