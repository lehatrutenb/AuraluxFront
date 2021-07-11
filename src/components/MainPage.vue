<template>
    <div class="center examplex">
        <!--<vs-navbar text-white :color="'rgb(240,128,128)'" center-collapsed v-model="page_now">-->
        <vs-navbar text-white :color="'rgb(250,128,114)'" v-model="page_now"> <!-- Meny -->
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
    </div>
</template>


<script>
    export default {
        data:() => ({
            page_now: 'null',
        }),
        methods: {
            CheckRedirecting(RedirectTo) {
                if (this.page_now != RedirectTo) {
                    this.page_now = RedirectTo;
                    this.$router.push(RedirectTo);
                }
            }
        }
    }
</script>