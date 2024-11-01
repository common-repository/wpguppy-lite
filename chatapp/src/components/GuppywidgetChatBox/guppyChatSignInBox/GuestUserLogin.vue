<template>
    <div class="at-form-group-wrap">
            <div class="at-form-group">
            <label class="at-formtitle at-important">{{TRANS.name_txt}}</label>
            <input type="text" @keyup.enter="signIn()" v-model="data.guestName" required class="at-form-control" :placeholder="TRANS.name_txt">
        </div>
        <div class="at-form-group">
            <label class="at-formtitle at-important">{{TRANS.email}}</label>
            <input type="email" required @keyup.enter="signIn()" v-model="data.guestEmail" class="at-form-control" :placeholder="TRANS.email">
        </div>
        <div class="at-form-group">
            <a href="javascript:void(0);" :class="{'at-disable-btn' : isloading }" @click.prevent="signIn()" class="at-btn">{{TRANS.start_chat_text}}</a>
        </div>
    </div>             
</template>

<script>
import GuppyChatManager from "../../../resources/controller";
import RestApiManager from "../../../resources/RestApiController";
export default {
    name : 'GuestUserLogin',
    data(){
        return {
            data : { 
                guestName : '',
                guestEmail : '',
            },
            isloading : false
        }
    },
    methods:{
        signIn(){
            if(!this.isloading){
                this.isloading = true;
                if(this.data.guestName && this.data.guestEmail ){
                    if(GuppyChatManager.validateEmail(this.data.guestEmail)){
                        this.axios.post('register-guppy-account', this.data).then( response =>{
                            this.isloading = false;
                            if(response.data.type == 'success' ){
                                let data = response.data;
                                this.axios.defaults.headers.common['Authorization'] = `Bearer ` + data.authToken;
                                this.$store.commit('updateUserInfo', { userId : data.userId, userType : 0 });
                                this.$root.$emit('openFloatingTab');
                                this.$root.$emit('toggleSignInWindow', false);
                                this.$store.dispatch('initRealTimeChatSetting',{ authToken : data.authToken });
                                RestApiManager.getGuestUserInfo();
                            } else {
                                this.alertBox('error', this.TRANS.error_title, response.data.message_desc );
                            }
                        }).catch( errors => {
                            this.isloading = false;
                            this.errors = errors;
                            this.alertBox('error', this.TRANS.error_title, this.TRANS.input_params_err );
                        })
                    } else {
                        this.isloading = false;
                        this.alertBox('error', this.TRANS.error_title, this.TRANS.invalid_email );
                    }
                } else {
                    this.isloading = false;
                    this.alertBox('error', this.TRANS.error_title, this.TRANS.empty_input_err_txt );
                }
            }
        }
    },

}
</script>