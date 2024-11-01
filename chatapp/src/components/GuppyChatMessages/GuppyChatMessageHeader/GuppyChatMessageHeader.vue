<template>
  <div class="at-userinfo">
    <div class="at-userinfo_title">
      <a href="javascript:void(0);" @click.prevent="backToTabList()" class="at-backtolist"><i class="guppy-chevron-left"></i></a>
      <figure v-if="[1,3].includes( Number(chatInfo.chatType))" class="at-userinfo_title_img">
        <img :src="chatInfo.userAvatar ? chatInfo.userAvatar : defaultAvatar" alt="profile image" />
      </figure>
      <div class="at-userinfo_title_name">
        <h3 v-if="[1,3].includes( Number(chatInfo.chatType))">{{chatInfo.userName | capitalize}}</h3>
        <span v-if="[1,3].includes( Number(chatInfo.chatType))" class="at-userstatus" :class="chatInfo.isOnline && userType == 1 ? 'online' : 'offline'">
          {{chatInfo.isOnline && userType == 1 ? TRANS.online : TRANS.offline}}
        </span>
      </div>
    </div>
    <template v-if="chatInfo && chatInfo.chatType == 1">
      <div class="at-userinfo_settings">
        <a href="javascript:void(0);"><i class="guppy-sliders"></i></a>
      </div>
      <guppy-chat-sidebar-setting />
    </template>
  </div>
</template>

<script>
import GuppyChatSidebarSetting from "./GuppyChatSidebarSetting.vue";
import { GUPPYCHAT_CONSTANTS } from "../../../resources/constants";
export default {
  name: "GuppyChatMessagesHeader",
  components: { GuppyChatSidebarSetting },
  data(){
    return {
      defaultAvatar : GUPPYCHAT_CONSTANTS.AVATAR
    }
  },
  computed:{
    chatInfo(){
      return this.$store.getters.getChatInfo();
    },
  },
  methods:{
    backToTabList(){
      let data = { isEmptyView : true, isOpenMessagesScr : false}
      this.$store.dispatch('toggleMessagesScr', data)
      this.$store.commit('updateChatInfo', {})
    }
  }
};
</script>

<style>
  .at-userinfo {
  padding: 16px 20px;
  display: flex;
  background-color: #fff;
  align-items: center;
  box-shadow: inset 0px -1px 0px #EEEEEE;
}
.at-userinfo_title {
  display: flex;
  align-items: center;
}
.at-userinfo_title_name{
  display: -ms-flexbox;
  display: flex;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
}
.at-userinfo_title_img {
  flex: none;
  margin:0 15px 0 0 !important;
  max-width: 50px;
}
.at-userinfo_title_img img {
  display: block;
  width: 100%;
  height: 50px;
  object-fit: cover;
  border-radius: 50% !important;
}
.at-userinfo_title_name h3 {
  width: 100%;
  word-break: break-word;
  margin: 0;
  font-size: 18px;
  line-height: 32px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}
.at-userinfo_title_name p{
  font-size: 14px;
  line-height: 26px;
  letter-spacing: 0.01em;
  color: #999999;
  margin: 0;
}
.at-userinfo_title_name p > span{
  display: block;
}
.at-userinfo_title_name p a{
  color: #3C57E5 !important;
  outline: none !important;
}
.at-userinfo_settings {
  margin-left: auto;
}
.at-userinfo_settings a {
  width: 42px;
  display: block;
  text-align: center;
  line-height: 57px;
  color: var(--secguppycolor);
  font-size: 24px;
  text-decoration: none;
}
.at-userinfo_settings a:hover{color: var(--secguppycolor);}
.at-userstatus {
  font-size: 14px;
  line-height: 26px;
  letter-spacing: 0.01em;
  display: inline-flex;
  vertical-align: middle;
  align-items: center;
}
.at-userstatus:before {
  margin-right: 5px;
  display: inline-block;
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.at-userstatus.online:before {
  background-color: #22C55E;
}
.at-userstatus.offline:before {
  background-color: #ddd;
}
.at-userstatus.away:before {
  background-color: #EAB308;
}
.at-userstatus.notify:before {
  background-color: #FF7300;
}
.at-backtolist{
    font-size: 22px;
    color: #000;
    margin-right: 15px;
    line-height: 0.8;
    display: none;
}
.at-chat991 .at-backtolist {
    display: block;
}
</style>