<template>
  <div class="at-replay" :class="{'at-replay_disable' : isDisabledFooter }">
    <guppy-chat-quoted-messages @removeQuoteMessage="removeQuote();" v-if="quoteMessage" :quoteMsgProps="quoteMessage"/>
    <span v-html="typingUsers" class="at-typing"></span>
    <div class="at-replay_content">
      <send-text-message />
      <template v-if="isMobileDevice">
        <a v-if="inputTypingText" @click.prevent="sendTextMessage()" href="javascript:void(0)" class="at-sendmsg-responsive" ><i class="guppy-send"></i></a>
      </template>
    </div>    
  </div>
</template>

<script>
  import { mapState } from "vuex";
  import GuppyChatQuotedMessages from "../GuppyChatQuotedMessages/GuppyChatQuotedMessages.vue"
  import { GUPPYCHAT_SETTINGS, GUPPYCHAT_TRANSLATION } from "../../../resources/constants";
  import GuppyChatManager from "../../../resources/controller";
  import GuppyChatSendTextMessage from "./GuppyChatSendTextMessage.vue";
  export default {
    name: "GuppyChatMessagesFooter",
    components : {
      GuppyChatQuotedMessages,
      SendTextMessage   : GuppyChatSendTextMessage,
    },
    props:[ 'isDisabledFooter' ],
    data(){
      return {
        uploadType          : '',
        sendingMessages     : [],
        typingIcon          : GUPPYCHAT_SETTINGS.typingIcon,
        isMobileDevice      : GUPPYCHAT_SETTINGS.isMobileDevice,
      }
    },
    computed:{ 
      inputTypingText : function(){
        return this.$store.getters.getMessageInput()
      },
      quoteMessage : function(){
        return this.$store.getters.getQuoteMessage()
      },
      quoteMessageId(){
        return this.$store.getters.getQuoteMessageId()
      },
      typingUsers(){
        let data = this.$store.getters.typingUsersIndicatorText();
        let isTypingText    = GUPPYCHAT_TRANSLATION.is_typing
        let areTypingText   = GUPPYCHAT_TRANSLATION.are_typing
        let moreTypingText  = GUPPYCHAT_TRANSLATION.more_user_typing
        let indicator = data.indicator , typingUsers = data.typingUsers, tUsers = data.tUsers, typingText = '';
        if( tUsers ){
          if( indicator == 'isTypingText' && typingUsers ){
            typingText = '<em class="at-typing-name">'+typingUsers+'</em>'+isTypingText;
          } else if( indicator == 'areTypingText' && typingUsers ){
            typingText = '<em class="at-typing-name">' + typingUsers+'</em>'+areTypingText;
          } else {
            let moreText = '<em class="at-typing-name">'+typingUsers+'</em>'+moreTypingText;
            typingText = moreText.replace('((user_count))', Number(tUsers)-3 )
          }
          typingText +='<em><img src="'+GUPPYCHAT_SETTINGS.typingIcon+'" alt="users typing"></em>';
        }
        return typingText
      },
      ...mapState({
        chatInfo : state => state.chatInfo,
    }) },
    watch:{
      chatInfo(newVal,oldVal){
        if(newVal.chatId != oldVal.chatId || newVal.chatType != oldVal.chatType){
          this.$store.commit('updateMessageInput', {text : '', chatId : newVal.chatId});
          this.removeQuote();
        }
      },
    },
    methods:{
      sendTextMessage(){
        document.getElementById(`input-text-message-${this.chatInfo.chatId}`).focus();
        this.$root.$emit('sendMessage', {chatId : this.chatInfo.chatId});
      },
      removeQuote(){
        this.$store.commit('removeQuote', { chatId : this.chatInfo.chatId } );
      },
      scrollListToBottom(scrollHeight = 0) {
        GuppyChatManager.messagesScrollList(scrollHeight, this.chatInfo.chatId);
      },
    }
    
  };
</script>

<style>
.at-replay {
  background-color: #fff;
  position: relative;
  margin-top: auto;
  padding: 20px;
}
.at-replay_content {
  display: flex;
  align-items: center;
}
.at-replay_msg {
  flex: auto;
  display: flex;
  position: relative;
  align-items: center;
}

.at-replay_msg .at-sendmsg{
  margin-left: 10px;
  border-radius: 3px;
}
.at-chat .at-replay_msg textarea.at-form-control{
  resize: none;
  height: 60px;
  max-height:100px;
  padding-top: 15px;
  padding-bottom: 15px;
  min-height: 60px !important;
}
.at-chat .at-replay_msg textarea.at-form-control::placeholder{
  overflow:hidden;
  white-space:nowrap;
  text-overflow:ellipsis;
}
.at-replay_msg > input::placeholder{
  color: var(--terguppycolor);
}
.at-replay_msg > a:not(.at-sendmsg) {
  position: absolute;
  right: 91px;
}
.at-replay_msg > a:not(.at-sendmsg) img {
  display: block;
}
.at-replay_msg > a:not(.at-sendmsg) + input {
  padding-right: 60px;
}
.at-sendmsg-responsive,
.at-replay_audio, .at-replay_upload {
  flex: none;
  position: relative;
}
.at-sendmsg-responsive{
  margin-left: 10px;
}
.at-uploadoption_open{z-index: 9999;}
.at-sendmsg-responsive:hover,
.at-replay_audio:hover > a, .at-replay_upload:hover > a {
  background: #F7F7F7;
}
.at-sendmsg-responsive,
.at-replay_audio > a, .at-replay_upload > a {
  font-size: 26px;
  color: var(--terguppycolor) !important;
  border-radius: 3px;
  line-height: 58px;
  width: 60px;
  display: block;
  text-align: center;
  border: 1px solid #ddd;
  transition: all 0.3s ease-in-out;
}
.at-sendmsg-responsive i{
  display: block;
  line-height: inherit;
}
.at-sendmsg-responsive:focus,
.at-replay_audio > a:focus,
.at-replay_upload > a:focus{
  text-decoration: none !important;
  background: transparent !important;
  outline: none !important;
}
.at-replay_audio.at-startrecording a, .at-replay_audio:focus a {
  color: #fff !important;
  background-color: var(--primguppycolor) !important;
  border-color: var(--primguppycolor);
}
.at-recorddisabled a{
  pointer-events: none;
  color: var(--terguppycolor) !important;
  background: #fff !important;
  border-color: #ddd !important;
}
.at-recorddisabled a i:before{
  content: "\e9a0";
}
.at-autoreplay {
  box-shadow: inset 0px -1px 0px #EEEEEE;
  display: flex;
  position: absolute;
  bottom: 100%;
  left: 0;
  background: #F7F7F7;
  padding-left: 20px;
  z-index: 8;
  padding-bottom: 20px;
  width: 100%;
}
.at-autoreplay span {
  cursor: pointer;
  margin: 10px;
  background: #fff;
  display: inline-block;
  padding: 6px 20px;
  border-radius: 60px;
  font-size: 15px;
  border: 1px solid #ddd;
  line-height: 26px;
  -webkit-box-shadow: 0px 2px 4px rgba(40, 41, 61, 0.04), 0px 8px 16px rgba(96, 97, 112, 0.16);
  box-shadow: 0px 2px 4px rgba(40, 41, 61, 0.04), 0px 8px 16px rgba(96, 97, 112, 0.16);
}
.at-sendmsg {
  flex: none;
  width: 60px;
  line-height: 60px;
  display: inline-block;
  background-color: var(--primguppycolor);
  text-align: center;
  font-size: 22px;
  color: #fff;
  border-radius: 0 3px 3px 0;
}
.at-sendmsg:hover, .at-sendmsg:focus {
  color: #fff;
  text-decoration: none !important;
  outline: none !important;
  background: var(--primguppycolor) !important;
}
.at-uploadoption {
    background: #fff;
    border-radius: 3px;
    overflow: hidden;
    display: none;
    position: absolute;
    bottom: 100%;
    width: 240px !important;
    z-index: 99;
    font: 500 16px/32px var(--primchatfont);
    flex-direction: column;
    -webkit-box-shadow: 0px 2px 4px rgb(40 41 61 / 4%), 0px 8px 16px rgb(96 97 112 / 16%);
    box-shadow: 0px 2px 4px rgb(40 41 61 / 4%), 0px 8px 16px rgb(96 97 112 / 16%);
    padding: 0;
    margin: 0;
}
.at-uploadoption_open .at-uploadoption{
  display: -ms-flexbox;
  display: flex;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
}
.at-uploadoption li {
  line-height: inherit;
  list-style-type: none;
  margin: 0;
  width: 100% !important;
  padding: 0 !important;
}
.at-uploadoption li:not(:last-child) {
  border-bottom: 1px solid #ddd;
}
.at-uploadoption input[type=file] {
  display: none;
}
.at-uploadoption a,
.at-uploadoption label {
  cursor: pointer;
  margin: 0;
  align-items: center;
  font-weight: 500;
  padding: 10px 20px;
  display: flex;
  font-size: 16px;
  color: var(--secguppycolor) !important;
  transition: all 0.3s ease-in-out;
}
.at-uploadoption a:hover,
.at-uploadoption label:hover {
  background-color: #F7F7F7;
}
.at-uploadoption a:focus,
.at-uploadoption label:focus {
  outline:none !important;
  text-decoration:none !important;
  text-decoration-skip-ink: none;
  background: transparent !important;
}
.at-uploadoption a i,
.at-uploadoption label i {
  color: var(--terguppycolor);
  font-size: 18px;
  width: 20px;
  display: inline-block;
  margin-right: 10px;
  text-align: center;
}
.at-replay_disable {
  pointer-events: none;
}
.at-replay_disable .at-sendmsg {
  background-color: #ddd;
}
.at-replay_disable .at-replay_audio.at-startrecording a,
.at-replay_disable .at-replay_audio:focus a {
  color: var(--terguppycolor) !important;
  background-color: #fff;
  border-color: #ddd;
}
.at-replay_disable .at-replay_msg {
  filter: grayscale(1);
}
.at-replay_audio > a{position: relative;z-index: 1;}
.at-replay_audio a:after {
  top: 50%;
  left: 50%;
  content: '';
  width: 40px;
  height: 40px;
  position: absolute;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.7);
  -webkit-animation: sonarWavea 1s linear infinite;
  animation: sonarWavea 1s linear infinite;
  z-index: -1;
  margin: -20px 0 0 -20px;
  opacity: 0;
  visibility: hidden;
}
.at-startrecording a i:before{content: "\e9b2";}
.at-startrecording a:after{
  opacity: 1;
  visibility: visible;
}
.at-typing{
  margin:0 0 10px;
  display: flex;
  align-items: center;
  font-size: 12px;
  line-height: 16px;
}
.at-typing:empty{display: none;}
.at-typing em:not(.at-typing-name){
  max-width: 20px;
  margin-left: 8px;
  display: inline-block;
}
.at-typing-name{
  margin-right: 5px;
  font-style: normal;
  color: var(--primguppycolor);
}
@keyframes sonarWavea {
  from {
    opacity: 1;
  }
  to {
    transform: scale(1.5);
    opacity: 0;
  }
}
</style>