<template>
    <div class="at-replay_msg gp-replay_msg">
        <textarea 
          :id="`input-text-message-${chatInfo.chatId}`" 
          ref="messageInputRef" 
          type="text" 
          v-model="messageInput" 
          name="replay" 
          :placeholder="TRANS.type_message"
          autocomplete="off"
          :class="{'gp-form-control gp-replay_msg' : chatId == '00_4', 'at-form-control at-form-replay' : chatId != '00_4'}"
          ></textarea>
        <template v-if="!isMobileDevice">
            <a v-if="isMessangerChat" @click.prevent="sendMessage()" href="javascript:void(0)" class="at-sendmsg" ><i class="guppy-send"></i></a>
        </template>
      </div>
</template>

<script>
import { mapState } from "vuex";
import { GUPPYCHAT_SETTINGS } from "../../../resources/constants";
import GuppyChatManager from "../../../resources/controller";
import RestApiManager   from "../../../resources/RestApiController";
import jQuery from "jquery";

export default {
    name:'GuppyChatSendTextMessage',
    props : {
      'chatId':{
        type: String,
        required : false,
        default : ()=>{
          return null
        }
      },
    },
    data(){
        return {
            isMobileDevice : GUPPYCHAT_SETTINGS.isMobileDevice,
        }
    },
    computed:{
        messageInput : {
            get () {
                return this.$store.getters.getMessageInput(this.chatId)
            },
            set (value) {
                this.$store.commit('updateMessageInput', { 'text' : value, 'chatId' : this.chatId })
            }
        },
        quoteMessage(){
            return this.$store.getters.getQuoteMessage(this.chatId)
        },
        quoteMessageId(){
            return this.$store.getters.getQuoteMessageId(this.chatId)
        },
        CurrentDate: function(){
            var myDate = new Date();
            let monthsList = ['January ', 'February ', 'March ', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
            let date = myDate.getDate();
            let month = monthsList[myDate.getMonth()];
            let year = myDate.getFullYear();
            return `${month} ${date}, ${year}`;
        },
        chatInfo(){
            return this.$store.getters.getChatInfo(this.chatId)
        },
        ...mapState({
            userProfile     : state => state.userProfile,
            isMessangerChat : state => state.isMessangerChat,
            isBlockedByMe   : state => {
                return state.chatInfo.isBlocked
            }
        })
    },
    watch:{
        messageInput(value) {
        let payload = {
          userName   : this.userProfile.userName,
          chatType   : this.chatInfo.chatType,
          chatId     : this.chatInfo.chatId,
          senderId   : this.userId,
          text       : value,
        }
        this.isTyping(payload);
      }
    },
    updated() {
        this.autoHeightInput();
    },
    methods:{
        autoHeightInput(){
            let inputtextId = `#input-text-message-${this.chatInfo.chatId}`;
            var elmnt = document.getElementById(`input-text-message-${this.chatInfo.chatId}`);
            if(elmnt){
                let paddingTop = jQuery(inputtextId).css('padding-top').split('px')[0];
                let paddingBottom = jQuery(inputtextId).css('padding-bottom').split('px')[0];
                let padding = Number(paddingTop) + Number(paddingBottom);
                jQuery(inputtextId).height(0).height( elmnt.scrollHeight - padding);
                if (jQuery(inputtextId).height() >= 60) {
                    jQuery('textarea.at-form-replay').css("overflow", "auto");
                }else {
                    jQuery('textarea.at-form-replay').css("overflow", "hidden");
                }
            }
        },
        isTyping(payload){
            this.$store.dispatch('triggerclientEvents', {'event':'isTyping', payload});
        },
        setMessageInput(element) {
            this.messageInput = element.value;
        },
        sendMessage(){
            if( this.chatId == '00_4' ){
                this.openWhatsappChat()
            } else {
                this.sendTextMessage()
            }
        },
        openWhatsappChat(){
            window.open(`https://wa.me/${this.chatInfo.userContact}?text=${this.messageInput}`, '_blank');
        },
        async sendTextMessage(){
            let data = {
                receiverId    : [1,3].includes(Number(this.chatInfo.chatType)) ? this.chatInfo.chatId.split('_')[0] : '',
                userId        : this.userId,
                chatId        : this.chatInfo.chatId,
                chatType      : Number(this.chatInfo.chatType),
                message       : this.messageInput,
                isSender      : true,
                replyTo       : '',
                latitude      : '',
                longitude     : '',
                messageType   : 0,
                messageStatus : 0,
                replyId       : this.quoteMessageId,
                timeStamp     : Math.floor(new Date().getTime()/1000),
                userType      : this.userType,
                messageSentTime : this.CurrentDate,
                metaData        : { randNum       : Math.floor(Math.random() * 999999999) },
            }

            if( this.messageInput ) {
                if( this.quoteMessage ) {
                    data["replyMessage"] = this.quoteMessage;
                }

                this.$store.commit("appendMessage", data);
                this.$store.commit('removeQuote', {chatId : this.chatInfo.chatId});
                this.scrollListToBottom();

                this.$store.commit('updateMessageInput', { 'text' : '', 'chatId' : this.chatInfo.chatId });
                let messageInputId = document.getElementById(`input-text-message-${this.chatInfo.chatId}`);
                if(messageInputId){
                    messageInputId.focus();
                }
                let response = await RestApiManager.sendMessage(data, this.chatInfo.chatId);
                if(response.type == 'error'){
                    this.alertBox('error', this.TRANS.error_title, response.message_desc)
                }
            }
        },
        scrollListToBottom(scrollHeight = 0) {
            GuppyChatManager.messagesScrollList(scrollHeight, this.chatInfo.chatId);
        },
    },
    mounted(){
        const ele = document.getElementById(`input-text-message-${this.chatInfo.chatId}`);
        let _this = this;
        ele.addEventListener('keydown', function (e) {
        let keyCode = e.which || e.keyCode;
            if (keyCode === 13 && !e.shiftKey) {
                e.preventDefault();
                _this.sendMessage();
            }
        });

        this.$root.$on('sendMessage', (data)=>{
            if(data.chatId == this.chatInfo.chatId){
                this.sendTextMessage()
            }
        });
        this.$root.$on('openWhatsapp', (data)=>{
            if(data.chatId == this.chatInfo.chatId){
                this.openWhatsappChat()
            }
        })
    }
}
</script>

<style>

</style>