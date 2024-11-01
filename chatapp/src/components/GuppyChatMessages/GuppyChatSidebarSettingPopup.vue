<template>
  <div>
    <!-- Block User PopUp -->
    <template>
      <div id="blockuser" class="at-modal">
        <div class="at-modaldialog">
          <div class="at-alert">
            <i class="guppy-alert-circle"></i>
            <h2>{{chatInfo.isBlocked ? TRANS.unblock_user_heading.replace('((username))', chatInfo.userName) : TRANS.block_user_title.replace('((username))', chatInfo.userName)}}</h2>
            <p>{{ chatInfo.isBlocked ? TRANS.unblock_user_description : TRANS.block_user_description}}</p>
            <a href="javascript:void(0);" @click.prevent="toggleBlockUser()" :class="{'at-disable-btn' : isloadingUpdt }" class="at-btn">
              {{chatInfo.isBlocked ? TRANS.unblock_button : TRANS.block_user_button}}
            </a>
            <a href="javascript:void(0);" class="at-anchor at-guppy-removemodal">
              {{TRANS.not_right_now}}
            </a>
          </div>
        </div>
      </div>
    </template>
    <!-- Clear PopUp -->
    <template>
      <div id="clearchat" class="at-modal">
        <div class="at-modaldialog">
            <div class="at-alert">
                <i class="guppy-alert-circle"></i>
                <h2>{{ TRANS.clear_chat }}</h2>
                <p>{{ TRANS.clear_chat_description}}</p>
                <a href="javascript:void(0);" @click.prevent="clearChat()" :class="{'at-disable-btn' : isloadingUpdt }" class="at-btn">
                  {{TRANS.clear_chat_button}}
                </a>
                <a href="javascript:void(0);" class="at-anchor at-guppy-removemodal">{{TRANS.not_right_now}}</a>
            </div>
        </div>
      </div>
    </template>

  <!-- Crop Profile image popup -->
    <template>
			<div id="image_crop" class="at-modal at-cropping-popup" :class="{'at-modalopen at-fadin' : isCroppedImage}">
        <div class="at-modaldialog"> 
            <div class="at-alert">
              <vue-croppie ref="profCroppieRef" :enableResize="false" :boundary="proCroppieBoundry" :viewport="proCroppieViewport"></vue-croppie>
					      <div class="at-form-group">
                    <ul class="at-btnlist">
                        <li><a  href="javascript:void(0);"  @click.prevent="proCroppedImage()" :class="{'at-disable-btn' : isloadingUpdt }" class="at-btn">{{TRANS.crop_img_txt}}</a></li>
                        <li><a href="javascript:void(0);" id="cancel_crop_image" @click.prevent="closePopUp('cropImage')" class="at-btn at-btnv2">{{TRANS.cancel_txt}}</a></li>
                    </ul>
                </div>
              </div>

          </div>
      </div>
    </template>

    <!-- Accept invite popup -->
    <template>
			<div id="accept_invite" class="at-modal at-invitepopup" :class="{'at-modalopen at-fadin' : isOpenInvitePopUp}">
        <div class="at-modaldialog"> 
          <guppy-chat-invite-response :isShowDefaultMessage="false"/>
          </div>
      </div>
    </template>
  </div>
</template>

<script>
  import jQuery from "jquery";
  import GuppyChatManager from "../../resources/controller";
  import GuppyChatInviteResponse from "./GuppyChatInviteResponse/GuppyChatInviteResponse.vue";
  export default {
    name : "GuppyChatSidebarSettingPopup",
    components:{
      GuppyChatInviteResponse
    },
    data(){
      return {
        isloadingUpdt : false,
        proCroppieBoundry : {
          width: 600, 
          height: 460,
        },
        proCroppieViewport : {
          width:500, 
          height:450, 
          'type':'square'
        },
        isCroppedImage : false,
        isOpenInvitePopUp : false,
      }
    },
    computed: {
      chatInfo(){
        return this.$store.getters.getChatInfo()
      },
    },
    methods:{
      closePopUp( popUp ){
        switch(popUp){
          case 'cropImage':
            this.isCroppedImage = false;
            break;
          case 'acceptInvite':
            this.isOpenInvitePopUp = false;
            break;
        }
      },
      openPopUp( popUp ){
        switch(popUp){
          case 'cropImage':
            this.isCroppedImage = true;
            break;
          case 'acceptInvite':
            this.isOpenInvitePopUp = true;
            break;
        }
      },
      setProfileImage(file){
        var reader 			= new FileReader();
        this.isCroppedImage = true;
        reader.onload = e => {
          this.$refs.profCroppieRef.bind({
            url: e.target.result
          });
        }
        reader.readAsDataURL(file);
      },
      proCroppedImage() {
        let options = {
          type: 'blob',
          size: { width: 600, height: 450 },
          format: 'jpeg'
        };
        let imageUrl = '',file = '';
        this.$refs.profCroppieRef.result(options, output => {
          const CroppedImage = new File( [output], 
            `image_${Math.floor(Math.random() * 99999999)}.jpeg`, 
            { type: output.type, } );
          file 		 = CroppedImage;
          imageUrl = URL.createObjectURL(CroppedImage);
          this.isCroppedImage = false;
          this.$root.$emit('CroppedfileParams', { imageUrl, file })
        });
      },
      capitalizeText(s){
        if (typeof s !== 'string') return ''
        return s.charAt(0).toUpperCase() + s.slice(1)
      },
      async toggleBlockUser(){
        let data = {
              'statusType'        : this.chatInfo.isBlocked ? 4 : 3,
              'actionTo'          : this.chatInfo.chatId.split('_')[0],
              'userId'            : this.userId,
              'muteNotification'  : this.chatInfo.muteNotification
            }
        this.isloadingUpdt  = true;
        let response        = await GuppyChatManager.updateUserStatus(data);
        jQuery('#blockuser').removeClass('at-modalopen at-fadin');
        jQuery(".at-chat_sidebarsetting").removeClass("at-chat_sidebarsettingopen");
        jQuery(".at-chat_messages").removeClass("at-chat_messagesslide");
        jQuery('body').css('overflow','');
        if( response.data.type == "success" ) {
            this.$store.commit('UpdateSelectUserStatus', response.data.userData );
        } else if( response.data.type == "error" ) {
          this.alertBox('error', this.TRANS.error_title, response.data.message_desc);
        }
        this.isloadingUpdt = false;
      },
      clearChat(){
        let actionTo = this.chatInfo.chatId.split('_')[0];
        let chatType = this.chatInfo.chatType;
        let chatId   = this.chatInfo.chatId;
      
        let data = {
              'actionTo'  : chatType == 1 ? actionTo : '',
              'chatId'    : chatId,
              'userId'    : this.userId,
              'chatType'  : chatType,
            }
        this.isloadingUpdt = true;
        this.axios.post("clear-guppy-chat", data).then((response) => {
        
          if( response.data.type == "success" ) {
            this.isloadingUpdt = false;
            jQuery('#clearchat').removeClass('at-modalopen at-fadin');
            jQuery(".at-chat_sidebarsetting").removeClass("at-chat_sidebarsettingopen");
            jQuery(".at-chat_messages").removeClass("at-chat_messagesslide");
            jQuery('body').css('overflow','');
            this.$store.dispatch('clearGuppyChat', data );
            this.$store.dispatch('triggerSocketEvents', {'event':'clearChat', payload : data})
          } else if( response.data.type == "error" ) {
            this.alertBox('error', this.TRANS.error_title, response.data.message_desc);
          }
        }).catch((error) => {
          this.isloadingUpdt = false;
          console.log(error);
        });
      },
    },
    mounted(){
      this.$root.$on('croppedProfileImage', (data)=>{
        this.setProfileImage(data);
      });
      this.$root.$on('openPopUp', (data)=>{
        this.openPopUp(data.type)
      });
      this.$root.$on('closePopUp', (data)=>{
        this.closePopUp(data.type)
      });
    },
  }
</script>

<style>
.at-modal {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10501;
  display: none;
  width: 100%;
  height: 100%;
  overflow: auto;
  outline: 0;
  opacity: 0;
  transition: all 0.3s ease-in-out;
}
.at-modal:before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: -1;
}

.at-modalopen {
  display: flex;
}

.at-modaldialog {
  width: 100%;
  margin: auto;
  display: flex;
  padding: 30px 0;
  max-width: 528px;
  align-items: center;
}
.at-chat575 .at-modaldialog{
  max-width: 100%;
  padding-left: 15px;
  padding-right: 15px;
}
.at-guppyside-responsive .at-modaldialog{
  padding-left: 15px;
  padding-right: 15px;
}
.at-modaldialog .at-alert {
  max-width: initial;
  width: 100%;
}

.at-fadin {
  opacity: 1;
}
.at-alert .at-themeform{
  text-align: left;
}
.at-chat textarea.at-form-control {
    resize: none;
    padding-top: 12px;
}
.at-chat .at-dropdownholder .at-form-control {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.at-dropdownholder .at-form-control > span,
.at-placeholder {
  color: var(--terguppycolor);
  font: 400 14px/24px var(--secchatfont);
}
.at-dropdownholder .at-form-control > span:not(.at-placeholder){color: var(--secguppycolor);}
.at-dropdown {
  margin:0;
  padding: 0;
  background: #fff;
  border-radius: 3px;
  overflow: hidden;
  display: none;
  position: absolute;
  top: 100%;
  width: 100%;
  z-index: 99;
  left: 0;
  font: 500 14px/2em "Urbanist", sans-serif;
  flex-direction: column;
  -webkit-box-shadow: 0px 2px 4px rgba(40, 41, 61, 0.04), 0px 8px 16px rgba(96, 97, 112, 0.16);
  box-shadow: 0px 2px 4px rgba(40, 41, 61, 0.04), 0px 8px 16px rgba(96, 97, 112, 0.16);
  max-height: 200px;
  overflow-y: auto;
}
.at-dropdown li {
  line-height: inherit;
  list-style-type: none;
  outline: none;
}
.at-dropdown a {
  cursor: pointer;
  margin: 0;
  align-items: center;
  font-weight: 500;
  padding: 6px 20px;
  display: flex;
  color: #0A0F26;
  transition: all 0.3s ease-in-out;
}
.at-dropdown a:hover {
  background-color: #F7F7F7 !important;
}
.at-dropdown a:focus{
  outline: none !important;
}
.at-dropdown a i {
  color: var(--terguppycolor);
  font-size: 18px;
  width: 20px;
  display: inline-block;
  margin-right: 10px;
  text-align: center;
}
.at-dropdown.at-uploadoption_open{
  display: -ms-flexbox;
  display: flex;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
}
.at-dropcontentholder {
  text-align: left;
  padding: 20px;
  background: #fff !important;
}

.at-dropboxuploader {
  display: flex;
  align-items: center;
  width: 100%;
  flex-direction: column;
  text-align: center;
}

.at-dropcontent {
  display: flex;
  flex-flow: wrap row;
  align-items: center;
  width: 100%;
}
.at-dropcontent img {
  margin-right: 10px;
  border-radius: 10px;
  flex: none;
}
.at-dropcontent .at-removedrop {
  font-size: 20px;
  color: #EF4444;
  margin-left: auto;
}

.at-droptitle {
  flex: auto;
}
.at-droptitle > span {
  font: 500 0.875rem/1.5714285714em "Urbanist", sans-serif;
  letter-spacing: 0.5px;
  display: block;
}

.at-progressbarholder {
  position: relative;
  height: 3px;
  margin-top: 10px;
}

.at-progressbar {
  width: 100%;
  background-color: #F7F7F7;
}

.at-progressbar,
.at-progressbar_fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 3px;
  border-radius: 60px;
}

.at-progressbar_fill {
  background-color: #FF7300;
}
.at-dropboxuploader i {
  line-height: 60px;
  width: 60px;
  text-align: center;
	background: #F7F7F7;
	border-radius: 10px;
	font-size: 28px;
	color: var(--terguppycolor);
	margin-bottom: 10px;
	display: inline-block;
}
.at-creategroup .at-dropbox{
  border-radius: 4px;
  padding: 30px 20px;
}
.at-makeadmin{
  flex: none;
  margin-left: auto;
  padding: 3px 8px;
  border: 1px solid #DDDDDD;
  border-radius: 3px;
  letter-spacing: 0.01em;
  font-family: var(--secchatfont);
  color: #999999 !important;
  font-weight: 600;
  font-size: 10px;
  line-height: 14px;
  display: none;
}
input[type="checkbox"]:checked + .at-groupuserbar_content .at-makeadmin{
  display: inline-flex;
  visibility: visible;
  opacity: 1;
}
.at-makeadmin i{
  margin-right: 2px;
  font-weight: 700;
}
.at-makeadmin:not(.at-makeadmin-check){
  opacity: 0;
  visibility: hidden;
}
.at-groupuserbar_content:hover .at-makeadmin:not(.at-makeadmin-check){
  opacity: 1;
  visibility: visible;
}
.at-makeadmin-check{
  background: #22C55E;
  border-color: #22C55E;
  color: #fff !important;
}
.at-makeadmin-check::before{
  content: "\e92b";
  font-family: 'icomoon';
  color: #fff;
  margin-right: 4px;
}
.at-dropboxuploader img{
  margin: 0 0 10px;
}
.at-creategroup .at-form-group .at-btnlist{
  width: auto;
  box-shadow: inset 0px 1px 0px #dddddd;
  margin: 0 -30px -10px -30px;
  padding: 10px 20px 0;
}
.at-btnlist .at-groupuserbar_content{
  padding: 0 0 0 34px !important;
}
.at-btnlist .at-groupuserbar_title{
  white-space: pre-wrap;
  letter-spacing: 0.01em;
  font: 400 16px/26px var(--secchatfont);
}
.at-btnlist .at-groupuserbar_content:hover,
.at-btnlist .at-groupuserbar:hover{
  background: transparent;
}
.at-btnlist .at-groupuserbar_content::after{
  left: 0;
}
 .at-creategroup .at-popupcontent{ 
   background: transparent;
 }
 .at-creategroup .at-themeform{
   background-color: #fff;
 }
 /* Leave Group */
 .at-assignlist-wrap .at-form-search{ 
   margin: 0 0 10px;
 }
.at-form-search{
  position: relative;
  display: flex;
  align-items: center;
}
.at-form-search i{
  position: absolute;
    left: 18px;
    font-size: 18px;
    color: var(--terguppycolor);
}
.at-chat .at-form-search .at-form-control{
  font-size: 14px;
  padding-left: 45px;
  width: 100%;
  height: 40px;
  outline: none;
}
.at-admin-leavegroup .at-themeform fieldset{
  margin: -5px;
}
.at-admin-leavegroup .at-themeform fieldset .at-form-group{padding: 5px;}
.at-assignlist{
  margin: 0;
  padding: 0;
  max-height: 350px;
  overflow: auto;
}
.at-assignlist li{
  display: flex;
  padding: 10px 14px;
  align-items: center;
  transition: all 0.3s ease-in-out;
}
.at-assignlist li:hover{
  background: #F7F7F7;
}
.at-assignlist .at-makeadmin{
  margin-left: auto;
  opacity: 1;
  visibility: visible;
  display: inline-block;
  padding: 3px 6px;
}
.at-assignlist figure{
  margin: 0;
  display: flex;
  align-items: center;
}
.at-assignlist figure img{
  max-width: 30px;
  border-radius: 50%;
  max-height: 30px;
  margin-right: 10px;
}
.at-assignlist figure figcaption{
  font: 700 14px/26px var(--primchatfont);
  color: var(--secguppycolor);
}
.at-leavebtn{
  background-color: #EF4444 !important;
}
.at-uploadimg{
  display: flex;
  min-width: 200px;
  min-height: 200px;
  max-height: 400px;
  align-items: center;
  padding-bottom: 40px;
  justify-content: center;
}
.at-uploadimg img{
  border-radius: 5px 5px 0 0;
}
 @media (max-width: 480px){
  .at-creategroup .at-form-group .at-btnlist{
    padding: 10px 10px 0;
    margin: 0 -15px -10px;
  }
}
</style>