<template>
  <div class="at-chat" :class="{'wpguppy-rtl' : isRtl}">
    <guppy-chat-sidebar/>
    <guppy-chat-messages />
    <sidebar-popup />
  </div>
</template>

<script>
import GuppyChatSidebar       from "./GuppyChatSidebar/GuppyChatSidebar.vue";
import GuppyChatMessages      from "./GuppyChatMessages/GuppyChatMessages/GuppyChatMessages.vue";
import { GUPPYCHAT_SETTINGS } from "../resources/constants";
import GuppyChatManager from "../resources/controller";
import GuppyChatSidebarSettingPopup from "./GuppyChatMessages/GuppyChatSidebarSettingPopup.vue";
import jQuery from "jquery";

export default {
  name: 'App',
  components: { 
    SidebarPopup : GuppyChatSidebarSettingPopup,
    GuppyChatSidebar,
    GuppyChatMessages,
  },
  data(){
    return {
      isRtl : false,
      windowWidth : ''
    }
  },
  computed:{
    css: function(){
      return "<style> :root { --primguppycolor: " + GUPPYCHAT_SETTINGS.primaryColor+ "; --secguppycolor: " + GUPPYCHAT_SETTINGS.secondaryColor + "; --terguppycolor: " + GUPPYCHAT_SETTINGS.textColor + "; } </style>"
    }
  },
  watch: {
    windowWidth(newVal, oldVal){
      if(newVal != oldVal && oldVal != ''){
        this.guppyAddClass()
      }
    }
  },
  methods : {
    responsive(){
      jQuery(document).on("click",'.conversation-list .at-userbar',function() {
        jQuery(".at-chat_sidebarsetting").removeClass("at-chat_sidebarsettingopen");
        jQuery(".at-chat_messages").removeClass("at-chat_messagesslide");
      });
    },
    guppyAddClass(){
      let width = jQuery('.at-chat').width();
      let isRtlTrue = this.isRtl ? 'wpguppy-rtl' : '';
      let customerSupportClass = !Number(this.userType) ? 'at-customer-support' : '';
      if (width >= 1440){
        jQuery('.at-chat').attr('class', 'at-chat at-messanger-chat '+customerSupportClass);
      }

      if (width <= 1440){
        jQuery('.at-chat').attr('class', 'at-chat at-chat1440 at-messanger-chat '+customerSupportClass);
      }

      if (width <= 1199){
        jQuery('.at-chat').attr('class', 'at-chat at-chat1199 at-messanger-chat '+customerSupportClass);
      }

      if (width <= 1080){
        jQuery('.at-chat').attr('class', 'at-chat at-chat1080 at-messanger-chat '+customerSupportClass);
      }

      if (width <= 991){
        jQuery('.at-chat').attr('class', 'at-chat at-chat991 at-messanger-chat '+customerSupportClass);

        jQuery(document).on("click",'.conversation-list .at-userbar, .at-btn-respond',function() {
          jQuery('.at-chat').addClass("at-opnchatbox")
        });

        jQuery(document).on("click",'.at-backtolist',function() {
          jQuery('.at-chat').removeClass('at-opnchatbox')
        });

      }

      jQuery(document).on("click",'.at-messanger-chat ul.at-chat_sidebar_footer li',function() {
        jQuery('ul.at-chat_sidebar_footer').css('width','70px')
      });

      if ( width <= 640){
        jQuery('.at-chat').attr('class', 'at-chat at-chat640 at-chat991 at-messanger-chat '+customerSupportClass);
      }

      if (width <= 575){
        jQuery('.at-chat').attr('class', 'at-chat at-chat575 at-chat640 at-chat991 at-messanger-chat '+customerSupportClass);
      } 

      if (width <= 480){
        jQuery('.at-chat').attr('class', 'at-chat at-chat480 at-chat575 at-chat640 at-chat991 at-messanger-chat '+customerSupportClass);
      } 

      if (width <= 420){
        jQuery('.at-chat').attr('class', 'at-chat at-chat420 at-chat480 at-chat575 at-chat640 at-chat991 at-messanger-chat '+customerSupportClass);
      }

      jQuery('.at-chat').addClass(isRtlTrue);
	  },
    async startChating(chatId){
      let data = {
            'sendTo'       : chatId,
            'userId'       : this.userId,
            'startChat'    : 1
          }
      this.isLoading = true;
      let response = await GuppyChatManager.sendGuppyInvite(data);
      if(response){
        if( response.data.type == "success" ) {
          if(response.data.autoInvite){
            if(!GUPPYCHAT_SETTINGS.socketEnable){
              this.$store.commit('startChat', {friendData: response.data.friendData, messagelistData : response.data.messagelistData});
            }
          }
        } else if( response.data.type == "error" ) {
          this.$store.commit('toggleMessagesScr',{ isEmptyView : true, isOpenMessagesScr : false });
          let description = response.data.message_desc ? response.data.message_desc : this.TRANS.input_params_err; 
          this.alertBox('error', this.TRANS.error_title, description)
        }
      }
    },
    async getMessangerChatInfo(chatId,chatType){
      let data = {
        'chatId'       : chatId,
        'chatType'     : chatType,
        'userId'       : this.userId,
      }
      let response = await GuppyChatManager.getMessangerChatInfo(data);
      if(response.data.type == 'success' && response.data.chatInfo !=''){
        this.$store.commit("updateChatInfo", {data : response.data.chatInfo});
      } else if( response.data.type == "error" ) {
        this.alertBox('error', this.TRANS.error_title, response.data.message_desc)
        this.$store.commit('toggleMessagesScr',{ isEmptyView : true, isOpenMessagesScr : false });
      }
    }
  },
  mounted(){
    this.responsive();
    this.guppyAddClass();
    let _Windowwidth = jQuery('.at-chat').width();
    this.$store.commit('updateWindowWidth',{ windowWidth : _Windowwidth });
  },
  created(){
    // to open chat in widget boxes
    this.$store.commit('updateWidgetType', { isMessangerChat : true });
    let uri       = window.location.search.substring(1); 
    let params    = new URLSearchParams(uri);
    let chatId    = params.get("chat_id");
    let chatType  = params.get("chat_type");
    let type      = params.get("type");

    if(type == 'messanger' && chatType && chatId){
      this.$store.commit('toggleMessagesScr',{ isEmptyView : false, isOpenMessagesScr : true });
      this.getMessangerChatInfo(chatId,chatType);
    } else if( chatId && Number(chatId) > 0 && chatType == 1){
      this.$store.commit('toggleMessagesScr',{ isEmptyView : false, isOpenMessagesScr : true });
      this.startChating(chatId);
    }

    window.addEventListener("resize", ()=>{
      this.windowWidth = jQuery('.at-chat').width();
    });
    
    jQuery('head').prepend(this.css);
    this.isRtl = GUPPYCHAT_SETTINGS.isRtl;
    this.$store.dispatch('initRealTimeChatSetting',{ authToken : window.wpguppy_scripts_vars.authToken });
  }
}
</script>

<style scoped>
  @import url("./resources/style.css");
  @import url("./resources/rtl.css");
  @import url('./resources/updatestyle.css');
  @import url('./resources/whatsappstyle.css');
</style>
