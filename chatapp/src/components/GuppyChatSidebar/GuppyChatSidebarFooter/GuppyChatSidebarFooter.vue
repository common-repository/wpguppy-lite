<template>
  <ul class="at-chat_sidebar_footer" v-click-outside="closeMenu" @mouseover="toggleOverLay(true)" @mouseleave="toggleOverLay(false)">
     <li class="at-listonrespon" v-if="isShowButton">
       <div class="at-responmenu">
          <div class="at-responsivelist">
              <a href="javascript:void(0);" v-if="isMessangerChat && isShowButton && isfloatingChat" @click.prevent="showWidget()" ><i class="guppy-x"></i></a>
              <a class="at-menuicon" @click.prevent="toogleMenu()" href="javascript:void(0);"><i class="guppy-menu"></i></a>
          </div>
          <div class="at-imgresponsivearea">
             <a href="javascript:void(0);">
                <img :src="userProfile.userAvatar ? userProfile.userAvatar : defaultAvatar" :alt="userProfile.userName">
              </a>
              <div class="at-sidebar-item">
                <h5 :style="!isfloatingChat && windowWidth <= 768 ? 'width : 100px' : ''">{{userProfile.userName}}</h5>
              </div>
          </div>
       </div>
    </li> 

    <li class="at-hasimage" v-if="!isShowButton"> 
      <a href="javascript:void(0);">
        <img :src="userProfile.userAvatar ? userProfile.userAvatar :  defaultAvatar" :alt="userProfile.userName">
        <div v-if="userProfile.userName" class="at-sidebar-item">
              <h5>{{userProfile.userName}}</h5>
          </div>
        </a>
    </li>
    <template v-if="userId && Number(userType)">
      <li @click.prevent="closeMenu()" :class="{ 'active' : selectedActiveTab == 'contacts'}" v-if="enableTabs.includes('contacts')">
        <a href="javascript:void(0);" id="at-contacts" @click.prevent="activeTab('contacts')" :class="{'at-newnotify': requestCount > 0 }">
          <i class="guppy-users"></i>
          <div class="at-sidebar-item">
              <h6>{{TRANS.contact_tab_txt}}</h6>
              <em class="at-userchat_tab-noti" v-if="requestCount > 0">{{ requestCount >= 100 ? '+99' : requestCount }}</em>
          </div>
        </a>
      </li>
      <li @click.prevent="closeMenu()" :class="{ 'active' : selectedActiveTab == 'friends'}" v-if="enableTabs.includes('friends')">
        <a href="javascript:void(0);" id="at-friends" @click.prevent="activeTab('friends')">
          <i class="guppy-user-check"></i>
          <div class="at-sidebar-item">
              <h6>{{TRANS.friend_tab_txt}}</h6>
          </div>
        </a>
      </li>
      <li @click.prevent="closeMenu()" :class="{ 'active' : selectedActiveTab == 'blocked'}" v-if="enableTabs.includes('blocked')">
        <a href="javascript:void(0);" id="at-blocked-users" @click.prevent="activeTab('blocked')">
          <i class="guppy-user-x"></i>
          <div class="at-sidebar-item">
              <h6>{{TRANS.block_tab_txt}}</h6>
          </div>
        </a>
      </li>
      <li @click.prevent="closeMenu()" :class="{ 'active' : selectedActiveTab == 'messages'}" v-if="enableTabs.includes('messages') || enableTabs.includes('messages')">
        <a href="javascript:void(0);" id="at-messages" @click.prevent="activeTab('messages')" :class="{'at-newnotify': privateChatCount > 0 }">
          <i class="guppy-message-square"></i>
          <div class="at-sidebar-item">
              <h6>{{TRANS.private_tab_txt}}</h6>
              <em class="at-userchat_tab-noti" v-if="privateChatCount > 0">{{ privateChatCount >= 100 ? '+99' : privateChatCount}}</em>
          </div>
        </a>
      </li>
      <li @click.prevent="closeMenu()" :class="{ 'active' : selectedActiveTab == 'customer_support'}" v-if="enableTabs.includes('customer_support')">
        <a href="javascript:void(0);" id="at-customer_support" @click.prevent="activeTab('customer_support')" :class="{'at-newnotify': adminSupportChatCount > 0 }" >
          <guppy-svg-icons ImageColor="support" :isActive="selectedActiveTab == 'customer_support'"/>
          <div class="at-sidebar-item">
              <h6>{{TRANS.customer_tab_txt}}</h6>
              <em class="at-userchat_tab-noti" v-if="adminSupportChatCount > 0">{{ adminSupportChatCount >= 100 ? '+99' : adminSupportChatCount}}</em>
          </div>
        </a>
      </li>
      <li @click.prevent="closeMenu(), activeTab('profile')" :class="{ 'active' : selectedActiveTab == 'profile'}">
        <a href="javascript:void(0);">
            <i class="guppy-settings"></i>
          <div class="at-sidebar-item">
              <h6>{{TRANS.setting_tab_txt}}</h6>
          </div>
        </a>
      </li>
    </template>
    <template v-else-if="!Number(userType)">
      <li class="active" @click.prevent="closeMenu()">
        <a href="javascript:void(0);" id="at-customer_support" @click.prevent="activeTab('customer_support')" :class="{'at-newnotify': adminSupportChatCount > 0 }" >
          <guppy-svg-icons ImageColor="support" :isActive="true"/>
          <div class="at-sidebar-item">
              <h6>{{TRANS.customer_tab_txt}}</h6>
              <em class="at-userchat_tab-noti" v-if="adminSupportChatCount > 0">{{ adminSupportChatCount >= 100 ? '+99' : adminSupportChatCount}}</em>
          </div>
        </a>
      </li>
      <li v-if="isfloatingChat" @click.prevent="closeMenu()">
        <a href="javascript:void(0);" id="at-login" @click.prevent="login()" >
          <i class="guppy-log-in"></i>
          <div class="at-sidebar-item">
              <h6>{{TRANS.login_tab_txt}}</h6>
          </div>
        </a>
      </li>
    </template>
  </ul>
</template>

<script>

import { mapState } from 'vuex';
import { GUPPYCHAT_SETTINGS, GUPPYCHAT_CONSTANTS } from '../../../resources/constants';
import GuppySvgIcons from "../../EmptyViews/GuppySvgIcons.vue";
import jQuery from 'jquery';
export default {
  components: { GuppySvgIcons },
  name: "GuppyChatSidebarFooter",
  data(){
    return{
      isMobileDevice: GUPPYCHAT_SETTINGS.isMobileDevice,
      defaultAvatar : GUPPYCHAT_CONSTANTS.AVATAR,
      toggleMenue   : false,
    }
  },
  computed :mapState({
    privateChatCount      : state => state.privateChatCount,
    userProfile           : state => state.userProfile,
    requestCount          : state => state.requestCount,
    adminSupportChatCount  : state => state.adminSupportChatCount,
    selectedActiveTab     : state => state.activeTab,
    enableTabs : function() {
      if(GUPPYCHAT_SETTINGS){
        return GUPPYCHAT_SETTINGS.enabledTabs
      }
      return [];
    },
    defaultActiveTab : function(){
      if(GUPPYCHAT_SETTINGS){
        return GUPPYCHAT_SETTINGS.defaultActiveTab;
      }
      return '';
    },
    isMessangerChat : state => state.isMessangerChat,
    isfloatingChat  : state => state.isfloatingChat,
    windowWidth     : state => state.windowWidth,
    isShowButton    : state => { 
      if(state.windowWidth <= 768){
        return true;
      }
      return false
    }
  }),
  methods:{
    login(){
      this.$root.$emit('toggleSignInWindow', true);
      if(this.isfloatingChat && this.windowWidth < 768 ){
        this.$root.$emit('showWidget')
      }
    },
    toogleMenu(){
      this.toggleMenue = !this.toggleMenue
      let targetClass = '.at-chat_sidebar_footer';
      let applyClass = 'at-sidebarshow';
      if(this.toggleMenue){
        jQuery(targetClass).addClass(applyClass);
      } else {
        jQuery(targetClass).removeClass(applyClass);
      }
      this.toggleOverLay(this.toggleMenue, true)
    },
    closeMenu(){
      jQuery('.at-chat_sidebar_footer').removeClass('at-sidebarshow');
      jQuery('.at-chat_sidebar').removeClass('at-ovelay');
      this.toggleMenue = false;
    },
    toggleOverLay(toggle, openMenu = false){
      if(this.windowWidth >= 768 || openMenu ){
        let targetClass = '.at-chat_sidebar';
        let applyClass = 'at-ovelay';
        let sibebarWidth = this.isfloatingChat ? '60px' : '70px';
        if(toggle){
          jQuery('ul.at-chat_sidebar_footer').css('width','270px')
          jQuery(targetClass).addClass(applyClass);
        } else {
          jQuery('ul.at-chat_sidebar_footer').css('width',sibebarWidth)
          jQuery(targetClass).removeClass(applyClass);
        }
      }
    },
    activeTab(data){
      this.$store.commit('selectTab', data);
    },
    showWidget(){
      this.$root.$emit('showWidget');
    },
  },
};
</script>

<style scoped>
.at-chat_sidebar_footer {
  bottom: 0;
  margin: 0;
  padding: 0;
  z-index: 9;
  width: 70px;
  height: 100%;
  overflow: auto;
  overflow-x: hidden;
  line-height: 30px;
  position: absolute;
  display: inline-flex;
  flex-direction: column;
  background-color: #fff;
  justify-content: flex-start;
  border-right: 1px solid #eee;
  transition: width 0.5s ease;
}
.at-chat .at-chat_sidebar_footer{scrollbar-width: none;}
.at-chat_sidebar_footer:hover{
    width: 270px;

}
.at-chat_sidebar_footer:hover .at-sidebar-item{ 
  visibility: visible;
  opacity: 1;
  z-index: 1;
}
/* Sidebar */
.at-sidebar-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 20px 20px 0;
    border-left: 0;max-width: 200px;
    width: 200px;
    visibility: hidden;
    position: absolute;
    left: 60px;
    opacity: 0;
    transition: all 0.4s ease-in-out;
    z-index: -1;
}
.at-sidebar-item h6 {
    display: inline-flex;
    font-size: 16px;
    line-height: 19px;
    font-weight: 600 !important;
    text-transform: inherit !important;
    letter-spacing: 0.5px;
    margin: 0;
}
.at-sidebar-item h5  {
  margin: 0;
  text-transform: capitalize;
  font-size: 18px;
  line-height: 22px;
  letter-spacing: 0.5px;
  width: 170px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.at-sidebar-item span {
  display:inline-block;
  font-weight: 600;
  font-size: 13px;
  line-height: 16px;
  font-family: var(--primchatfont);

}
.at-chat_sidebar_footer::-webkit-scrollbar {
    width: 0;
    height: 0;
}
.at-chat_sidebar_footer .at-nestedsetting {padding:0;}
.at-chat_sidebar_footer > li {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  list-style-type: none;
  margin: 0;
  width: auto ;
  border: none ;
  box-shadow: inset 0px -1px 0px #EEEEEE;
  background:#fff;
}
 .at-nestedsetting > li{
  display: flex;
  align-items: center;
  justify-content: flex-start;
  list-style-type: none;
  margin: 0;
  width: 260px;
  background: #fff;
 }
 .at-nestedsetting > li.active a::after {
    position: absolute;
    left: 0;
    top: 0;
    content: '';
    width: 100%;
    height: 100%;
 }
.at-chat_sidebar_footer > li:last-child{
    height: 100%;

}
.at-chat_sidebar_footer li.at-hasimage a {
    padding: 8px 10px !important;
}
.at-chat_sidebar_footer  li  > a {
    font-size: 20px;
    color: #999999;
    display: inline-flex;
    position: relative;
    width: auto;
    justify-content: center;
  align-items: center;
}
.at-chat_sidebar_footer li a svg {
     margin: 20px ;
}
.at-messanger-chat .at-chat_sidebar_footer li a svg{
     margin: 20px 25px;
}
.at-chat_sidebar_footer li:last-child{
    display: flex;
    align-items: flex-end;
    height: 60px;
    margin-top: auto;
    border-top: 1px solid #eee;
}

.at-chat_sidebar_footer li > a > i{
      padding: 20px;
      display: inline-block;
} 
.at-messanger-chat .at-chat_sidebar_footer > li > a {
    width: auto;
}
.at-chat_sidebar_footer a img{
    max-width: 44px;
    border-radius: 50%;
    height: 44px;
}

.at-chat_sidebar_footer > li.active , .at-nestedsetting li.active{
    position: relative;
    box-shadow: inset 3px 0px 0px  var(--primguppycolor), inset 0px -1px 0px #eeeeee;
}

.at-nestedsetting li.active {
      border-top: 1px solid #eee;
    box-shadow: inset 3px 0px 0px #ff7300, inset 0px 0px 0px #eeeeee;

}
.at-chat_sidebar_footer > li.active  a{
  color: var(--secguppycolor);
}

.at-chat_sidebar_footer a .at-notify {
  pointer-events: none;
  top: -10px;
  left: 100%;
  position: absolute;
  margin-left: -10px;
  -webkit-box-shadow: 0 0 0 3px var(--secguppycolor);
  box-shadow: 0 0 0 3px var(--secguppycolor);
  font-family: var(--secchatfont);
}
.at-nestedsetting{
    width:100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 0;
    margin: 0;
    transition: all 0.4s ease-in-out;
    background:#fff;
}
.at-nestedsetting li{
  box-shadow: inset 0px 1px 0px #EEEEEE;
}
.at-nestedsetting li.active a{
    color: var(--secguppycolor);
}
.at-messanger-chat .at-chat_sidebar_footer li.at-hasimage {
  justify-content:flex-start;
}
.at-messanger-chat .at-chat_sidebar_footer li , 
.at-messanger-chat .at-nestedsetting > li{
  width: 70px;
}
.at-messanger-chat .at-chat_sidebar_footer li a , 
.at-messanger-chat .at-nestedsetting > li a{
    padding: 0;
    width: 70px;
}
.at-messanger-chat .at-chat_sidebar_footer:hover li , 
.at-messanger-chat .at-nestedsetting:hover li {
   width: 270px;
}
.at-messanger-chat .at-nestedsetting li{
  width: 70px;
}
.at-chat_sidebar_footer .at-hasimage .at-sidebar-item {
  padding: 0 10px;
}
.at-chat_sidebar_footer > li {
  width: 270px;
}
.at-messanger-chat .at-chat_sidebar_footer a i{
      padding: 19.5px 25px;
}
.at-messanger-chat .at-sidebar-item {
    left: 70px;
}

.at-responmenu {
      display: flex;
      width:100%;
}
.at-responsivelist {
  display: flex;
  flex-direction: column;
  width: 60px;
}
.at-messanger-chat .at-responsivelist {
    width: 70px;
}
.at-imgresponsivearea {
    display: flex;
    padding: 14px 20px;
    align-items: flex-start;
    border-left: 1px solid #eee;
    border-bottom: 1px solid #eee;
    width: 100%;
}
.at-imgresponsivearea > a{
  padding: 0 !important;
}
.at-imgresponsivearea a {
  display: flex;
  padding: 0 !important;
}
.at-imgresponsivearea .at-sidebar-item {
    padding: 0;
    border: 0;
    flex-direction: column;
    margin: 10px 0 0;
    position: relative;
    align-items: flex-start;
    left: 0;
    max-width: 100%;
    width: 100%;
}
.at-responsivelist a {
    font-size: 20px;
    color: #999999;
    display: inline-flex;
    position: relative;
    width: auto;
    justify-content: center;
    align-items: center;
    box-shadow: inset 0px -1px 0px #EEEEEE;
    padding: 18px 20px;

}
.at-responsivelist a:focus{
    box-shadow: inset 0px -1px 0px #eeeeee !important;
}
.at-sidebarshow .at-menuicon{
  background: #F7F8FC !important;
}
.at-menuicon{
  box-shadow: inset 0px -1px 0px #EEEEEE;
}
.at-chat_sidebar_footer .at-listonrespon{
  box-shadow:none;
}
.at-sidebarshow {
  width: 260px !important;
}
.at-messanger-chat .at-chat_sidebar_footer:hover {
  width: 270px;
}
@media (max-width: 767px){
  .at-imgresponsivearea {
  padding: 7px 20px;
}
  .gp-chat_previewfloat .at-imgresponsivearea {
    flex-direction: column;
    justify-content: center;
  }
  .gp-chat_previewfloat .at-imgresponsivearea .at-sidebar-item {
    margin-left: 0;
  }
  .at-chat_sidebar_footer:hover {
    width: 60px;
  }
  .at-messanger-chat .at-chat_sidebar_footer:hover {
    width: 70px;
  }
  .at-messanger-chat .at-imgresponsivearea a { 
    border: 0 !important;
  }
  .at-messanger-chat .at-userchat_tab a {
    padding: 14px 10px;
}
.at-messanger-chat .at-userlist_tab .at-sidebarhead_searchv2 {
    padding: 9.5px 0;
}
.at-chat_sidebar_footer .at-sidebar-item{
  visibility: visible;
  opacity: 1;
  z-index: 1;
}
.at-imgresponsivearea .at-sidebar-item {
  margin:  10px 0 0 10px;
}
}
 @media (max-width: 480px){
   .at-imgresponsivearea {
    padding: 7px 20px;
   }
   .at-empty-conversation i {
    font-size: 27px;
 }
 }
</style>