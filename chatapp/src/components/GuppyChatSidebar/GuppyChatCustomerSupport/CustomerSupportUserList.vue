<template>
    <div id="at-admin-support-list" class="at-userlist_tab at-userlist_tabv2">
        <div class="at-sidebarhead_search at-sidebarhead_searchv2">
            <div class="at-form-group">
                <i class="guppy-search"></i>
                <input type="search" v-model="search" @input="searchAdminUser()" class="at-form-control" name="search" :placeholder="TRANS.search" />
            </div>
        </div>
        <ul v-if="Object.keys(adminSupportUserList).length" @scroll.prevent="customerListScrollHandler($event)" class="conversation-list">
            <li class="at-userbar" @click.prevent="openConversation( supportUser )" v-for="(supportUser, index ) in adminSupportUserList" :key="index+ '_' + Math.floor(Math.random() * 99999999)">
                <figure class="at-userbar_profile">
                    <span class="at-userstatus" :class="supportUser.isOnline && userType == 1 ? 'online':'offline'"></span>
                    <img :src="supportUser.userAvatar ? supportUser.userAvatar : defaultAvatar" :alt="supportUser.userName">
                </figure>
                <div v-if="supportUser.userName" class="at-userbar_title at-userbar_title-v2">
                    <h3 v-if="supportUser.userName">{{supportUser.userName | capitalize}}</h3>
                    <div class="at-userbar_right">
                        <a class="at-btn-sm at-linebtn" href="javascript:void(0);" > {{TRANS.start_chat_txt}} </a>
                    </div>
                </div>
            </li>
            <guppy-chat-inner-loader v-if="isLoading"/>
        </ul>
         <template v-else>
            <guppy-chat-loader v-if="isLoading"/>
            <guppy-chat-empty-view v-else :isSidebarProps="true" :listIcon="'guppy-users'"/> 
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
    name : "CustomerSupportUserList",
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
    computed : {
        chatInfo(){
            return this.$store.getters.getChatInfo(this.userChatId)
        },
        ...mapState({
            adminSupportUserList        :   state => state.adminSupportUserList,
            adminSupportUserListFlag    :   state => state.adminSupportUserListFlag,
            adminSupportUserListOffset  :   state => state.adminSupportUserListOffset,
            noMoreAdminSupportUsers :   state => state.noMoreAdminSupportUsers,
            adminSupportUserSearch  :   state => state.adminSupportUserSearch,
            userProfile             :   state => state.userProfile,
        })
    },
    methods:{
        getMessageTime(messageTimeStamp) {
            return GuppyChatManager.getLongDateTime(messageTimeStamp)
        },
        searchAdminUser(){
            this.$store.commit('updateRecordList', {RecordList: 'noMoreAdminSupportUsers', RecordListValue: false});
            this.isScrolling = false;
            clearTimeout(this.timer); 
            this.timer = setTimeout(()=>{
                this.updateListRecord( {} );
                this.$store.commit('updateOffset', {offset:'adminSupportUserListOffset', offsetValue: 0});
                this.$store.commit('updateSearch', {search:'adminSupportUserSearch', searchValue: this.search});
                this.getAdminSupportUser();
                this.updateOffset();
            }, 800)
        },
        async getAdminSupportUser(){
            if ( !this.noMoreAdminSupportUsers ) {
                this.isLoading = true;
                let response = await RestApiManager.getAdminSupportUserList(this.adminSupportUserListOffset, this.search)
                this.isLoading = false;
                if( response.data.type == "success" ) {
                    let currentMoreRecord = Object.keys(response.data.supportUsers).length == 0 ? true : false;
                    this.$store.commit('updateRecordList', {RecordList: 'noMoreAdminSupportUsers', RecordListValue: currentMoreRecord});
                    if( !this.adminSupportUserListFlag ) {
                        this.$store.commit('updateListFlag', {flag: 'adminSupportUserListFlag', flagValue:true});
                    }
                    this.updateListRecord( response.data.supportUsers )
                } else if(response.data.type == "error"){
                    this.alertBox('error', this.TRANS.error_title, response.data.message_desc);
                }
            }
        },
        updateOffset(){
            let currentOffset = this.adminSupportUserListOffset + this.RecordLimit;
            this.$store.commit('updateOffset', {offset:'adminSupportUserListOffset', offsetValue: currentOffset});
        },
        // Handles AdminSupportUser list scroll
        customerListScrollHandler(elem) {
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
            if( Number( this.userId ) ){
                this.openChat(data)
            } else {
                this.$root.$emit('toggleSignInWindow', false);
                this.openChat(data)
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
                'listType'  : 'adminSupportUserList',
                'isScrolling' : this.isScrolling
                }
            this.$store.commit('updateTabListRecord', data)
        },
    },
    created(){
        if(!Object.keys(this.adminSupportUserList).length || !this.adminSupportUserListFlag ){
            this.getAdminSupportUser();
            this.updateOffset();
        }
    },
    mounted(){
        this.search = this.adminSupportUserSearch;
    }

}
</script>