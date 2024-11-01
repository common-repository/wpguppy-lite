<template>
  <div :class="isWhatsappChat ? 'gp-chat_sidebar' : 'at-chat_sidebar'">
    <whatsapp-user-List v-if="isWhatsappChat"/>
    <template v-else-if="userId && Number(userType)" >
      <guppy-caht-user-list v-if="activeTab == 'contacts'" />
      <guppy-chat-friend-list v-else-if="activeTab == 'friends'" />
      <guppy-chat-block-user-list v-else-if="activeTab == 'blocked'" />
      <guppy-chat-private-list v-else-if="activeTab == 'messages'" />
      <customer-support v-else-if="activeTab == 'customer_support'"/>
      <guppy-chat-profile-setting v-else-if="activeTab == 'profile'" />
      <guppy-chat-sidebar-footer />
    </template>
    <template v-else-if="userId && !Number(userType)">
      <customer-support/>
      <guppy-chat-sidebar-footer />
    </template>
  </div>
</template>

<script>
import GuppyChatSidebarFooter     from "./GuppyChatSidebarFooter/GuppyChatSidebarFooter.vue";
import GuppyChatBlockUserList     from "./GuppyChatBlockUserList/GuppyChatBlockUserList.vue";
import GuppyCahtUserList          from "./GuppyChatUsersList/GuppyChatUsersList.vue";
import GuppyChatFriendList        from "./GuppyChatFriendList/GuppyChatFriendList.vue";
import CustomerSupport            from "./GuppyChatCustomerSupport/CustomerSupport.vue";
import { GUPPYCHAT_SETTINGS }     from "./../../resources/constants";
import GuppyChatWhatsappUserList  from "./GuppyChatWhatsappUserList/GuppyChatWhatsappUserList.vue";
import GuppyChatProfileSetting    from "./GuppyChatProfileSetting/GuppyChatProfileSetting.vue";
import GuppyChatPrivateList       from "./GuppyChatConversationList/GuppyChatPrivateList.vue";
import RestApiManager from "../../resources/RestApiController";
import { mapState } from 'vuex';
export default {
    name : "GuppyChatSidebar",
    components: {
      GuppyCahtUserList,
      GuppyChatSidebarFooter,
      GuppyChatFriendList,
      GuppyChatBlockUserList,
      CustomerSupport,
      GuppyChatPrivateList,
      WhatsappUserList : GuppyChatWhatsappUserList,
      GuppyChatProfileSetting
    },
    props:{
      isWidgetChat : {
				type : Boolean,
				required : false,
				default : false
			}
    },
    data(){
      return{
        Tab : 'users'
      }
    },
    watch:{
      userType(type){
        RestApiManager.getUnReadMessages()
        if(Number(type) == 1){
          RestApiManager.getProfileInfo();
        }
      }
    },
    computed :mapState({
      isWhatsappChat: state => state.isWhatsappChat,
      activeTab: state => state.activeTab,
    }),
    beforeCreate(){
      this.$store.commit('selectTab', GUPPYCHAT_SETTINGS.defaultActiveTab);
      
    },
    created(){
      if(this.userType){
        RestApiManager.getUnReadMessages()
        Number(this.userType) == 0 && RestApiManager.getGuestUserInfo();
        Number(this.userType) == 1 && RestApiManager.getProfileInfo();
      }
    }
}
</script>
<style scoped>
.at-chat_sidebar {
  position: relative;
  -webkit-box-flex: 0;
  -ms-flex: 0 0 32%;
  flex: 0 0 32%;
  max-width: 32%;
  border-right: 1px solid #eee;

}
.at-chat_sidebar:before{
    width: 100%;
    position: absolute;
    content: '';
    height: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0);
    opacity: 0;
    visibility: hidden;
    z-index: 1;
    transition: all 0.6s ease-in-out;
    cursor: pointer;
}
.at-ovelay:before{
    opacity: 1;
    visibility: visible;
    background-color: rgba(0,0,0,0.3);
    transition: all 0.6s ease-in-out;
}

</style>