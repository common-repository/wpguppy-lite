<template>
  <div class="at-floatchat" :class="floatChatClass" :id="`floatchat_${chatId}`">
    <div class="at-floatchat_content">
      <guppywidget-chat-box-header :chatInfo="chatInfo"/>
      <messages-container :chatId="chatId"/>
      <guppywidget-chat-box-footer :chatInfo="chatInfo" />
    </div>
  </div>
</template>

<script>
import GuppywidgetChatBoxHeader from "./GuppywidgetChatBoxHeader.vue";
import GuppywidgetChatBoxFooter from "./GuppywidgetChatBoxFooter.vue";
import GuppyChatMessagesContainer from "../GuppyChatMessages/GuppyChatMessages/GuppyChatMessagesContainer.vue";
export default {
  name : "GuppywidgetChatBox",
  props:['chatId'],
  components: {
    GuppywidgetChatBoxHeader,
    GuppywidgetChatBoxFooter,
    MessagesContainer : GuppyChatMessagesContainer
  },
  computed:{
    chatInfo(){
      return this.$store.getters.getChatInfo(this.chatId);
    },
    quoteMessage : function(){
      return this.$store.getters.getQuoteMessage(this.chatId)
    },
    floatChatClass : function(){
      let quoteMessage = this.$store.getters.getQuoteMessage(this.chatId);
      let replyClass = '';
      if(quoteMessage){
        replyClass = 'at-floatchat-reply';
      }
      return replyClass;
    }
  },
}
</script>