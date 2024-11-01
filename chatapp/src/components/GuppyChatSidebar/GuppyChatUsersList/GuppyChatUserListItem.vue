<template>
  <li class="at-userbar" :id="userProps.chatId + '_' + Math.floor(Math.random() * 99999999)">
    <figure class="at-userbar_profile">
      <span class="at-userstatus" :class="userProps.isOnline ? 'online' : 'offline'"></span>
      <img :src="userProps.userAvatar ? userProps.userAvatar : defaultAvatar" :alt="userProps.userName" />
    </figure>
    <div v-if="userProps.userName" class="at-userbar_title">
      <h3>{{ userProps.userName | capitalize}}</h3>
    </div>
    <div class="at-userbar_right">
      <!-- for atuo start chat invite button -->
      <a v-if=" tab == 'contacts' && autoInvite" class="at-btn-sm at-linebtn" :class="{'at-disable-btn' : isLoading }" href="javascript:void(0);" @click.prevent="updateUserStatus(1)"> {{TRANS.start_chat_txt}} </a>
      <a v-else href="javascript:void(0);" @click.prevent="updateUserStatus(0)" class="at-btn-sm" 
        :class=" 
          isLoading ? 'at-disable-btn' :
          userProps.statusText == 'sent'    ? 'at-sendbtn' : 
          userProps.statusText == 'respond' ? '' : 
          userProps.statusText == 'resend'  ? 'at-btn-resend' : 
          userProps.statusText == 'invite'  ? 'at-btn-link' : ''" >
          {{StatusText[userProps.statusText]}}
          <i v-if="userProps.statusText == 'invite'" class="guppy-plus"></i>
          <i v-else-if="userProps.statusText == 'sent'" class="guppy-check"></i>
          <span class="at-infotolltip" v-if="userProps.statusText == 'resend' ">
            <i class="guppy-info"></i><em>{{TRANS.decline_user}}</em>
          </span>
      </a>
    </div>
  </li>
</template>

<script>
import { GUPPYCHAT_CONSTANTS, GUPPYCHAT_SETTINGS } from "../../../resources/constants";
import GuppyChatManager from "../../../resources/controller";
import { mapState } from 'vuex';

export default {
    name : "GuppyChatUserListItem",
    props: ['userProps', 'tab'],
    data(){
      return {
        defaultAvatar : GUPPYCHAT_CONSTANTS.AVATAR,
        isDisabled  : false,
        userStatusClass : '',
        oldVal : ''
      }
    },
    computed :{ ...mapState({
      autoInvite: state => state.autoInvite,
      isMessangerChat: state => state.isMessangerChat,
      }),
    },
    methods:{
      async updateUserStatus(startChat){
        if( this.userProps.statusText == 'respond' && !startChat){
          this.$store.dispatch('userResponse', this.userProps);
          if(!this.isMessangerChat){
            this.$root.$emit('openPopUp', { type : 'acceptInvite' });
          }
        } else {
          let data = {
            'sendTo'       : this.userProps.chatId.split('_')[0],
            'userId'       : this.userId,
            'startChat'    : startChat
          }
          this.isLoading = true;
          let response = await GuppyChatManager.sendGuppyInvite(data);
          if(response){
            this.isLoading = false;
            if( response.data.type == "success" ) {
              let friendData = response.data.friendData;
              
              if(friendData.chatId in this.$store.state.requestList){
                this.$store.commit('deleteRecord', {recordList : 'requestList', key : friendData.chatId})
              }
              if(response.data.autoInvite){
                if(!GUPPYCHAT_SETTINGS.pusherEnable && !GUPPYCHAT_SETTINGS.socketEnable){
                  this.$store.commit('startChat', { friendData: response.data.friendData, messagelistData : response.data.messagelistData } );
                } else {
                  if(startChat){
                    this.$store.commit('removeContactListItem', {chatId : this.userProps.chatId } );
                  }
                }
              }
              this.userProps.statusText = 'sent';
              this.userStatusClass      = 'at-disabled';
              this.isDisabled = true;
            } else if( response.data.type == "error" ) {
              this.alertBox('error', this.TRANS.error_title, response.data.message_desc);
            }
          }
        }
      }
    }
};
</script>

<style>
.at-userbar {
  padding: 14px 20px !important;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
}
.at-userbar.active .at-userbar_profile,
.at-userbar:hover .at-userbar_profile{background-color: unset;}
.at-userbar.active,
.at-userbar:hover {
  background: #F7F8FC;
}
.at-userbar_profile {
  flex: none;
  width: 100%;
  max-width: 40px;
  height: 40px;
  border-radius: 50px;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7f7f7;
  transition: all 0.3s ease-in-out;
  position: relative;
}
.at-userbar_profile .at-userstatus{
  right: 0;
  bottom: 0;
  z-index: 0;
  position: absolute;
}
.at-userbar_profile .at-userstatus:before{
  margin: 0;
  width: 8px;
  height: 8px;
  outline: 2px solid #fff;
}
.at-userbar.active .at-userbar_profile .at-userstatus:before,
.at-userbar:hover .at-userbar_profile .at-userstatus:before{
  border-color: #f7f7f7;  
}
.at-userbar_profile .at-userstatus:before{background: #DDDDDD;}
.at-userbar_profile img {
  width: 100%;
  margin: 0 auto;
  height: 44px;
  display: block;
  object-fit: cover;
  border-radius: 50px !important;
}
.at-userbar_profile + .at-userbar_title{
  margin-left: 12px;
}
.at-userbar_title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.at-userbar_title h3 {
    font-size: 16px;
    line-height: 21px;
    white-space: nowrap;
    overflow: hidden;
    margin: 0;
    text-overflow: ellipsis;
    font-weight: 600 !important;
}
.at-chat_previewfloat .at-userbar_title h3 {
    font-size: 15px;
    line-height: 21px;
}
.at-userbar_title span {
  font-size: 14px;
  line-height: 22px;
  display: block;
  letter-spacing: 0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.at-userbar_title span i {
  font-size: 16px;
  color: var(--terguppycolor);
  margin-right: 5px;
  line-height: 22px;
  display: inline-block;
  vertical-align: middle;
}
.at-userbar_right {
  display: inline-flex;
  text-align: right;
  margin-left: auto;
  flex: none;
  padding-left: 10px;
  margin-top: 1px;
}
.at-userbar_right em {
  margin-left:8px;
}
.at-userbar_right a{text-decoration: none !important;}
.at-userbar_right > span {
  display: block;
  font-size: 13px;
  line-height: 22px;
  color: var(--terguppycolor);
}
.at-userbar:hover .at-disabled {
  background-color: #fff;
}

</style>