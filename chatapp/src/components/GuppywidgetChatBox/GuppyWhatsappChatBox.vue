<template>
    <div class="gp-floatchat gp-whatsappfloat" :id="`whatsappchat_${chatInfo.chatId}`">
        <div class="gp-floatchat_content gp-whatsappchat gp-widget-box">
            <div class="gp-floatchat_title gp-floatchat_titlev2">
                <figure class="gp-singleimg" :class="{'gp-notavailable' : !chatInfo.isOnline}">
                    <img :src="chatInfo.userAvatar ? chatInfo.userAvatar : defaultAvatar" :alt="chatInfo.userName">
                    <span class="gp-userstatus" :class="chatInfo.isOnline ? 'online' : 'offline'"></span>
                </figure>
                <div class="gp-whatsapptitle">
                    <h2 v-if="chatInfo.userName">{{ chatInfo.userName | capitalize }}</h2>
                    <div class="gp-floatchat_title-right">
                        <a href="javascript:void(0);"><i class="guppy-x" @click.prevent="closeWidgetChatbox()" ></i></a>
                    </div>
                </div>
            </div>
            <div class="gp-messagewrap" :style="chatBackround" >
                <div v-if="isLoading" class="gp-msgautotyper">
                    <img :src="typingIcon" :alt="TRANS.whatsapp_loading_msg">
                </div>
                <div v-else class="gp-messages">
                    <div class="gp-message"> 
                        <span v-linkified v-html="userMessageText"></span> 
                        <span class="gp-message_time">{{currentTime}}</span>
                    </div>
                </div>
            </div>
            <div class="at-replay at-replaywt">
                <send-text-message :chatId="'00_4'"/>
                <span><a v-if="getMessageInput" @click.prevent="sendTextMessage()" href="javascript:void(0);" class="at-send"><i class="guppy-send"></i></a></span>
            </div>
        </div>
    </div>
</template>

<script>
    import moment from "moment";
    import GuppyChatSendTextMessage from "../GuppyChatMessages/GuppyChatMessageFooter/GuppyChatSendTextMessage.vue"
    import { GUPPYCHAT_SETTINGS, GUPPYCHAT_CONSTANTS } from "../../resources/constants";
    import jQuery from 'jquery';
    import Vue from 'vue'
    import linkify from 'vue-linkify';
    Vue.directive('linkified', linkify);
    export default {
        name : 'GuppyWhatsappChatBox',
        components : {
            SendTextMessage : GuppyChatSendTextMessage,
        },
        data(){
            return {
                defaultAvatar       : GUPPYCHAT_CONSTANTS.AVATAR,
                currentTime         : moment().format("LT"),
                typingIcon          : GUPPYCHAT_SETTINGS.typingIcon,
                whatsappBackground  : GUPPYCHAT_SETTINGS.whatsappBackground,
            }
        },
        computed:{
            chatBackround(){
                if(this.whatsappBackground){
                    return { backgroundImage : `url(${this.whatsappBackground})` }
                }
                return { backgroundColor : '#F7F1E7' };
            },
            chatInfo(){
                return this.$store.getters.getChatInfo('00_4');
            },
            getMessageInput(){
                return this.$store.getters.getMessageInput('00_4');
            },
            userMessageText(){
                let chatInfo = this.$store.getters.getChatInfo('00_4');
                if(Object.keys(chatInfo).length){
                    return chatInfo.isOnline ? chatInfo.userDefaultMessage : chatInfo.userOfflineMessage
                }
                return '';
            }
            
        },
        watch:{
            chatInfo(newVal, oldVal){
                if(newVal.chatId != oldVal.chatId){
                    if(newVal.isOnline){
                        this.isLoading = true;
                        this.loadingMessage();
                    }
                }
            }
        },
        methods:{
            sendTextMessage(){
                document.getElementById(`input-text-message-${this.chatInfo.chatId}`).focus();
                this.$root.$emit('openWhatsapp', {chatId : this.chatInfo.chatId});
            },
            closeWidgetChatbox(){
                jQuery('.gp-chat').removeClass('gp-opnchatbox');
                this.$store.commit('removeChatInfo', {chatId:'00_4'});
            },
            loadingMessage(){
                setTimeout(()=>{
                    this.isLoading = false;
                },2000);
            }
        },
        created(){
            if(this.chatInfo.isOnline){
                this.isLoading = true;
                this.loadingMessage()
            }
        }
    }
</script>

<style scoped>
.at-whatsappchat .at-messagewrap{
    height: 100%;
    padding: 30px;
    min-height: auto;
    max-height: 100%;
    background-size: cover;
    background-repeat: no-repeat;
}
.at-whatsappchat .at-messages{
    padding: 0;
}
.at-whatsappchat .at-message{
    font-size: 15px;
    max-width: 100%;
    line-height: 22px;
    padding: 20px 20px 14px 20px; 
}
.at-whatsappchat .at-message span{
    margin: 0;
}
.at-whatsappchat{
    height: 100vh;
    max-height: 427px;
}
.at-whatsappchat .at-messagewrap > img{
    padding: 30px;
    display: block;
}
.at-floatchat_titlev2 .at-floatchat_title-right a{
    font-size: 28px;
}
.at-replaywt{
    height: 80px;
    padding: 15px 20px 20px;
}
</style>