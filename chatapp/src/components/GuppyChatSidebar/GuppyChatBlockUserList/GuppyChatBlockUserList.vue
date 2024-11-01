<template>
    <div id="friendlist" class="at-userlist_tab">
        <div class="at-sidebarhead_search at-sidebarhead_searchv2">
            <div class="at-form-group">
                <i class="guppy-search"></i>
                <input 
                    v-model="search"
                    @input="searchBlockUser()" 
                    type="search" 
                    class="at-form-control" 
                    name="search" 
                    :placeholder="TRANS.search" />
            </div>
        </div>
        <ul v-if="Object.keys(blockList).length" @scroll.prevent="blockListScrollHandler($event)" class="conversation-list">
            <li class="at-userbar" v-for="blockUser in blockList" :key="blockUser.chatId+Math.floor(Math.random() * 10000)">
                <figure class="at-userbar_profile at-blockuser">
                    <i class="guppy-slash"></i>
                    <img :src="blockUser.userAvatar" :alt="blockUser.userName">
                </figure>
                <div v-if="blockUser.userName" class="at-userbar_title">
                    <h3>{{ blockUser.userName | capitalize }}</h3>
                </div>
                <div class="at-userbar_right">
                    <a  href="javascript:void(0);" 
                        @click.prevent="unblockUser( blockUser.chatId, 'block_user_'+blockUser.chatId )" 
                        :id="'block_user_'+blockUser.chatId" :class="{'at-disable-btn' : activeUser == 'block_user_'+blockUser.chatId }"
                        class="at-btn-blocked">
                        {{TRANS.unblock}}</a>
                </div>
            </li>
            <guppy-chat-inner-loader v-if="isLoading"/>
        </ul>
        <template v-else>
            <guppy-chat-loader v-if="isLoading"/>
            <guppy-chat-empty-view v-else :isSidebarProps="true" :listIcon="'guppy-user-x'"/> 
        </template>
    </div>
</template>

<script>
import GuppyChatEmptyView from "../../EmptyViews/GuppyChatEmptyView.vue";
import GuppyChatLoader from "../../GuppyChatLoader/GuppyChatLoader.vue";
import GuppyChatInnerLoader from "../../GuppyChatLoader/GuppyChatInnerLoader.vue";
import GuppyChatManager from "../../../resources/controller"
import RestApiManager from "../../../resources/RestApiController";
import { mapState } from 'vuex';
export default {
    name : "GuppyChatBlockUserList",
    components:{
        GuppyChatEmptyView,
        GuppyChatLoader,
        GuppyChatInnerLoader
    },
    data(){
        return{
            search      : '',
            userStatus  : 3,
            activeUser  : '',
            timer       : null,
        }
    },
    computed :mapState({
      blockList         : state => state.blockList,
      blockListFlag     : state => state.blockListFlag,
      blockListOffset   : state => state.blockListOffset,
      noMoreBlockUsers  : state => state.noMoreBlockUsers,
      blockUserSearch   : state => state.blockUserSearch,
    }),
    methods:{
        searchBlockUser(){
            this.$store.commit('updateRecordList', {RecordList: 'noMoreBlockUsers', RecordListValue: false});
            this.isScrolling = false;
            clearTimeout(this.timer); 
            this.timer = setTimeout(()=>{
                this.updateListRecord( {} );
                this.$store.commit('updateOffset', { offset:'blockListOffset', offsetValue: 0 });
                this.$store.commit('updateSearch', {search:'blockUserSearch', searchValue: this.search});
                this.getBlockUser();
                this.updateOffset();
            }, 800)
        },
        async getBlockUser(){
            if ( !this.noMoreBlockUsers ) {
                this.isLoading  = true;
                let response    = await RestApiManager.getContactList(this.blockListOffset,this.userStatus, this.search)
                this.isLoading  = false;
                if( response.data.type == "success" ) {
                    let currentMoreRecord = Object.keys(response.data.contacts).length == 0 ? true : false;
                        this.$store.commit('updateRecordList', {RecordList: 'noMoreBlockUsers', RecordListValue: currentMoreRecord});
                    if(!this.blockListFlag){
                        this.$store.commit('updateListFlag', {flag: 'blockListFlag', flagValue:true});
                    }
                    this.updateListRecord( response.data.contacts );
                } else if( response.data.type == "error" ) {
					this.alertBox('error', this.TRANS.error_title, response.data.message_desc);
				}
            }
        },
        updateOffset(){
            let currentOffset = this.blockListOffset + this.RecordLimit;
            this.$store.commit('updateOffset', {offset:'blockListOffset', offsetValue: currentOffset});
        },
        async unblockUser( receiverId, activeUser ){
            let data = {
                    'statusType': 4,
                    'actionTo'  : receiverId,
                    'userId'    : this.userId,
                }

            this.activeUser = activeUser;
            let response = await GuppyChatManager.updateUserStatus(data);
            if( response.data.type == "success" ) {
                let data = response.data.userData
                data['statusText'] = 'invite';
                this.$store.commit('UpdateSelectUserStatus', data );
            } else if( response.data.type == "error" ) {
                this.alertBox('error', this.TRANS.error_title, response.data.message_desc);
            }
            this.activeUser = '';
        },
        blockListScrollHandler(elem) {
            if (
                (elem.target.offsetHeight + elem.target.scrollTop) >=
                elem.target.scrollHeight
            ) {
                this.isScrolling = true;
                this.getBlockUser();
                this.updateOffset();
            }
        },
        updateListRecord( recList ){
            let data = {
                'list'      : recList,
                'listType'  : 'blockList',
                'isScrolling' : this.isScrolling
                }
            this.$store.commit('updateTabListRecord', data)
        }
    },
    created(){
        if( !Object.keys(this.blockList).length || !this.blockListFlag){
            this.getBlockUser();
            this.updateOffset();
        }
    },
    mounted(){
        this.search = this.blockUserSearch;
    }

}
</script>

<style>
    .conversation-list{
        height : 600px;
        overflow-y : auto;
        margin : 0;
        padding : 0;
    }
</style>