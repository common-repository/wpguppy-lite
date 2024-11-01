<template>
  <div>
    <!-- show block user text -->
    <div v-if="chatInfo.isBlocked && chatInfo.blockedId == userId" class="at-chatblockuser" >
      <span> {{ TRANS.you_are_blocked }} </span>
    </div>
    <!-- for unblock user -->
    <div v-else-if="chatInfo.isBlocked && chatInfo.blockedId != userId" class="at-chatblockuser" >
      <runtime-template-compiler :template="unblockButtonText" />
    </div>   
    <template v-else>
      <div class="at-replay" :class="{'at-replay_disable' : isDisabledFooter(chatInfo.chatId) }">
        <guppy-chat-quoted-messages @removeQuoteMessage="removeQuote();" v-if="quoteMessage" :quoteMsgProps="quoteMessage"/>
        <span v-html="typingUsers" class="at-typing"></span>
        <div class="at-widgetreply">
          <send-text-message :chatId="chatInfo.chatId"/>
          <a v-if="inputTypingText" @click.prevent="sendTextMessage()" href="javascript:void(0)" class="at-sendmsg-responsive" ><i class="guppy-send"></i></a>
        </div>
      </div>
    </template>
    <ul class="at-chat_sidebar_footervtwo">
        <li></li>
        <li></li>
      </ul>
  </div>
</template>
<script>
  import GuppyChatQuotedMessages from "../GuppyChatMessages/GuppyChatQuotedMessages/GuppyChatQuotedMessages.vue";
  import GuppyChatSendTextMessage from "../GuppyChatMessages/GuppyChatMessageFooter/GuppyChatSendTextMessage.vue";
  import { GUPPYCHAT_SETTINGS , GUPPYCHAT_TRANSLATION } from "../../resources/constants";
  import { mapGetters } from 'vuex';

  export default {
    name : "GuppywidgetChatBoxFooter",
    components:{
      GuppyChatQuotedMessages,
      SendTextMessage : GuppyChatSendTextMessage,
    },
    props:{
      'chatInfo':{
          type: Object,
          required : true,
          default : ()=>{
            return new Object();
          }
        },
    },
    computed:{
      inputTypingText(){
        return this.$store.getters.getMessageInput(this.chatInfo.chatId)
      },
      unblockButtonText() {
        let text        = GUPPYCHAT_TRANSLATION.blocked_user_message;
        let buttonText  = GUPPYCHAT_TRANSLATION.unblock_now;
        let button      = '<a href="javascript:;" @click.prevent="updateSelectChatId()" guppy-data-target="#blockuser">' + buttonText + " </a>";
        let updatedText = `<span>${text.replace("%Unblock%", button)}</span>`;
        return updatedText;
      },
      typingUsers(){
          let data          = this.$store.getters.typingUsersIndicatorText(this.chatInfo.chatId);
          let isTypingText    = GUPPYCHAT_TRANSLATION.is_typing
          let areTypingText   = GUPPYCHAT_TRANSLATION.are_typing
          let moreTypingText  = GUPPYCHAT_TRANSLATION.more_user_typing
          let indicator = data.indicator , typingUsers = data.typingUsers, tUsers = data.tUsers, typingText = '';
          if( tUsers ){
            if( indicator == 'isTypingText' && typingUsers ){
              typingText = `<em class="at-typing-name">${typingUsers}</em>${isTypingText}`;
            } else if( indicator == 'areTypingText' && typingUsers ){
              typingText = `<em class="at-typing-name">${typingUsers}</em>${areTypingText}`;
            } else {
              let moreText = `<em class="at-typing-name">${typingUsers}</em>${moreTypingText}`;
              typingText = moreText.replace('((user_count))', Number(tUsers)-3 )
            }
            typingText +='<em><img src="'+GUPPYCHAT_SETTINGS.typingIcon+'" alt="users typing"></em>';
          }
          return typingText
        },
        quoteMessage : function(){
          return this.$store.getters.getQuoteMessage(this.chatInfo.chatId)
        },
        quoteMessageId(){
          return this.$store.getters.getQuoteMessageId()
        },
      ...mapGetters({
        'isDisabledFooter': 'isDisabledFooter',
      }),
    },
    methods:{
      sendTextMessage(){
        let messageInputId = document.getElementById(`input-text-message-${this.chatInfo.chatId}`);
        if(messageInputId){
          messageInputId.focus();
        }
        this.$root.$emit('sendMessage', {chatId : this.chatInfo.chatId});
      },
      updateSelectChatId() {
        this.$store.commit('updateSelectedChatId', {chatId : this.chatInfo.chatId})
      },
      removeQuote(){
        this.$store.commit('removeQuote', {chatId: this.chatInfo.chatId});
      },
    }
  }
</script>
<style scoped>
  .at-floatchat_content .at-replay_msg {
    padding: 0;
}
.at-floatchat_content .at-replay_msg input {
    height: 40px;
    border-radius: 3px;
}
.at-replay_msg > a:not(.at-sendmsg) + input {
    padding-right: 60px;
}
.at-floatchat_content .at-replay_msg input {
    height: 40px;
    border-radius: 3px;
}
.at-floatchat_content .at-replay{
  display: block;
  border-top: 1px solid #DDDDDD;
  background-color: #f7f7f7;
}
.at-floatchat_content .at-replay_msg > a:not(.at-sendmsg) {
  right: 21px;
}
.at-floatchat_content .at-chat_sidebar_footer {
  position: static;
}
.at-floatchat_content .at-chat_sidebar_footer li {
  padding: 0 !important;
  width: 100% !important;
}
.at-floatchat_content .at-chat_sidebar_footer li > div{width: 100%;}
.at-floatchat_content .at-chat_sidebar_footer a {
  padding: 18px 15px;
  width: 100%;
  display: flex;
  justify-content: center;
}
.at-floatchat_content .at-chat_sidebar_footer a.active {
  color: #fff;
  background-color: #FF7300;
}
.at-chat_sidebar_footervtwo{
  background-color: var(--secguppycolor);
    position: static;
    display: flex;
    padding: 0;
    margin: 0;
    width: 100%;
}
.at-chat_sidebar_footervtwo li{
      padding: 14px 0;

}
</style>