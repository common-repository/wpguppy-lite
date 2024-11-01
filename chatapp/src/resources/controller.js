import dateFormat from "dateformat";

import { GUPPYCHAT_CONSTANTS,GUPPYCHAT_SETTINGS } from "../resources/constants"
import moment from "moment";
import Vue from 'vue';
import store from '../vuex/store.js';
export default class GuppyChatManager {
  userId      = store.state.userId;
  static async updateUserStatus( data ) {
    try {
      let response =  await Vue.axios.post('update-user-status', data);
      if(response.data.type =="success"){
        let userData = JSON.parse(JSON.stringify(response.data.userData));
        if(data.statusType == 4 || data.statusType == 3){
          userData['senderUserName']            = store.state.userProfile.userName
          userData['senderUserAvatar']          = store.state.userProfile.userAvatar
          userData['receiverMuteNotification']  = data.muteNotification
          let payload = { userData }
          store.dispatch('triggerSocketEvents', {'event':'updateUser', payload});
        }
      }
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  static async sendGuppyInvite(data){
    try {
      let response =  await Vue.axios.post('send-guppy-invite', data);
      if(response.data.type =="success"){
        if( response.data.autoInvite 
            && response.data.messagelistData 
            && response.data.friendData 
            && response.data.resendRequest ){
          store.commit('startChat', {friendData: response.data.friendData, messagelistData : response.data.messagelistData});
        }
        if(response.data.messagelistData && response.data.chatData){
          let messagelistData = JSON.parse(JSON.stringify(response.data.messagelistData));
          let chatData        = JSON.parse(JSON.stringify(response.data.chatData));
          let userName        = response.data.userName;
          let userAvatar      = response.data.userAvatar;
          let chatType        = response.data.chatData.chatType;
          let userId          = 0;
          let payload = { chatData, messagelistData, userName, userAvatar, userId, chatType }
          store.dispatch('triggerSocketEvents', {'event':'sendMessage', payload});
        }
      }
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  }
  static async getMessangerChatInfo(data){
    try {
      let response =  await Vue.axios.get('get-messenger-chat-info?chatType='+data.chatType+'&chatId='+data.chatId+'&userId='+data.userId);
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  static getMessageTime(messageTimeStamp) {
    let dateTime = null;
    if( messageTimeStamp ){
        dateTime = dateFormat(new Date( messageTimeStamp * 1000), "h:MM tt");
    }
    return dateTime;
  }

  static getLongDateTime(timeStamp){
    let   timestamp         = null;
    const messageTimestamp  = new Date( timeStamp * 1000);
    var currentMessageDate = moment(messageTimestamp); 
    var today = moment().endOf('day');
    let dateDifference = today.diff(currentMessageDate, 'days');
    if(dateDifference == 0){
      timestamp = dateFormat(messageTimestamp, "h:MM tt");
    } else if( dateDifference == 1 ) {
      timestamp = GUPPYCHAT_CONSTANTS.YESTERDAY;
    } else if( dateDifference > 1 && dateDifference < 7) {
      timestamp = dateFormat(messageTimestamp, "ddd");
    } else {
      timestamp = new Date( timeStamp * 1000).toLocaleDateString();
    }
    return timestamp;
  }

  static updateSeenMessagesCounter(data){
    Vue.axios.post("update-guppy-message",data).then((response) => {
      if( response.data.type == 'success'){
        if( [1,3].includes( Number(response.data.chatType) ) ){
          if(Object.keys(response.data.messageIds).length){
            let payload = {
              senderId          : response.data.senderId,
              chatId            : response.data.chatId,
              messageIds        : response.data.messageIds,
              messageCounter    : response.data.messageCounter,
              chatType          : response.data.chatType
            }
            store.dispatch('triggerSocketEvents', {'event':'updateMsgStatus', payload});
          }
        }
      } else if( response.data.type == "error" ) {
        this.alertBox('error', this.TRANS.error_title, response.data.message_desc);
      } 
    }).catch((errors) => {
      console.log(errors);
    });
  }
    
  static validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  static messagesScrollList(scrollHeight = 0, chatId ) {
    Vue.nextTick(() => {
      let containerId= document.getElementById('message-wrap_' + chatId);
      if (containerId) {
        containerId.scrollTop = containerId.scrollHeight - scrollHeight;
      }
    });
  }

  static playNotificationBell(){
    let bellSrc = GUPPYCHAT_SETTINGS.notificationBellUrl;
    var audio = document.createElement("audio");
    audio.autoplay = true;
    audio.load()
    audio.addEventListener("load", ()=> { audio.play(); }, true);
    audio.src = bellSrc;
  }
}
