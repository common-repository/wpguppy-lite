<template>
  <div class="at-messageoption">
    <a href="javascript:void(0);" class="at-messageoption_btn" ><i class="guppy-chevron-down"></i></a>
    <ul class="at-messageoption_list">
      <li>
        <a href="javascript:void(0);" @click="quoteMessage()"><i class="guppy-message-circle"></i>
        {{TRANS.reply_message}}</a>
      </li>
      <li v-if="messageProps.chatType == 1 && messageProps.isSender && Number(messageProps.messageStatus) == 0 && enableDeleteMessage" @click.prevent="deleteMessage()">
        <a href="javascript:void(0);" :class="{'at-disable-btn': isSending }">
          <i v-if="!isSending" class="guppy-trash"></i>{{TRANS.delete}}
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import jQuery from 'jquery';
import {GUPPYCHAT_SETTINGS} from "../../../resources/constants";
export default {
    name : "GuppyChatTextMessageAction",
    props : {
      'messageProps':{
        type: Object,
        required : true,
        default : ()=>{
          return {
            isSender : true,
            messageStatus : 0
          }
        }
      },
    },
    data(){
      return {
        isSending : false,
        isDownloading : false,
      }
    },
    computed:{
      disableDeleteMessage:function(){
        let data = this.messageProps;
        if(data.chatType == 2 ){
          if( 'messageSeenIds' in data ) {
            if(data.messageSeenIds){
              return data.messageSeenIds.length ? false : true
            }
          }
        }
        return true
      },
      enableDeleteMessage(){
        return GUPPYCHAT_SETTINGS.deleteMessageOption
      }
    },
    methods:{
      deleteMessage(){
        if(!this.isSending) {
          this.isSending = true;
          let data ={
            userId    : this.userId,
            messageId : this.messageProps.messageId,
          }
          this.axios.post('delete-guppy-message', data).then(response =>{
            this.isSending = false;
            if(response.data.type == 'success'){
              jQuery('.at-messageoption_open').removeClass("at-messageoption_open");
              this.$emit('deleteMessageEvent', response.data.messageId);
              let userId = this.userId;
              let receiverId = response.data.receiverId;
              let payload = {
                chatId          : response.data.chatId,
                chatType        : response.data.chatType,
                messageId       : response.data.messageId,
                receiverId,      
                userId,
              }
              this.$store.dispatch('triggerSocketEvents', {'event':'deleteMessage', payload});
            } else if( response.data.type == "error" ) {
              this.alertBox('error', this.TRANS.error_title, response.data.message_desc);
            }
          }).catch(errors => {
            this.isSending = false;
            this.errors = errors;
          });
        }
      },
      quoteMessage(){
        jQuery('.at-messageoption_open').removeClass("at-messageoption_open");
        this.$store.commit('updateQuoteMessageId', {chatId : this.messageProps.chatId, messageId : this.messageProps.messageId});
      }
    },
};
</script>

<style>
.at-messageoption {
  top: 10px;
  right: 18px;
  position: absolute;
  transform: scale(0);
  transition: all 0.3s ease-in-out;
}
.at-messageoption.at-messageoption_open,
.at-message:hover .at-messageoption{
  transform: scale(1);
}
.at-messageoption_btn {
  display: block;
  font-size: 18px;
  color: var(--terguppycolor);
  transition: all 0.3s ease-in-out;
}
.at-messageoption_btn:focus,
.at-messageoption_btn:hover {
  color: var(--terguppycolor);
  text-decoration: none !important;
  background: transparent !important;
  outline: none !important;
}
.at-messageoption_open .at-messageoption_list {
  display: block;
}
.at-messageoption_list {
  padding: 0;
  background: #fff;
  border-radius: 3px;
  overflow: hidden;
  display: none;
  position: absolute;
  top: 100%;
  width: 240px !important;
  z-index: 99;
  left: 0;
  font: 500 16px/32px var(--primchatfont);
  flex-direction: column;
  -webkit-box-shadow: 0px 2px 4px rgb(40 41 61 / 4%), 0px 8px 16px rgb(96 97 112 / 16%);
    box-shadow: 0px 2px 4px rgb(40 41 61 / 4%), 0px 8px 16px rgb(96 97 112 / 16%);
    margin: 0;
}
.at-messageoption_list li {
  line-height: inherit;
  list-style-type: none;
  margin: 0;
  padding: 0 !important;
  width: 100% !important;
}
.at-messageoption_list li:not(:last-child){
  border-bottom: 1px solid #ddd;
}
.at-messageoption_list a {
  cursor: pointer;
  margin: 0;
  align-items: center;
  font-weight: 500;
  padding: 10px 20px;
  display: flex;
  color: var(--secguppycolor);
  transition: all 0.3s ease-in-out;
  outline: none !important;
  background: #fff !important;
  text-decoration: none !important;
}
.at-messageoption_list a:hover {
  background-color: #F7F7F7 !important;
}
.at-messageoption_list a i {
  color: var(--terguppycolor);
  font-size: 18px;
  width: 20px;
  display: inline-block;
  margin-right: 10px;
  text-align: center;
}
</style>