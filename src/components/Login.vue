<style lang="stylus">
    getColor(vsColor, alpha = 1)
        unquote("rgba(var(--vs-"+vsColor+"), "+alpha+")")
    getVar(var)
        unquote("var(--vs-"+var+")")
    .not-margin
        margin 0px
        font-weight normal
        padding 10px
    .con-form
        width 100%
        .flex
            display flex
            align-items center
            justify-content space-between
            a
                font-size .8rem
                opacity .7
                &:hover
                    opacity 1
        .vs-checkbox-label
            font-size .8rem
        .vs-input-content
            margin 10px 0px
            width calc(100%)
            .vs-input
                width 100%
    .footer-dialog
        display flex
        align-items center
        justify-content center
        flex-direction column
        width calc(100%)
        .new
            margin 0px
            margin-top 20px
            padding: 0px
            font-size .7rem
            a
                color getColor('primary') !important
                margin-left 6px
                &:hover
                    text-decoration underline
    .vs-button
        margin 0px
    .center
        position absolute
        z-index 0
        min-height 100vh
        min-width 100vw
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
</style>

<template>
    <div>
        <div class="center" :style="
        { backgroundImage: 'url(' + require('../assets/space.jpg') + ')'}">
            <vs-dialog v-model="active" not-close prevent-close blur>
                <template #header>
                    <h4 class="not-margin">
                        Welcome to <b>Auralux</b>
                    </h4>
                </template>

                <div class="con-form">
                    <vs-input type="text" v-model="login" placeholder="Login">
                        <template #icon>
                            <i class='bx bxs-user-account'></i>
                        </template>
                    </vs-input>
                    <vs-input type="password" v-model="password" placeholder="Password">
                        <template #icon>
                            <i class='bx bxs-lock'></i>
                        </template>
                    </vs-input>
                    <div class="flex">
                        <vs-checkbox v-model="remember">
                            Remember me
                            <template #icon>
                                <i class='bx bxs-planet' ></i>
                            </template>
                        </vs-checkbox>
                    </div>
                </div>

                <template #footer>
                    <div class="footer-dialog">
                        <vs-button v-on:click="post_req" block>
                            Sign In
                        </vs-button>

                        <div class="new">
                            New Here? <a href="#">@lehatrutenb</a>
                        </div>
                    </div>
                </template>
            </vs-dialog>
        </div>
    </div>
</template>

<script>
    export default {
        data:() => ({
            active: true,
            login: '',
            password: '',
            remember: false,
            textarea: '',
            ErrorMsg: false
        }),
        created() {
            document.title = "Auralux";
        },
        methods: {
            openNotification(position = null, color) {
                this.$vs.notification({
                    sticky: true,
                    color,
                    position,
                    title: 'Something went wrong',
                    text: 'Check corectness of your login and password'
                });
            },
            post_req: async function() {
                await this.axios.post("http://127.0.0.1:8080/users/login", {remember: this.remember}, {
                    auth: {
                        username: this.login,
                        password: this.password,
                    },
                }).then((response) => {
                    if (!this.remember) {
                        this.$cookies.set('SessionToken', response.data['token'], '1h');
                    } else {
                        this.$cookies.set('SessionToken', response.data['token'], '1m');
                    }
                    this.$router.push('main_page');
                }, (error) => {
                    console.log(error);
                    this.error = '';
                    this.password = '';
                    this.login = '';
                    this.ErrorMsg = true;
                    this.openNotification('top-left', 'danger');
                }); 
            }
        }
    }
</script>