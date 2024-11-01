<template>
  <div class="at-guppysidepopup at-chat at-user-chat" 
      :class="{ 
        'wpguppy-rtl' : isRtl, 
        'gp-whatsappsidepopup gp-chat gp-layout-one' : isWhatsappChat, 
        'gp-whatsappside-responsive': isMobileView,
        'at-guppyside-responsive' : window_idth <= 768 && !isWhatsappChat,
        'at-customer-support' : !Number(userType) } ">
    
    <div class="at-chatsidebar_float at-chatsidebar-widgetclose gp-users-list gp-layout-overlay">
      <div class="at-chat_previewfloat gp-chat_previewfloat">
        <guppy-chat-sidebar />
        <guppy-chat-messages v-if="isMessangerChat && !isWhatsappChat"/>
      </div>
    </div>

    <div class="at-chatfloatholder">
      <floating-chats />
      <template v-if="isShowWidget">
        <div class="at-chatfloat">
          <span @click="minimizeList()">
            <a id="at-float_widget_close" href="javascript:void(0);">
              <i class="guppy-x"></i>
            </a>
          </span> 
        </div>
      </template>
      <template v-else-if="floatingWidgetEnable && floatingMessenger">
        <ul class="at-chatfloatlist at-chatfloatlist_circle">
            <li v-if="whatsappSupportEnable" :style="{marginBottom : widgetCircle1}" @click.prevent="toggleWhatsappChat()">
              <a href="javascript:void(0);" id="at-whatsappchatopen" class="at-whatsapp_chat">
                <whatsapp-image :ImageColor="'white'" />
              </a>
            </li>
            <li :style="{marginBottom : widgetCircle2, opacity : itemOpacity}" class="at-theme_chat" @click.prevent="showChatWidget()">
              <a href="javascript:void(0);" id="at-themechatopen">
                <i class="guppy-message-square"></i>
              </a>
            </li>
        </ul>
        <div class="at-chatfloat" @click.prevent="toggleWidgetChat()">
          <span>
            <em v-if="isMobileView && getTotalUnreadCount" class="at-userchat_tab-noti">{{getTotalUnreadCount > 99 ? '+99' : getTotalUnreadCount}}</em>
            <a id="at-float_widget_icon" href="javascript:void(0);">
              <i class="guppy-x"></i>
              <img :src="floatingIcon" alt="floating button">
            </a>
          </span> 
        </div>
      </template>
      <div v-else-if="whatsappSupportEnable" class="at-chatfloat at-whatsappgp">
        <span>
          <a  @click.prevent="toggleWhatsappChat()" href="javascript:void(0);" id="at-whatsappchatopen">
            <whatsapp-image :ImageColor="'white'" />
          </a>
        </span> 
      </div>
    </div>
    <sidebar-popup />
  </div>
</template>

<script>
import GuppyFloatingChatList from "./GuppywidgetChatBox/GuppyFloatingChatList.vue";
import GuppyChatSidebar       from "./GuppyChatSidebar/GuppyChatSidebar.vue";
import { GUPPYCHAT_SETTINGS } from "../resources/constants";
import GuppyChatSidebarSettingPopup from "./GuppyChatMessages/GuppyChatSidebarSettingPopup.vue";
import jQuery from "jquery";
import GuppyChatMessages from "./GuppyChatMessages/GuppyChatMessages/GuppyChatMessages.vue";
import WhatsappImage from "./GuppyChatSidebar/GuppyChatWhatsappUserList/WhatsappImage.vue";
import { mapState } from 'vuex';
export default {
  name: 'widgetChatApp',
  components: { 
    SidebarPopup      : GuppyChatSidebarSettingPopup,
    FloatingChats     : GuppyFloatingChatList,
    GuppyChatSidebar,
    GuppyChatMessages,
    WhatsappImage,
  },
  data(){
    return {
      isRtl                   : false,
      isShowWidget            : false,
      floatingIcon            : GUPPYCHAT_SETTINGS.floatingIcon,
      isMobileDevice          : GUPPYCHAT_SETTINGS.isMobileDevice,
      floatingWidgetEnable    : GUPPYCHAT_SETTINGS.floatingWindowEnable,
      whatsappSupportEnable   : GUPPYCHAT_SETTINGS.whatsappSupportEnable,
      floatingMessenger       : GUPPYCHAT_SETTINGS.floatingMessenger,
      isWhatsappClick         : false,
      widgetCircle1   : '-49px',
      widgetCircle2   : '-80px',
      openWidget      : false,
      itemOpacity     : 0,
      window_idth : '',
    }
  },
  computed:{
    ...mapState({
      isMessangerChat : (state) => state.isMessangerChat,
      isWhatsappChat  : (state) => state.isWhatsappChat,
      isMobileView    : (state) => state.isMobileView,
    }),
    getTotalUnreadCount(){
      return this.$store.getters.getTotalUnreadCount
    },
    css: function(){
      return "<style> :root { --primguppycolor: " + GUPPYCHAT_SETTINGS.primaryColor+ "; --secguppycolor: " + GUPPYCHAT_SETTINGS.secondaryColor + "; --terguppycolor: " + GUPPYCHAT_SETTINGS.textColor + "; } </style>"
    },
  },
  methods:{
    minimizeList(){
      jQuery('.at-chatsidebar_float').addClass('at-chatsidebar-widgetclose');
      this.isShowWidget   = false;
      this.widgetCircle1  = '-49px';
      this.widgetCircle2  = '-80px';
      this.itemOpacity    = 0;
      this.openWidget     = false;
      jQuery('#at-float_widget_icon').removeClass('at-float-icon');
      jQuery('.gp-conversation-list').removeClass('active');
      jQuery('html').css('overflow','');
    },
    toggleWhatsappChat(){
      this.isWhatsappClick = true;
      this.$store.commit('updateChatInfo', {});
      this.$root.$emit('toggleSignInWindow', false)
      this.showChatWidget(true);
    },
    toggleWidgetChat(){
      this.openWidgetChat();
    },
    async closeWidgetChat(){
      if(this.userId){
        this.showChatWidget();
        await this.timeout(500);
        this.isWhatsappClick = false;
        this.$store.commit('updateWidgetType', { isWhatsappChat : false });
      }
    },
    guppyAddClass(){
      let width = jQuery('.at-chat').width();
      if ( width <= 768){
        jQuery('.at-guppysidepopup').addClass('at-guppyside-responsive');
        jQuery(document).on("click",'.at-onlineusers .at-userbar, .conversation-list .at-userbar, .at-guppysidepopup .user-list .at-btn-respond',function() {
          jQuery('.at-chat').addClass("at-opnchatbox")
        });
      }
      jQuery(document).on("click",'.at-backtolist',function() {
        jQuery('.at-chat').removeClass('at-opnchatbox')
      });
      jQuery(document).on("click",'.at-chat_previewfloat ul.at-chat_sidebar_footer li',function() {
        jQuery('ul.at-chat_sidebar_footer').css('width','60px')
      });
    },
    whatsappAddClass(){
      let width = jQuery('.gp-chat').width();
      if ( width <= 768){
        jQuery('.gp-whatsappsidepopup').addClass('gp-whatsappside-responsive');
        jQuery(document).on("click",'.gp-whatsappsidepopup .conversation-list .gp-whatsappsidepopup .user-list .gp-btn-respond',function() {
          jQuery('.gp-chat').addClass("gp-opnchatbox")
        });
      }
      jQuery(document).on("click",'.gp-backtolist',function() {
        jQuery('.gp-chat').removeClass('gp-opnchatbox')
      });
    },
    timeout(ms){
       return new Promise(resolve => setTimeout(resolve, ms));
    },
    openWidgetChat(){
      if( this.whatsappSupportEnable ) {
        if(this.openWidget){
          this.widgetCircle1  = '-49px';
          this.widgetCircle2  = '-80px';
          this.itemOpacity    = 0;
        } else {
          this.widgetCircle1  = '';
          this.widgetCircle2  = '';
          this.itemOpacity    = 1;
        }
        
        this.openWidget = this.openWidget ? false : true;
        jQuery('#at-float_widget_icon').toggleClass('at-float-icon');
      } else {
        this.showChatWidget();
      }
    },
    async showChatWidget( isOpenWhatsApp = false){
      if(!isOpenWhatsApp && !this.userId){
        this.$root.$emit('toggleSignInWindow', true);
        this.minimizeList();
      } else {
        let width = jQuery('.at-chat').width();
      jQuery('.at-floatdropdownholder').hide();
      jQuery('.at-chatsidebar_float').toggleClass('at-chatsidebar-widgetclose');
      if(this.isShowWidget){
        await this.timeout(500);
        this.isShowWidget = false;
      }else{
        this.isShowWidget = true;
      }
      if(this.isMobileDevice){
        if(this.isShowWidget){
          jQuery('html').css('overflow','hidden');
        }else {
          jQuery('html').css('overflow','');
        }
      }
      let isMessangerChat = false;
      if ( width <= 768 && !isOpenWhatsApp){
        isMessangerChat = this.isShowWidget ? true : false;
      }
      this.$store.commit('updateWidgetType', { isMessangerChat, isWhatsappChat : isOpenWhatsApp ? true : false });
      this.isWhatsappClick = false;
      if(isOpenWhatsApp){
        await this.timeout(300);
        jQuery('.gp-conversation-list').addClass('active');
      }
      }
    }
  },
  created(){
    jQuery('head').prepend(this.css);
    let windowWidth =  jQuery( window ).width();
    this.window_idth = windowWidth;
    let isMobileView = false;
    if( windowWidth < 768 ) {
      isMobileView = true;
    }
    this.$store.commit('updateWidgetType', { isMobileView, isfloatingChat : true });
    this.isRtl = GUPPYCHAT_SETTINGS.isRtl;
    this.$store.commit('updateWindowWidth',{ windowWidth });
  },
  mounted(){
    this.guppyAddClass();
    this.whatsappAddClass();
    this.$root.$on('showWidget',()=>{
      this.minimizeList();
    })
    this.$root.$on('openFloatingTab',()=>{
      this.showChatWidget();
    })
  },
}
</script>