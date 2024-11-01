<template>
    <div class="at-sidbarwrapper at-userlist_tab at-contacts_list">
        <div class="at-chatfloatholder">
            <div class="at-floatchat at-signin">
                <div class="at-floatchat_content">
                    <div class="at-floatchat_title">
                        <h2>{{TRANS.signin_box_hdr_txt}}</h2>
                        <div class="at-floatchat_title-right">
                            <a href="javascript:void(0);" class="at-removechat" @click.prevent="$root.$emit('toggleSignInWindow',false)"><i class="guppy-x"></i></a>
                        </div>
                    </div>
                    <form class="at-themeform at-floatsignin">
                        <fieldset>
                            <template v-if="selectedTab == 'guest'">
                                <guest-user-login />
                            </template>
                            <template v-else-if="selectedTab == 'real'">
                                <real-user-login />
                            </template>
                        </fieldset>
                    </form>
                    <ul v-if="!userId" class="at-joinnow">
                        <li @click.prevent="selectedTab = 'guest'" v-if="selectedTab == 'real'"><span>{{TRANS.dont_have_account_txt}} <a href="javascript:void(0);">{{TRANS.guest_login_txt}}</a> </span></li>
                        <li @click.prevent="selectedTab = 'real'" v-if="selectedTab == 'guest'"><span>{{TRANS.have_account_txt}} <a href="javascript:void(0);">{{TRANS.login_txt}}</a> </span></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import GuestUserLogin from "./GuestUserLogin.vue";
import RealUserLogin from "./RealUserLogin.vue";
export default {
    name : 'SignInBox',
    components : {
        GuestUserLogin,
        RealUserLogin
    },
    data(){
        return {
            selectedTab : 'real'
        }
    },

}
</script>