<template>
    <div id="userlist" class="at-userlist_tab active">
        <div class="at-sidebarhead_search at-sidebarhead_searchv2">
            <div class="at-form-group">
                <i class="guppy-search"></i>
                <input 
                    @input="searchUser()" 
                    v-model.trim="search" 
                    type="search" 
                    class="form-control" 
                    name="search" 
                    :placeholder="TRANS.search" />
            </div>
        </div>
        <ul class="user-list" v-if="Object.keys(requestList).length" @scroll.prevent="userScrollHandler($event)" >
            <guppy-chat-user-list-item
                v-for="user in Object.values(requestList)"
                :key="user.chatId"
                :userProps="user"
                tab="requests"
                />
            <guppy-chat-inner-loader v-if="isLoading"/>
        </ul>
        <template v-else>
            <guppy-chat-loader v-if="isLoading"/>
            <guppy-chat-empty-view v-else :isSidebarProps="true" :listIcon="'guppy-users'"/> 
        </template>
    </div>
</template>

<script>
import GuppyChatUserListItem from "./GuppyChatUserListItem.vue";
import GuppyChatLoader from "../../GuppyChatLoader/GuppyChatLoader.vue";
import GuppyChatInnerLoader from "../../GuppyChatLoader/GuppyChatInnerLoader.vue";
import GuppyChatEmptyView from "../../EmptyViews/GuppyChatEmptyView.vue";
import RestApiManager from "../../../resources/RestApiController";
import { mapState } from 'vuex';
export default {
    name : "GuppyChatRequestList",
    components : {
        GuppyChatUserListItem,
        GuppyChatLoader,
        GuppyChatInnerLoader,
        GuppyChatEmptyView
    },
    data(){
        return{
            search      : '',
            inviteResonseData : '',
            timer : null,
            scrolledToBottom : false,
            selectedTab: 'contacts'
        }
    },
    computed :mapState({
      requestList: state => state.requestList,
      requestListFlag: state => state.requestListFlag,
      requestListOffset: state => state.requestListOffset,
      noMoreRequesttUsers: state => state.noMoreRequesttUsers,
      requestUserSearch: state => state.requestUserSearch,
    }),
    methods:{
        searchUser(){
            this.$store.commit('updateRecordList', {RecordList: 'noMoreRequesttUsers', RecordListValue: false});
            this.isScrolling    = false;
            clearTimeout(this.timer); 
            this.timer = setTimeout(()=>{
                this.updateListRecord( {} );
                this.$store.commit('updateOffset', {offset:'requestListOffset', offsetValue: 0});
                this.$store.commit('updateSearch', {search:'requestUserSearch', searchValue: this.search});
                this.getUsers();
                this.updateOffset();
            }, 800)
        },
        updateOffset(){
            let currentOffset = this.requestListOffset + this.RecordLimit;
            this.$store.commit('updateOffset', {offset:'requestListOffset', offsetValue: currentOffset});
        },
        async getUsers() {
            if ( !this.noMoreRequesttUsers ) {
                this.isLoading = true;
                let response = await RestApiManager.getFriendRequestsList(this.requestListOffset,this.search)
                this.isLoading = false;
                if (response.data.type == "success") {
                    let currentMoreRecord = Object.keys(response.data.guppyFriendRequests).length == 0 ? true : false;
                    this.$store.commit('updateRecordList', {RecordList: 'noMoreRequesttUsers', RecordListValue: currentMoreRecord});
                    if(!this.requestListFlag){
                        this.$store.commit('updateListFlag', {flag: 'requestListFlag', flagValue:true});
                    }
                    this.updateListRecord( response.data.guppyFriendRequests );
                } else if(response.data.type == "error"){
                    this.alertBox('error', this.TRANS.error_title, response.data.message_desc);
                }
            }
        },
         //Handles user list scroll
        userScrollHandler(elem) {
            if ( (elem.target.offsetHeight + elem.target.scrollTop ) + 1 >= elem.target.scrollHeight ) {
                this.isScrolling = true;
                this.getUsers();
                this.updateOffset();
            }
        },
        updateListRecord( recList ){
            let data = {
                'list'      : recList,
                'listType'  : 'requestList',
                'isScrolling' : this.isScrolling
                }
            this.$store.commit('updateTabListRecord', data)
        }
    },
    mounted(){
        this.search = this.requestUserSearch;
    },
    created(){
        if( !this.requestListFlag || !Object.keys(this.requestList).length ){
            this.getUsers();
            this.updateOffset();
        }
    }
}
</script>