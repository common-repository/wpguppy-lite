<template>
    <div id="friendlist" class="at-userlist_tab">
        <div class="at-sidebarhead_search at-sidebarhead_searchv2">
            <div class="at-form-group">
                <i class="guppy-search"></i>
                <input 
                    type="search" 
                    v-model="search"
                    @input="searchFriends()" 
                    class="at-form-control" 
                    name="search" 
                    :placeholder="TRANS.search" />
            </div>
        </div>
        <ul v-if="Object.keys(friendList).length" @scroll.prevent="friendListScrollHandler($event)" class="conversation-list">
            <li class="at-userbar" :class="{'active' : friend.chatId == chatInfo.chatId}" @click.prevent="openConversation( friend )" v-for="(friend, index ) in friendList" :key="index">
                <figure class="at-userbar_profile">
                    <span class="at-userstatus" :class="friend.isOnline ? 'online':'offline'"></span>
                    <img :src="friend.userAvatar ? friend.userAvatar : defaultAvatar" :alt="friend.userName">
                </figure>
                <div v-if="friend.userName" class="at-userbar_title">
                    <h3>{{ friend.userName | capitalize }}</h3>
                </div>
            </li>
            <guppy-chat-inner-loader v-if="isLoading"/>
        </ul>
         <template v-else>
            <guppy-chat-loader v-if="isLoading"/>
            <guppy-chat-empty-view v-else :isSidebarProps="true" :listIcon="'guppy-user-plus'"/> 
        </template>
    </div>
</template>

<script>
import { GUPPYCHAT_CONSTANTS } from "../../../resources/constants";
import GuppyChatEmptyView from "../../EmptyViews/GuppyChatEmptyView.vue";
import GuppyChatLoader from "../../GuppyChatLoader/GuppyChatLoader.vue";
import GuppyChatInnerLoader from "../../GuppyChatLoader/GuppyChatInnerLoader.vue";
import RestApiManager from "../../../resources/RestApiController";
import GuppyChatManager from "../../../resources/controller";
import { mapState } from 'vuex';
export default {
    name : "GuppyChatFriendList",
    props:['TabProps'],
    components:{
        GuppyChatEmptyView,
        GuppyChatLoader,
        GuppyChatInnerLoader
    },
    data(){
        return{
            defaultAvatar : GUPPYCHAT_CONSTANTS.AVATAR,
            search      : '',
            userStatus  : 1,
            timer : null,
        }
    },
    computed :mapState({
      friendList:           state => state.friendList,
      friendListFlag:       state => state.friendListFlag,
      friendListOffset:     state => state.friendListOffset,
      noMoreFriendUsers:    state => state.noMoreFriendUsers,
      friendUserSearch:     state => state.friendUserSearch,
      chatInfo:             state => state.chatInfo,
      userProfile:          state => state.userProfile,
    }),
    methods:{
        searchFriends(){
            this.$store.commit('updateRecordList', {RecordList: 'noMoreFriendUsers', RecordListValue: false});
            this.isScrolling = false;
            clearTimeout(this.timer); 
            this.timer = setTimeout(()=>{
                this.updateListRecord( {} );
                this.$store.commit('updateOffset', {offset:'friendListOffset', offsetValue: 0});
                this.$store.commit('updateSearch', {search:'friendUserSearch', searchValue: this.search});
                this.getFriends();
                this.updateOffset();
            }, 800)
        },
        async getFriends(){
            if ( !this.noMoreFriendUsers ) {
                this.isLoading = true;
                let response = await RestApiManager.getContactList(this.friendListOffset,this.userStatus, this.search)
                this.isLoading = false;
                if( response.data.type == "success" ) {
                    let currentMoreRecord = Object.keys(response.data.contacts).length == 0 ? true : false;
                    this.$store.commit('updateRecordList', {RecordList: 'noMoreFriendUsers', RecordListValue: currentMoreRecord});
                    if( !this.friendListFlag ) {
                        this.$store.commit('updateListFlag', {flag: 'friendListFlag', flagValue:true});
                    }
                    this.updateListRecord( response.data.contacts )
                } else if( response.data.type == "error" ) {
					this.alertBox('error', this.TRANS.error_title, response.data.message_desc);
				}
            }
        },
        updateOffset(){
            let currentOffset = this.friendListOffset + this.RecordLimit;
            this.$store.commit('updateOffset', {offset:'friendListOffset', offsetValue: currentOffset});
        },
        // Handles friend list scroll
        friendListScrollHandler(elem) {
            if (
                (elem.target.offsetHeight + elem.target.scrollTop) >=
                elem.target.scrollHeight
            ) {
                this.isScrolling = true;
                this.getFriends();
                this.updateOffset();
            }
        },
        openConversation( params ){
            params['chatType'] = 1;
            if(this.chatInfo){
                if(Number(this.chatInfo.chatId) != Number(params.chatId)){
                    let payload = {
                    userName   : this.userProfile.userName,
                    chatType   : this.chatInfo.chatType,
                    chatId     : this.chatInfo.chatId,
                    senderId   : params.chatId,
                    text       : '',
                    }
                    this.$store.dispatch('triggerclientEvents', {'event':'isTyping', payload});
                }
            }

            if(params.UnreadCount > 0){
                let dataValues = {
                    chatId      : params.chatId,
                    userId      : this.userId,
                    userType    : this.userType,
                    chatType    : params.chatType,
                }
                GuppyChatManager.updateSeenMessagesCounter(dataValues);
            }

            this.$store.commit('updateChatInfo', { data: params, userClick : true});
        },
        updateListRecord( recList ){
            let data = {
                'list'      : recList,
                'listType'  : 'friendList',
                'isScrolling' : this.isScrolling
                }
            this.$store.commit('updateTabListRecord', data)
        },
    },
    created(){
        if(!Object.keys(this.friendList).length || !this.friendListFlag ){
            this.getFriends();
            this.updateOffset();
        }
    },
    mounted(){
        this.search = this.friendUserSearch;
    }

}
</script>