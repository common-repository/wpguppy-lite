<template>
  <div class="at-chat_sidebarsetting">
    <div class="at-chat_sidebarsettingtitle">
      <h2>{{TRANS.settings}}</h2>
      <a href="javascript:void(0);"><i class="guppy-x"></i></a>
    </div>
    <div class="at-chat_sidebarsettingarea">
      <div v-if="!chatInfo.memberDisable && Number(chatInfo.chatType) != 3" class="at-chat_sidebarsettingcontent">
        <h4>{{TRANS.actions}}</h4>
        <a href="javascript:void(0);" @click.prevent="muteNotification()" :class="{'at-disable-btn' : notificationLoader }" > 
          {{muteChatNotify ? TRANS.unmute_conversation : TRANS.mute_conversation}}
        </a>
      </div>
      <div class="at-chat_sidebarsettingcontent" v-if="Number(chatInfo.chatType) != 3">
        <h4>{{TRANS.privacy_settings}}</h4>
        <template v-if="chatInfo.chatType == 1">
          <template v-if="chatInfo.isBlocked">
            <a v-if="chatInfo.blockedId != userId" href="javascript:void(0);" class="at-danger" guppy-data-target="#blockuser">
              {{TRANS.unblock_user}}
            </a>
          </template>
          <template v-else>
            <a href="javascript:void(0);" class="at-danger" guppy-data-target="#blockuser">
              {{TRANS.block_user}}
            </a>
          </template>
        </template>
        <a href="javascript:void(0);" class="at-danger" v-if="isAllowClearChat" guppy-data-target="#clearchat">{{TRANS.clear_chat}}</a>
      </div>
    </div>
  </div>
</template>

<script>
import RestApiManager   from "../../../resources/RestApiController";
import { mapState } from "vuex";
import {GUPPYCHAT_SETTINGS} from "../../../resources/constants";
export default {
    name : "GuppyChatSidebarSetting",
    data(){
      return {
        isloading           : false,
        notificationLoader  : false,
      }
    },
    computed: {
      muteChatNotify(){
        return this.$store.getters.muteChatNotify();
      },
      ...mapState({
      chatInfo: state => state.chatInfo,
      isAllowClearChat(){
        return GUPPYCHAT_SETTINGS.clearChatOption
      },
    }) 
    },
    methods:{
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
};
</script>
<style scoped>
.at-chat_sidebarsetting {
  flex: 0 0 300px;
  max-width: 300px;
  width: 100%;
  background: #FFFFFF;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 9999;
  transform: translateX(100%);
  transition: all 0.3s ease-in-out;
  height: 100%;
}
.at-chat_sidebarsettingopen {
  transform: translateX(0);
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.05);
}
.at-chat_sidebarsettingcontent {
  padding: 26px 30px;
}
.at-chat_sidebarsettingcontent h4 {
  letter-spacing: 0.5px;
  color: var(--terguppycolor) !important;
  line-height: 28px;
  font-size: 18px;
  margin: 0;
}
.at-chat_sidebarsettingcontent > a {
  color: var(--terguppycolor) !important;
  font: 700 16px/26px var(--primchatfont);
  letter-spacing: 0.5px;
  margin-top: 10px;
  display: block;
  transition: none;
}
.at-chat_sidebarsettingcontent > a.at-danger{
  color: #EF4444 !important;
}
.at-chat_sidebarsettingcontent .at-themeform {
  padding-top: 10px;
}
.at-chat_sidebarsettingcontent .at-btnlist {
  margin: 0;
}
.at-chat_sidebarsettingcontent .at-btnlist li {
  width: 100% !important;
  padding: 0 !important;
}
.at-chat_sidebarsettingcontent ~ .at-chat_sidebarsettingcontent {
  border-top: 1px solid #ddd;
}
.at-chat_sidebarsettingarea {
  height: calc(100vh - 91px);
  overflow-y: auto;
}
.at-gallerylistwrap{
  padding: 20px 30px;
  border-top: 1px solid #ddd;
}
.at-gallerylistwrap h4 {
    letter-spacing: 0.5px;
    color: var(--terguppycolor) !important;
    line-height: 28px;
    font-size: 18px;
    margin: 0;
}
.at-gallerylist {
  margin: -5px;
  padding: 20px 0 0;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
}
.at-gallerylist li {
  margin: 0;
  list-style: none;
  padding: 5px !important;
  width: 33.333% !important;
}

.at-gallerylist li:not(.at-loadmorecontent) a {
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
  position: relative;
  border-radius: 5px;
  min-height: 73.33px;
  max-height: 73.33px;
  border: 1px solid #DDDDDD;
  color: var(--primguppycolor);
}
.at-gallerylist li.at-loadmorecontent{
  width: 100% !important;
  margin-top: 10px;
}
.at-gallerylist li a i{
  display: inline-block;
  background: #fff;
  text-align: center;
  font-size: 24px;
}
.at-gallerylist li a img {
  max-width: 100%;
  object-fit: cover;
  border-radius: 5px;
}
.at-danger {
    color: #EF4444 !important;
}
.at-imgdownloader{
  outline: none !important;
  text-decoration: none !important;
  background-color: transparent !important;
  font: 700 16px/26px var(--primchatfont);
  letter-spacing: 0.5px;
  margin-top: 10px;
  display: inline-flex;
  vertical-align: middle;
  color: #3C57E5 !important;
  align-items: center;
}
.at-imgdownloader.at-disable-btn{
  background-color: transparent !important;
}
.at-imgdownloader .at-msgload{
  margin: 0;
  position: initial;
  display: inline-block;
  margin-right: 10px;
}
.at-imgdownloader .at-msgload i{
  border-right-color: #fff;
  display: block;
  width: 20px;
  height: 20px;
}
</style>
