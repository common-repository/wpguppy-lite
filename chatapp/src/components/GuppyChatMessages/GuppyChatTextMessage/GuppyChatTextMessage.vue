<template>
  <div class="at-message at-messagetext" :class="responsiveClass" :id="'message_'+messageProps.messageId">
    <span class="at-msgload" v-if="messageProps.replyMessage && !messageProps.messageId" ><i class="at-spinericon"></i></span>
    <guppy-chat-quote-message-list :messageProps="messageProps.replyMessage" v-if="messageProps.replyMessage">
     <span v-linkified>{{messageProps.message}}</span>
      <template v-slot:message_actions v-if="!disableReply">
        <guppy-chat-message-actions v-if="messageProps.messageId"
          @deleteMessageEvent="deleteMessage($event)"
          :messageProps="messageProps" 
        />
      </template>
    </guppy-chat-quote-message-list>
    <template v-else>
      <span v-linkified>{{messageProps.message}}</span>
      <template v-if="!disableReply">
        <guppy-chat-message-actions
          @deleteMessageEvent="deleteMessage($event)"
          v-if="messageProps.messageId"
          :messageProps="messageProps" 
        />
        <span class="at-msgload" v-else><i class="at-spinericon"></i></span>
      </template>
    </template>
  </div>
</template>

<script>
import GuppyChatMessageActions from "../GuppyChatMessageActions/GuppyChatMessageActions.vue";
import GuppyChatQuoteMessageList from "../GuppyChatQuotedMessages/GuppyChatQuoteMessageList.vue"
import { mapState } from "vuex";
export default {
    name : "GuppyChatTextMessage",
    components : { 
      GuppyChatMessageActions,
      GuppyChatQuoteMessageList
    },
    props : [ 'messageProps', 'disableReply' ],
    data(){
      return {
        responsiveClass :''
      }
    },
    computed:mapState({
      isMessangerChat : state => state.isMessangerChat
    }),
    methods:{
      deleteMessage( data){
        this.$emit('deleteMsgEvt', data )
      },
    },
    mounted(){
      let contentId = document.getElementById('message_'+this.messageProps.messageId);
      if(contentId){
          let contentWidth = contentId.clientWidth
          if(this.isMessangerChat){
            if(contentWidth >= 220 ){
              this.responsiveClass = 'at-chat-msg-220'
            }
          } else {
            if(contentWidth >= 270 ){
              this.responsiveClass = 'at-chat-msg-270'
            } else if(contentWidth >= 190 ){
              this.responsiveClass = 'at-chat-msg-190'
            } else if(contentWidth >= 110 ){
              this.responsiveClass = 'at-chat-msg-110'
            }
          }
        }
    }

}
</script>

<style>
.at-messages:not(.at-message_sender) .at-msgload{display: none;}
.at-msgload{
  position: absolute;
  left: -30px;
  top: 50%;
  margin-top: -10px;
}
.at-msgload i{
  width: 20px;
  height: 20px;
  border: 3px solid #ddd;
  border-right-color: #F7F7F7;
  border-radius: 50px 50px 50px 50px;
  -webkit-animation: spinericon 1s linear infinite;
  animation: spinericon 1s linear infinite;
  display: block;
  line-height: 20px;
}
.at-messages {
  width: 100%;
  float: left;
  padding: 3px 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.at-messages:last-child .at-messageoption_list {
  top: auto;
  bottom: 100%;
}
.at-message {
  max-width: 75%;
  word-break: break-word;
  position: relative;
  color: var(--secguppycolor);
  border-radius: 0px 20px 20px 20px;
  background-color: #fff;
  padding: 19px 20px;
  display: inline-block;
  margin: 0;
  font-size: 15px;
  line-height: 28px;
}
.at-message:hover .at-messageoption_btn{transform: scale(1);}
.at-messagetext{padding: 19px 44px 19px 20px;}
.at-messagetext > div:not(.at-messageoption) {
  margin-right: -24px;
}
.at-message > a{
  text-decoration: none;
  border: none;
  outline: none;
  color: #3C57E5;
}
.at-message_sender {
  align-items: flex-end;
}
.at-message_sender .at-message-qoute + .at-sendfile{float: right;}
.at-messages:last-child {
    padding-bottom: 15px;
    margin-top: auto;
}
.at-message_sender .at-message {
  border-radius: 20px 20px 0 20px;
}
.at-message_sender .at-message_time svg {
  margin-right: 7px;
}
.at-message_sender .at-message_time:before {
  font-size: 18px;
  vertical-align: middle;
  margin-right: 10px;
  content: "";
  font-family: "guppy-icomoon";
  line-height: 15px;
  display: inline-block;
}
.at-resmsg:before,
.at-seenmsg:before {
  content: "\ea1e" !important;
  font-size: 12px !important;
}

.at-seenmsg:before {
  color: #3C57E5;
}
.at-message_sender .at-messageoption_list {
  left: auto;
  right: 0;
}
.at-message-qoute + .at-messageoption{
  top: 30px;
  right: 37px;
}
.at-chat480 .at-msgload{
  left: -20px;
  margin-top: -7px;
}
.at-chat480 .at-msgload i{
  width: 14px;
  height: 14px;
}
</style>