<template>
   <div class="at-view-messages" > 
        <div v-if="loadChat && !messagesList.length" class="at-empty-conversation" >
            <div class="at-chatloader">
                <span></span><span></span><span></span><span></span><span></span
                ><span></span><span></span><span></span>
            </div>
        </div>
        <template v-if="messagesList.length">
            <div :id="'message-wrap_' + chatInfo.chatId" ref="messagesEnd" class="at-messagewrap" @scroll="scrollHandler($event)">
                <!-- message list start -->
                <template v-if="messagesLoading">
                    <div class="at-messages at-inner-loaader">
                        <span><i class="at-spinericon"></i></span>
                    </div>
                </template>
                <!-- messageList component -->
                <guppy-chat-messages-list :chatId="chatId"/>
            </div>
        </template>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import GuppyChatMessagesList from './GuppyChatMessagesList.vue';
import GuppyChatManager from "../../../resources/controller";
export default {
    name : 'GuppyChatMessagesContainer',
    components:{
        GuppyChatMessagesList
    },
    props : {
      'chatId':{
        type: String,
        required : false,
        default : ()=>{
          return null
        }
      },
      'conversationData':{
        type: Object,
        required : false,
        default : ()=>{
          return null
        }
      },
    },
    data(){
        return {
            lastScrollTop : 0,
            convData: {
                offset      : 0,
                userId      : "",
                chatType    : "",
                receiverId  : "",
                chatId      : "",
            },
        }
    },
    computed:{
        messagesList(){
            return this.$store.getters.messagesListData(this.chatId);
        },
        chatInfo(){
            return this.$store.getters.getChatInfo(this.chatId)
        },
        loadChat(){
            return this.$store.getters.loadChat(this.chatId);
        },
        messagesLoading(){
            return this.$store.getters.messageLoading(this.chatId);
        },
        ...mapState({
            isMessangerChat : (state) => state.isMessangerChat
        }),
    },
    watch:{
        conversationData(converData){
            if(converData && this.isMessangerChat){
                this.convData = converData;
            }
        },
        chatInfo(){
            GuppyChatManager.messagesScrollList( this.lastScrollTop, this.chatId);
        }
    },
    methods:{
        loadChatMessages() {
            if (this.loadChat) {
                this.$store.dispatch("UpdateMessageList", {
                    chatData: this.convData,
                    lastScrollTop: this.lastScrollTop ? this.lastScrollTop : 0,
                });
            }
        },
        scrollHandler(e) {
            let scrollTop       = e.currentTarget.scrollTop;
            let scrollHeight    = this.$refs.messagesEnd ? this.$refs.messagesEnd.scrollHeight : 0;
            this.lastScrollTop  = scrollHeight - scrollTop;
            const top           = Math.round(scrollTop) === 0;
            if (top && this.messagesList.length) {
                if ( scrollHeight > e.currentTarget.offsetHeight ) {
                    this.loadChatMessages();
                }
            }
        },
        scrollListToBottom(scrollHeight = 0) {
            GuppyChatManager.messagesScrollList(scrollHeight, this.chatInfo.chatId);
        },
        scrollListToPosition() {
            this.scrollListToBottom(this.lastScrollTop);
        },
        updateConvData(){
            let offset  = 0;
            let userId  = "", chatType = "", receiverId = "", chatId = "";
            chatType    = Number(this.chatInfo.chatType);
            chatId      = this.chatInfo.chatId;
            userId      = this.userId;
            if ( [1,3].includes(Number(this.chatInfo.chatType))) {
                receiverId  = chatId.split('_')[0];
            }
            this.convData = { offset, userId, chatType,receiverId, chatId }
        }
    },
    created(){
        if(this.isMessangerChat){
            this.convData = this.conversationData;
        } else {
            this.updateConvData();
            if(!this.messagesList.length){
                this.loadChatMessages();
            }
            GuppyChatManager.messagesScrollList( this.lastScrollTop, this.chatId);
        }
    },
}
</script>

<style scoped>
.at-messagewrap {
  display: flex;
  overflow: auto;
  min-height: 280px;
  padding: 10px 10px 0;
  flex-direction: column;
}
.at-messagewrap > div{
    margin-top: auto;
}
.at-messagewrap .at-alert {
  margin: auto;
}
.at-messagewrap .at-userbar_loader {
  background: transparent;
  position: relative;
  height: auto;
  padding: 20px 0 30px;
}
</style>