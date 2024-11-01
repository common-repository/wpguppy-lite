<template>
  <div class="at-floatchat_title">
    <figure v-if="[1,3].includes(Number(chatInfo.chatType))" class="at-singleimg">
      <img :src="chatInfo.userAvatar ? chatInfo.userAvatar : defaultAvatar" alt="profile image" />
      <span class="at-userstatus" :class="chatInfo.isOnline && userType == 1 ? 'online' : 'offline'"></span>
    </figure>
    <h2><em>{{title}}</em></h2>
    <div class="at-floatchat_title-right">
      <div class="at-floatchatdropdownholder">
        <a href="javascript:void(0);" class="at-floatchatdrop" v-click-outside="closeMenu" @click.prevent="toggleMenu()"><i class="guppy-chevron-down"></i></a>
        <div class="at-floatchatdropdown" :id="`dropdown_${chatId}`" style="display:none">
          <div class="at-chat_sidebarsettingcontent at-openmsg">
            <a :href="messangerPage" target="_blank"><i class="guppy-external-link"></i>{{TRANS.open_in_messenger}}</a>
          </div>
          <template v-if="chatInfo.chatType == 1" >
            <div class="at-chat_sidebarsettingcontent">
              <h4>{{TRANS.actions}}</h4>
              <a href="javascript:void(0);" @click.prevent="muteNotification()" :class="{'at-disable-btn' : notificationLoader }" > 
                {{muteChatNotify ? TRANS.unmute_conversation : TRANS.mute_conversation}}
              </a>
            </div>
            <div class="at-chat_sidebarsettingcontent">
              <h4>{{TRANS.privacy_settings}}</h4>
              <template>
                <template v-if="chatInfo.isBlocked">
                  <a v-if="chatInfo.blockedId != userId" href="javascript:void(0);" class="at-danger" @click.prevent="updateSelectChatId()" guppy-data-target="#blockuser">
                    {{TRANS.unblock_user}}
                  </a>
                </template>
                <template v-else>  
                  <a href="javascript:void(0);" @click.prevent="updateSelectChatId()" class="at-danger" guppy-data-target="#blockuser">
                    {{TRANS.block_user}}
                  </a>
                </template>
              </template>
              <a href="javascript:void(0);" v-if="isAllowClearChat" class="at-danger" guppy-data-target="#clearchat" @click.prevent="updateSelectChatId()">
                {{TRANS.clear_chat}}
              </a>
            </div>
          </template>
        </div>
      </div>
      <a href="javascript:void(0);" class="at-minimize" v-if="!isMobileView" @click.prevent="minimizeWidgetChatbox()"><i class="guppy-minus" :id="'guppy-minus'+chatId"></i></a>
      <a href="javascript:void(0);" class="at-removechat"><i class="guppy-x" @click.prevent="closeWidgetChatbox()" ></i></a>
    </div>
  </div>
</template>

<script>
import jQuery from 'jquery';
import { GUPPYCHAT_SETTINGS, GUPPYCHAT_CONSTANTS } from "../../resources/constants";
import RestApiManager from "../../resources/RestApiController";
import { mapState } from "vuex"
export default {
  name : "GuppywidgetChatBoxHeader",
  props:['chatInfo'],
  data(){
    return {
      chatId              : this.chatInfo.chatId,
      notificationLoader  : false,
      defaultAvatar       : GUPPYCHAT_CONSTANTS.AVATAR,
      messangerPage       : GUPPYCHAT_SETTINGS.messangerPage !='' ?  GUPPYCHAT_SETTINGS.messangerPage+GUPPYCHAT_SETTINGS.messangerPageSeprator+'chat_type='+this.chatInfo.chatType+'&chat_id='+this.chatInfo.chatId+'&type=messanger' : window.location.href,
    }
  },
  computed:{
    ...mapState({
      isMobileView : state => state.isMobileView
    }),
    muteChatNotify(){
      return this.$store.getters.muteChatNotify(this.chatId);
    },
    title(){
      if ( [1,3].includes( Number(this.chatInfo.chatType)) ){
        return this.chatInfo.userName
      }
      return '';
    },
    isAllowClearChat(){
      return GUPPYCHAT_SETTINGS.clearChatOption
    },
  },
  methods:{
    updateSelectChatId() {
      this.$store.commit('updateSelectedChatId', {chatId : this.chatInfo.chatId})
      this.toggleMenu();
    },
    closeWidgetChatbox(){
      jQuery(`#floatchat_${this.chatId}`).addClass('at-minimizefloatchat');
      this.$store.commit('closeWidgetChatbox', {chatId: this.chatId })
    },
    minimizeWidgetChatbox(){
      jQuery('#guppy-minus'+this.chatId).parents('.at-floatchat').addClass('at-minimizefloatchat');
      this.$store.commit('minimizeWidgetChatbox', {chatId: this.chatId, isMinimize:true });
      if(this.userType == 0){
        this.$root.$emit('toggleSignInWindow', false)
      }
    },
    toggleMenu(){
      jQuery(`#dropdown_${this.chatId}`).slideToggle();
    },
    closeMenu(){
      jQuery(`#dropdown_${this.chatId}`).slideUp();
    },
    async muteNotification(){
        let actionTo = this.chatInfo.chatId.split('_')[0];
				let data = {
					muteType    : 0,
					userId      : this.userId,
					chatId      : this.chatInfo.chatId,
					chatType    : this.chatInfo.chatType,
          actionTo    : actionTo,
				}
				this.notificationLoader = true;
        let response = await RestApiManager.muteNotification(data);
        this.notificationLoader = false;
        if( response.data.type == 'error'){
          this.alertBox('error', this.TRANS.error_title, response.data.desc)
        }
			}
  },

}
</script>