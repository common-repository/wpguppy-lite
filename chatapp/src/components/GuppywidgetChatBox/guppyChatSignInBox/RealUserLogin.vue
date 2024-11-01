<template>
    <div class="at-form-group-wrap">
        <div class="at-form-group">
            <label class="at-formtitle at-important">{{TRANS.email}}</label>
            <input type="text" required @keyup.enter="signIn()" v-model="data.username" class="at-form-control" :placeholder="TRANS.email">
        </div>
        <div class="at-form-group">
            <label class="at-formtitle at-important">{{TRANS.password}}</label>
            <input type="password" @keyup.enter="signIn()" v-model="data.userpassword" required class="at-form-control" :placeholder="TRANS.password">
        </div>
        <div class="at-form-group">
            <a href="javascript:void(0);" :class="{'at-disable-btn' : isloading }" @click.prevent="signIn()" class="at-btn">{{TRANS.start_chat_text}}</a>
        </div>
    </div>
</template>

<script>
import RestApiManager from "../../../resources/RestApiController";
export default {
    name : 'RealUserLogin',
    data(){
        return {
            data : { 
                userpassword : '',
                username : ''
            },
            isloading : false
        }
    },
    methods:{
        signIn(){
            if(!this.isloading){
                this.isloading = true;
                if(this.data.username && this.data.userpassword ){
                    this.axios.post('user-login', this.data).then( response =>{
                        this.isloading = false;
                        if(response.data.type == 'success' ){
                            let data = response.data;
                            this.axios.defaults.headers.common['Authorization'] = `Bearer ` + data.authToken;
                            this.$store.commit('refreshSupportChats');
                            let openFloatingList = true;
                            RestApiManager.getProfileInfo();
                            if(this.userType == '0' && this.$store.state.windowWidth > 768){
                                openFloatingList = false;
                            }
                            this.$store.commit('updateUserInfo', { userId : data.userInfo.userId, userType : 1, isSupportMember : data.isSupportMember });
                            this.$root.$emit('toggleSignInWindow', false);
                            if(openFloatingList)this.$root.$emit('openFloatingTab');
                            this.$store.dispatch('initRealTimeChatSetting',{ authToken : data.authToken });
                        } else {
                            this.alertBox('error', this.TRANS.error_title, response.data.message );
                        }
                    }).catch( errors => {
                        this.isloading = false;
                        this.errors = errors;
                        this.alertBox('error', this.TRANS.error_title, this.TRANS.input_params_err );
                    })
                } else {
                    this.isloading = false;
                    this.alertBox('error', this.TRANS.error_title, this.TRANS.empty_input_err_txt );
                }
            }
        }
    },

}
</script>