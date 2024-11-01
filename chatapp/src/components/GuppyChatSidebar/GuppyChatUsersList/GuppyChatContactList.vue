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
        <ul class="user-list" v-if="Object.keys(contactList).length" @scroll.prevent="userScrollHandler($event)" >
            <guppy-chat-user-list-item
                v-for="(user) in contactList"
                :key="user.chatId"
                :userProps="user"
                tab="contacts"
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
    name : "GuppyChatContactList",
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
      contactList: state => state.contactList,
      contactListFlag: state => state.contactListFlag,
      contactListOffset: state => state.contactListOffset,
      noMoreContactUsers: state => state.noMoreContactUsers,
      contactUserSearch: state => state.contactUserSearch,
    }),
    methods:{
        searchUser(){
            this.$store.commit('updateRecordList', {RecordList: 'noMoreContactUsers', RecordListValue: false});
            this.isScrolling    = false;
            clearTimeout(this.timer); 
            this.timer = setTimeout(()=>{
                this.updateListRecord( {} );
                this.$store.commit('updateOffset', {offset:'contactListOffset', offsetValue: 0});
                this.$store.commit('updateSearch', {search:'contactUserSearch', searchValue: this.search});
                this.getUsers();
                this.updateOffset();
            }, 800)
        },
        updateOffset(){
            let currentOffset = this.contactListOffset + this.RecordLimit;
            this.$store.commit('updateOffset', {offset:'contactListOffset', offsetValue: currentOffset});
        },
        async getUsers() {
            if ( !this.noMoreContactUsers ) {
                this.isLoading = true;
                let response = await RestApiManager.getUsersList(this.contactListOffset,this.search)
                this.isLoading = false;
                if (response.data.type == "success") {
                    let currentMoreRecord = Object.keys(response.data.guppyUsers).length == 0 ? true : false;
                    this.$store.state.autoInvite = response.data.autoInvite;
                    this.$store.commit('updateRecordList', {RecordList: 'noMoreContactUsers', RecordListValue: currentMoreRecord});
                    if(!this.contactListFlag){
                        this.$store.commit('updateListFlag', {flag: 'contactListFlag', flagValue:true});
                    }
                    this.updateListRecord( response.data.guppyUsers );
                } else if(response.data.type == "error"){
                    this.alertBox('error', this.TRANS.error_title, response.data.message_desc);
                }
            }
        },
         //Handles user list scroll
        userScrollHandler(elem) {
            if ( elem.target.offsetHeight + elem.target.scrollTop >= elem.target.scrollHeight - 20 ) {
                this.isScrolling = true;
                this.getUsers();
                this.updateOffset();
            }
        },
        updateListRecord( recList ){
            let data = {
                'list'      : recList,
                'listType'  : 'contactList',
                'isScrolling' : this.isScrolling
                }
            this.$store.commit('updateTabListRecord', data)
        }
    },
    mounted(){
        this.search = this.contactUserSearch;
    },
    created(){
        if( !this.contactListFlag || !Object.keys(this.contactList).length ){
            this.getUsers();
            this.updateOffset();
        }
    }
}
</script>