<template>
    <div>
        <ul class="at-floatimglist" v-if="minimizeChats.topChats.length">
            <li v-for="single in minimizeChats.topChats" :key="single.chatId">
                <a href="javascript:void(0);">
                    <template v-if="[1,3].includes(Number(single.chatType))">
                        <img  :src="single.userAvatar ? single.userAvatar : defaultAvatar" :alt="single.userName" @click.prevent="minimizeWidgetChatbox(single.chatId)" >
                        <span class="at-infotolltip">
                            <em>{{ single.userName }}</em>
                        </span>
                    </template>
                    <i class="guppy-x" @click.prevent="closeWidgetChatbox(single.chatId)"></i>
                    <span v-if="single.UnreadCount > 0" class="at-userstatus notify"></span>
                </a>
            </li>
       
            <li v-if="minimizeChats.bottomChats.length">
                <a href="javascript:void(0);" @click.prevent="toggleUsersMenue(!isOpenMenu)" id="at_moreitems">
                    <em> <i :class="isOpenMenu ? 'guppy-x' : 'guppy-more-horizontal'"></i> </em>
                </a>
                <div class="at-floatdropdownholder">
                    <ul class="at-floatdropdown">
                        <li v-for="single in minimizeChats.bottomChats" :key="single.chatId">
                            <a href="javascript:void(0);"  @click.prevent="minimizeWidgetChatbox(single.chatId)">
                                <template v-if="[1,3].includes(single.chatType)">
                                    <img  :src="single.userAvatar ? single.userAvatar : defaultAvatar" :alt="single.userName" >
                                </template>
                            </a>
                        </li>
                    </ul>
                    <a href="javascript:void(0);" @click.prevent="closeAllChats()" >
                        <i class="guppy-x"></i>{{TRANS.close_all_conversation}}
                    </a>
                </div>
            </li>
        </ul>
        <template v-if="Object.keys(chats).length">
            <guppywidget-chat-box :chatId="chat.chatId" v-for="chat in chats" :key="chat.chatId"/>
        </template>
        <template v-else>
            <whatsapp-chat-box v-if="enableWhatsappWidgetBox"/>
            <sign-in-box v-else-if="isOpenSignInWindow" @closeSignInWindow="isOpenSignInWindow = false" />
        </template>
    </div>
</template>

<script>
import { GUPPYCHAT_CONSTANTS } from "../../resources/constants";
import GuppywidgetChatBox from "./GuppywidgetChatBox.vue";
import jQuery from 'jquery';
import GuppyWhatsappChatBox from "./GuppyWhatsappChatBox.vue";
import SignInBox from "./guppyChatSignInBox/SignInBox.vue";
export default { 
    name : "GuppyFloatingChatList",
    components :{
        WhatsappChatBox : GuppyWhatsappChatBox,
        GuppywidgetChatBox,
        SignInBox,
    },
    data(){
        return {
            isOpenMenu          : false,
            isOpenSignInWindow  : false,
            defaultAvatar       : GUPPYCHAT_CONSTANTS.AVATAR
        }
    },
    computed:{
        enableWhatsappWidgetBox(){
            let chatInfo = new Object();
            if(!this.$store.state.isMessangerChat){
                chatInfo = this.$store.getters.getChatInfo('00_4');
            }
            return Object.keys(chatInfo).length ? true : false;
        },
        minimizeChats(){
            let windowHeight = jQuery( window ).height();
            let showTopChats = 7; 
            if(windowHeight <= 800){
                showTopChats = 5;
            } else if(windowHeight < 770){
                showTopChats = 3;
            }
            let data    = { topChats : [] , bottomChats : [] }
            let chats   = this.$store.getters.minimizeChats; 
            data.topChats     = chats.slice(0,showTopChats);
            data.bottomChats  = chats.slice(showTopChats,chats.length);
            return data;
        },
        chats(){
            return this.$store.getters.widgetChats;
        },
    },
    methods:{
        toggleUsersMenue(toggle){
            this.isOpenMenu = toggle ;
            jQuery('.at-floatdropdownholder').slideToggle(200);
        },
        minimizeWidgetChatbox(chatId){
            this.$store.commit('minimizeWidgetChatbox', {chatId: chatId, isMinimize : false });
            this.isOpenMenu = false;
            jQuery('.at-floatdropdownholder').hide();
        },
        closeWidgetChatbox(chatId){
            this.$store.commit('closeWidgetChatbox', {chatId: chatId });
        },
        closeAllChats(){
            this.$store.commit('updateChatInfo', {});
        },
    },
    created(){
        this.$store.dispatch('initRealTimeChatSetting',{ authToken : window.wpguppy_scripts_vars.authToken });
    },
    mounted(){
        this.$root.$on('toggleSignInWindow',(value)=>{
            if(value){
                this.$store.commit('updateChatInfo', {})
            }
            this.isOpenSignInWindow = value;
        });
    }
}
</script>
<style scoped>
    @import url('../resources/style.css');
    @import url('../resources/rtl.css');
    @import url('../resources/updatestyle.css');
    @import url('../resources/whatsappstyle.css');
</style>