<template>
    <div id="at-admin-support-list" class="at-userlist_tab at-userlist_tabv2">
        <div class="at-sidebarhead_search at-sidebarhead_searchv2" :class="{'at-support-chat' : isSupportMember}">
            <div class="at-form-group">
                <i class="guppy-search"></i>
                <input type="search" v-model="search" @input="searchAdminChat()" class="at-form-control" name="search" :placeholder="TRANS.search" />
            </div>
        </div>
        <ul v-if="Object.keys(adminSupportChats).length" @scroll.prevent="customerSupportScrollHandler($event)" class="conversation-list">
            <li class="at-userbar" @click.prevent="openConversation( supportUser )" v-for="(supportUser, index ) in adminSupportChats" :key="index+ '_' + Math.floor(Math.random() * 99999999)">
                <figure class="at-userbar_profile">
                    <span class="at-userstatus" :class="supportUser.isOnline && userType == 1 ? 'online':'offline'"></span>
                    <img :src="supportUser.userAvatar ? supportUser.userAvatar : defaultAvatar" :alt="supportUser.userName">
                </figure>
                <div v-if="supportUser.userName" class="at-userbar_title">
                    <h3 v-if="supportUser.userName">{{supportUser.userName | capitalize}}</h3>
                    <template v-if="supportUser.startChat">
                        <a class="at-btn-sm at-linebtn" href="javascript:void(0);" v-on:click.stop.prevent="openConversation( supportUser )"> {{TRANS.start_chat_txt}} </a>
                    </template>
                    <template v-else>
                        <span v-if="Number(supportUser.messageStatus) == 2 "><i class="guppy-slash"></i>{{TRANS.deleted_message}}</span>	
                        <span v-else-if="Number(supportUser.messageType) == 0 ">{{supportUser.message}}</span>
                        <span v-else-if="Number(supportUser.messageType) == 1 "><i class="guppy-paperclip"></i>{{supportUser.isSender ? TRANS.you_sent_attachment : TRANS.sent_you_attachment }}</span>
                        <span v-else-if="Number(supportUser.messageType) == 2 "><i class="guppy-map-pin"></i>{{supportUser.isSender ? TRANS.you_sent_location : TRANS.sent_you_location }}</span>
                        <span v-else-if="Number(supportUser.messageType) == 3 "><i class="guppy-mic"></i>{{supportUser.isSender ? TRANS.you_sent_voice_note : TRANS.sent_you_voice_note }}</span>	
                    </template>
                </div>
                <div class="at-userbar_right">
                    <span v-if="supportUser.timeStamp">{{getMessageTime(supportUser.timeStamp)}}</span>
                    <em v-if="Number(supportUser.UnreadCount) > 0 && Number(supportUser.UnreadCount) < 100" class="at-notify">{{supportUser.UnreadCount}}</em>
                    <em v-else-if="Number(supportUser.UnreadCount) > 99" class="at-notify">99+</em>
                </div>
            </li>
            <guppy-chat-inner-loader v-if="isLoading"/>
        </ul>
         <template v-else>
            <guppy-chat-loader v-if="isLoading"/>
            <guppy-chat-empty-view v-else :isSidebarProps="true" :svgIcon="true" listIcon="group"/> 
        </template>
    </div>
</template>

<script>
import { GUPPYCHAT_CONSTANTS } from "../../../resources/constants";
import GuppyChatManager from "../../../resources/controller";
import GuppyChatEmptyView from "../../EmptyViews/GuppyChatEmptyView.vue";
import GuppyChatLoader from "../../GuppyChatLoader/GuppyChatLoader.vue";
import GuppyChatInnerLoader from "../../GuppyChatLoader/GuppyChatInnerLoader.vue";
import RestApiManager from "../../../resources/RestApiController";
import { mapState } from 'vuex';
export default {
    name : "CustomerSupportChatList",
    components:{
        GuppyChatEmptyView,
        GuppyChatLoader,
        GuppyChatInnerLoader
    },
    data(){
        return{
            defaultAvatar   : GUPPYCHAT_CONSTANTS.AVATAR,
            search          : '',
            timer           : null,
            userChatId      : '',
        }
    },
    watch : {
        userType(newVal, oldVal){
            if(newVal == 1 && oldVal == 0 ){
                this.$store.commit('refreshSupportChats');
                setTimeout(()=>{
                    this.getAdminSupportUser();
                },100)
            }
        },
    },
    computed : {
        chatInfo(){
            return this.$store.getters.getChatInfo(this.userChatId)
        },
        ...mapState({
            adminSupportChats       :   state => state.adminSupportChats,
            adminSupportChatsFlag   :   state => state.adminSupportChatsFlag,
            adminSupportChatsOffset :   state => state.adminSupportChatsOffset,
            noMoreAdminSupportChats :   state => state.noMoreAdminSupportChats,
            adminSupportChatsSearch :   state => state.adminSupportChatsSearch,
            isSupportMember         :   state => state.isSupportMember,
            userProfile             :   state => state.userProfile,
        })
    },
    methods:{
        getMessageTime(messageTimeStamp) {
            return GuppyChatManager.getLongDateTime(messageTimeStamp)
        },
        searchAdminChat(){
            this.$store.commit('updateRecordList', {RecordList: 'noMoreAdminSupportChats', RecordListValue: false});
            this.isScrolling = false;
            clearTimeout(this.timer); 
            this.timer = setTimeout(()=>{
                this.updateListRecord( {} );
                this.$store.commit('updateOffset', {offset:'adminSupportChatsOffset', offsetValue: 0});
                this.$store.commit('updateSearch', {search:'adminSupportChatsSearch', searchValue: this.search});
                this.getAdminSupportUser();
                this.updateOffset();
            }, 800)
        },
        async getAdminSupportUser(){
            if ( !this.noMoreAdminSupportChats ) {
                this.isLoading = true;
                let response = await RestApiManager.getAdminSupportUserChats(this.adminSupportChatsOffset, this.search, this.isSupportMember)
                this.isLoading = false;
                if( response.data.type == "success" ) {
                    let currentMoreRecord = Object.keys(response.data.guppyMessageList).length == 0 ? true : false;
                    this.$store.commit('updateRecordList', {RecordList: 'noMoreAdminSupportChats', RecordListValue: currentMoreRecord});
                    if( !this.adminSupportChatsFlag ) {
                        this.$store.commit('updateListFlag', {flag: 'adminSupportChatsFlag', flagValue:true});
                    }
                    this.updateListRecord( response.data.guppyMessageList )
                } else if(response.data.type == "error"){
                    this.alertBox('error', this.TRANS.error_title, response.data.message_desc);
                }
            }
        },
        updateOffset(){
            let currentOffset = this.adminSupportChatsOffset + this.RecordLimit;
            this.$store.commit('updateOffset', {offset:'adminSupportChatsOffset', offsetValue: currentOffset});
        },
        // Handles AdminSupportUser list scroll
        customerSupportScrollHandler(elem) {
            if (
                (elem.target.offsetHeight + elem.target.scrollTop) >=
                elem.target.scrollHeight
            ) {
                this.isScrolling = true;
                this.getAdminSupportUser();
                this.updateOffset();
            }
        },
        openConversation( data ){
            if( this.userId){
                this.openChat(data)
            } else {
                this.$root.$emit('toggleSignInWindow', true);
            }
        },
        openChat( params ){
            if(params.UnreadCount > 0){
                let dataValues = {
                    chatId      : params.chatId,
                    userId      : this.userId,
                    userType    : this.userType,
                    chatType    : params.chatType,
                }
                this.$store.commit('updateUnseenCounter', params);
                GuppyChatManager.updateSeenMessagesCounter(dataValues);
            }
            this.userChatId     = params.chatId;
            if( Object.keys(this.chatInfo).length ){
                if( this.chatInfo.chatId != params.chatId ){
                    let payload = {
                        userName   : this.userProfile.userName,
                        chatType   : this.chatInfo.chatType,
                        chatId     : this.chatInfo.chatId,
                        senderId   : params.chatId,
                        userType   : this.userType,
                        text       : '',
                    }
                    this.$store.dispatch('triggerclientEvents', {'event':'isTyping', payload});
                }
            }
            this.$store.commit('updateChatInfo', { data: params, userClick : true});
        },
        updateListRecord( recList ){
            let data = {
                'list'      : recList,
                'listType'  : 'adminSupportChats',
                'isScrolling' : this.isScrolling
                }
            this.$store.commit('updateTabListRecord', data)
        },
    },
    created(){
        if(!Object.keys(this.adminSupportChats).length || !this.adminSupportChatsFlag ){
            this.getAdminSupportUser();
            this.updateOffset();
        }
    },
    mounted(){
        this.search = this.adminSupportChatsSearch;
        this.$root.$on('refreshSupportChatList',()=>{

        });
    }

}
</script>