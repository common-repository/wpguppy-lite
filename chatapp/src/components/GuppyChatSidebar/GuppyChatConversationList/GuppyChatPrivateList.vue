<template>
    <div id="messages" class="at-userlist_tab at-userlist_tabv2">
        <div class="at-sidebarhead_search at-sidebarhead_searchv2">
            <div class="at-form-group">
                <i class="guppy-search"></i>
                <input
                    v-model.trim="search"
                    @input="searchConversation()"
                    type="search"
                    class="at-form-control"
                    name="search"
                    :placeholder="TRANS.search"
                />
            </div>
        </div>
        <ul v-if="Object.keys(conversation).length" class="conversation-list" @scroll="conversationScrollHandler($event)">
            <guppy-chat-conversation-list-item 
                v-for="item in conversation" 
                :itemProps="item" 
                :key="item.chatId" 
            />
            <guppy-chat-inner-loader v-if="isLoading"/>
        </ul>
        <template v-else>
            <guppy-chat-loader v-if="isLoading"/>
            <guppy-chat-empty-view v-else :isSidebarProps="true" :listIcon="'guppy-message-square'"/> 
        </template>
    </div>
</template>

<script>
import GuppyChatInnerLoader from "../../GuppyChatLoader/GuppyChatInnerLoader.vue";
import GuppyChatLoader from "../../GuppyChatLoader/GuppyChatLoader.vue";
import GuppyChatConversationListItem from "./GuppyConversationListItem.vue";
import GuppyChatEmptyView from "../../EmptyViews/GuppyChatEmptyView.vue";
import RestApiManager from "../../../resources/RestApiController";
import { mapState } from 'vuex';
export default {
    name: "GuppyChatPrivateList",
    components:{ 
        GuppyChatConversationListItem,
        GuppyChatLoader,
        GuppyChatInnerLoader,
        GuppyChatEmptyView
    },
    data(){
        return {
            search :'',
            timer  : null,
            initScroll : false
        }
    },
    computed :{
        ...mapState({
            isMessangerChat   :   state => state.isMessangerChat,
            conversation      :   state => state.privateConversation,
            privateConvFlag   :   state => state.privateConvFlag,
            privateChatOffset :   state => state.privateChatOffset,
            noMorePrivateChat :   state => state.noMorePrivateChat,
            privateChatSearch :   state => state.privateChatSearch,
            windowWidth       :   state => state.windowWidth,
        }),
    },
    methods:{
        searchConversation(){
            this.$store.commit('updateRecordList', {RecordList: 'noMorePrivateChat', RecordListValue: false});
            this.isScrolling        = false;
            clearTimeout(this.timer); 
            this.timer = setTimeout(()=>{
                this.updateListRecord( {} );
                this.$store.commit('updateOffset', { offset:'privateChatOffset', offsetValue: 0 });
                this.$store.commit('updateSearch', {search:'privateChatSearch', searchValue: this.search});
                this.getConversation();
                this.updateOffset();
            }, 800);
        },
        updateOffset(){
            let currentOffset = this.privateChatOffset + this.RecordLimit;
                this.$store.commit('updateOffset', {offset:'privateChatOffset', offsetValue: currentOffset});
        },
        async getConversation(){
            if ( !this.noMorePrivateChat ) {
                this.isLoading  = true;
                let response    = await RestApiManager.getConversation(this.privateChatOffset, this.search, 1);
                this.isLoading  = false;

                if (response.data.type == "success") { 
                    let currentMoreRecord = Object.keys(response.data.guppyMessageList).length == 0 ? true : false;
                    this.$store.commit('updateRecordList', {RecordList: 'noMorePrivateChat', RecordListValue: currentMoreRecord});
                    if(!this.privateConvFlag){
                        this.$store.commit('updateListFlag', {flag: 'privateConvFlag', flagValue:true});
                    }
                    this.updateListRecord( response.data.guppyMessageList );
                } else if(response.data.type == "error"){
                    this.alertBox('error', this.TRANS.error_title, response.data.message_desc);
                }
            }
        },
        updateListRecord( recList ){
            let data = {
                'list'      : recList,
                'listType'  : 'privateConversation',
                'isScrolling' : this.isScrolling
                }
            this.$store.commit('updateTabListRecord', data)
        },
        conversationScrollHandler(elem) {
            if (
                ((elem.target.offsetHeight + elem.target.scrollTop) + 1 ) >=
                elem.target.scrollHeight
            ) {
                this.isScrolling = true;
                this.getConversation();
                this.updateOffset();
            }
        },
        openChat( params ){
            params['chatType'] = 1;
            if(this.chatInfo){
                if(this.chatInfo.chatId != params.chatId){
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
        onlineUserListScroll(){
            const scrollUserList = document.querySelector('.at-onlineusers');
            scrollUserList.addEventListener('wheel', function(e) {
                const race = 15; // How many pixels to scroll

                if (e.deltaY > 0) // Scroll right
                    scrollUserList.scrollLeft += race;
                else // Scroll left
                    scrollUserList.scrollLeft -= race;
                    e.preventDefault();
            });
            let isDown = false;
            let startX;
            let scrollLeft;

            scrollUserList.addEventListener('mousedown', (e) => {
                isDown = true;
                scrollUserList.classList.add('active');
                startX = e.pageX - scrollUserList.offsetLeft;
                scrollLeft = scrollUserList.scrollLeft;
            });
            scrollUserList.addEventListener('mouseleave', () => {
                isDown = false;
                scrollUserList.classList.remove('active');
            });
            scrollUserList.addEventListener('mouseup', () => {
                isDown = false;
                scrollUserList.classList.remove('active');
            });
            scrollUserList.addEventListener('mousemove', (e) => {
                if(!isDown) return;
                e.preventDefault();
                const x = e.pageX - scrollUserList.offsetLeft;
                const walk = (x - startX) * 1; //scroll-fast
                scrollUserList.scrollLeft = scrollLeft - walk;
            });
        }
    },
    created(){
        if( !Object.keys(this.conversation).length || !this.privateConvFlag){
            this.getConversation();
            this.updateOffset();
        }
    },
    mounted(){
        this.search = this.privateChatSearch;
    },
};
</script>
<style>
.at-onlineusers{
    margin: 0;
    display: flex;
    overflow: auto;
    margin: 0 -20px;
    list-style: none;
    padding: 30px 0 10px;
    height: auto !important;
    width: calc(100% + 40px);
    flex-direction: row !important;
}
.at-onlineusers::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
}
.at-onlineusers > li{
    border: 0;
    flex: none;
    display: block;
    cursor: pointer;
    max-width: 85px;
    list-style-type: none;
    padding: 0 !important;
    background: transparent;
    margin-bottom: 0 !important;
}
.at-onlineusers > li:first-child{
    margin-left: 20px;
}
.at-onlineusers > li:last-child{
    margin-right: 20px;
}
.at-onlineusers .at-userstatus{
    right: 0;
    bottom: 0;
    border: 2px solid #fff;
}
.at-onlineusers .at-userstatus:before{
    width: 8px;
    height: 8px;
}
.at-onlineusers figure{
    max-width: 50px;
    position: relative;
    margin: 0 auto !important;
}

.at-onlineusers .at-singleimg img{
    width: 50px;
    height: 50px;
}
.at-userlist_tab .at-sidebarhead_searchv2 {
    padding: 7.5px 0;
    border-bottom: 1px solid #eee;
}
.at-support-agents .at-userlist_tab .at-sidebarhead_searchv2 {
  padding: 9.5px 0;
}
.at-userlist_tab .at-sidebarhead_searchv2 .at-form-group input {
    border: 0;
    padding-left: 43px;
}
.at-admin-chat .at-sidebarhead_searchv2 .at-form-group input {
    height: 44px;
}
</style>