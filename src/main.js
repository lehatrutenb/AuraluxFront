import Vue from 'vue'
import App from './App.vue'

import Vuesax from 'vuesax'
import 'vuesax/dist/vuesax.css'

import 'boxicons'
import 'boxicons/css/boxicons.min.css'

import axios from 'axios'
import VueAxios from 'vue-axios'

import Router from 'vue-router'
import Login from '@/components/Login'
import BattleView from '@/components/BattleView'
import BattleInfo from '@/components/BattleInfo'
import Battles from '@/components/Battles'
import Maps from '@/components/Maps'
import Strategies from '@/components/Strategies'

Vue.use(Router)
Vue.use(VueAxios, axios)
Vue.use(Vuesax)
Vue.config.productionTip = false

const router = new Router({
  routes: [
      { path: '/', component: Login },
      { path: '/battle/:battle_id/:run_id', component: BattleView },
      { path: '/battle/:battle_id/', component: BattleInfo },
      { path: '/battles', component: Battles },
      { path: '/maps', component: Maps },
      { path: '/strategies', component: Strategies }
  ]
})

new Vue({
    router,
    render: h => h(App),
    components: { App },
}).$mount('#app')
