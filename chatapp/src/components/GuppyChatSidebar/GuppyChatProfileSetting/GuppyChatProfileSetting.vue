<template>
	<div class="at-sidebarhead">
		<div class="at-chat_sidebarsetting at-userlist_tab at-userlist_tabv2">
			<div class="at-chat_sidebarsettingtitle">
				<h2>{{TRANS.profile_settings}}</h2>
			</div>
			<div class="at-chat_profile">
				<form class="at-themeform" enctype='multipart/form-data'>
					<fieldset>
						<div class="at-form-group-wrap">
							<div class="at-form-group">
								<label class="at-formtitle at-important">{{TRANS.full_name}}</label>
								<input type="text" required :class="{'at-disabled': !isAllowEditAccSetting }" :disabled="!isAllowEditAccSetting" class="at-form-control" :placeholder="TRANS.your_name" v-model="profileInfo.userName">
							</div>
							<div class="at-form-group">
								<label class="at-formtitle at-important">{{TRANS.email}}</label>
								<input type="email" required class="at-form-control" :class="{'at-disabled': !isAllowEditAccSetting }" :disabled="!isAllowEditAccSetting" :placeholder="TRANS.your_email" v-model="profileInfo.userEmail">
							</div>
							<div class="at-form-group">
								<label class="at-formtitle at-important">{{TRANS.phone}}</label>
								<input type="text" class="at-form-control" :class="{'at-disabled': !isAllowEditAccSetting }" :disabled="!isAllowEditAccSetting" required :placeholder="TRANS.your_phone" v-model="profileInfo.userPhone">
							</div>
							<div class="at-form-group">
								<div class="at-dropbox sv-newslots" :class="{'at-dropboxv2': isMessangerChat }">
									<div class="at-viewuploadimg">
										<img v-if="uploadImage" :src="uploadImage" />
										<svg><rect width="100%" height="100%"></rect></svg>
										<div class="at-uploadarea">
											<h6>{{TRANS.upload_photo_dsc}}</h6>
											<div class="at-btnareasetting" v-if="isAllowEditAccSetting">
												<label class="at-btn at-btnsm" for="dropbox"> {{TRANS.upload_photo_btn}} </label>
												<button class="at-btn at-btnplain" @click.prevent="removeImage()"> {{TRANS.remove}} <i class="guppy-trash-2"></i> </button>
											</div>
										</div>
									</div>
									<input type="file" v-if="isAllowEditAccSetting" :accept="uploadImgExt.join(',')" id="dropbox" name="dropbox" @change.prevent="onImageUpload">
								</div>
							</div>
							<div class="at-settingbtns at-form-group">
								<div @click.prevent="muteNotification()" class="at-rightswitcharea" :class="userProfileData.muteNotification ? 'at-muted' : 'at-mute' ">
									<i :class="userProfileData.muteNotification ? 'guppy-volume-x' : 'guppy-volume-2'"></i>
									<span>{{TRANS.mute_alert_txt}}</span>
								</div>
								<div @click.prevent="logout()" class="at-rightswitcharea at-logout">
									<i class="guppy-power"></i>
									<span>{{TRANS.logout}}</span>
								</div>
							</div>
							
							<div v-if="isAllowEditAccSetting" class="at-form-group">
								<button :disabled="isloadingUpdt" :class="{'at-disable-btn' : isloadingUpdt }" class="at-btn at-btn-block" @click.prevent="updateProfileInfo()">
									{{TRANS.save_changes}}
								</button>
							</div>
						</div>
					</fieldset>
				</form>
			</div>
		</div>
	</div>
</template>

<script>
	import { GUPPYCHAT_SETTINGS, GUPPYCHAT_LOGOUT } from "../../../resources/constants";
	import GuppyChatManager from "../../../resources/controller";
	import RestApiManager from "../../../resources/RestApiController";
	import defaultAvatar from "./resource/defaultAvatar.png"
	import { mapState } from "vuex";
	export default {
		name : "GuppyChatProfileSetting",
		data(){
			return {
				defaultAvatar : defaultAvatar,
				logoutUrl : GUPPYCHAT_LOGOUT,
				profileInfo : {
					muteNotification : '',
					userAvatar 	:'' ,
					userEmail  	:'' ,
					userId 		:'' ,
					userName 	:'' ,
					userPhone 	:'' ,
				},
				removeAvatar 	: 0,
				notificationLoader : false, 
				uploadImgExt    : ['.png','.jpeg','.jpg', '.gif'],
				uploadImage 	: '',
				thumbnailImg 	: '',
				file 			: '',
				showImage 		: true,
				isloadingUpdt 	: false,
				getUserIfno 	: true,
				newVal : ''
			}
		},
		computed :{
			isAllowEditAccSetting(){
				return !GUPPYCHAT_SETTINGS.hideAccSettings
			},
			...mapState({
				isMessangerChat: state => state.isMessangerChat,
				userProfileData: state => state.userProfile,
			}),
		},
		watch:{
			userProfileData(newVal, oldVal){
				if(oldVal == ''){
					this.setProfileInfo();
					this.newVal = newVal
				}
			}
		},
		methods:{
			logout(){
				window.location.href = GUPPYCHAT_LOGOUT;
			},
			async muteNotification(){
				let data = {
					muteType : 1,
					userId : this.userId,
					chatType : '',
					chatId : ''
				}
				this.notificationLoader = true;
				let response = await RestApiManager.muteNotification(data);
				this.notificationLoader = false;
				if( response.data.type == 'error'){
					this.alertBox('error', this.TRANS.error_title, response.data.desc)
				}
			},
			updateProfileInfo(){
				let dataVal = this.profileInfo;
				let validEmail = GuppyChatManager.validateEmail(dataVal.userEmail);
				if(dataVal.userEmail && dataVal.userName && dataVal.userPhone && validEmail){
					let data = new FormData();
					Object.keys(this.profileInfo).map(item =>{
						data.append(item, this.profileInfo[item]);
					});
					data.append('removeAvatar' , this.removeAvatar);
					if( this.file ){
						data.append(0, this.file);
					}
					this.isloadingUpdt = true;
					this.axios.post('update-profile-info', data).then( response =>{
						this.isloadingUpdt = false;
						if( response.data.type == 'success' ){
							let data = response.data.userInfo;
							this.profileInfo.userEmail = data.userEmail;
							this.profileInfo.userPhone = data.userPhone;
							this.profileInfo.userName  = data.userName;
							if( data.userAvatar ){
								this.profileInfo.userAvatar    = data.userAvatar;
								this.uploadImage = this.thumbnailImg = data.userAvatar;
							} else if( this.removeAvatar == 1){
								this.thumbnailImg = '';
								this.profileInfo.userAvatar = ''
							}
							data['userAvatar'] 			= this.profileInfo.userAvatar;
							data['muteNotification'] 	= this.userProfileData.muteNotification;
							let payload = { userInfo: data };
							this.$store.commit('setUserProfile', payload);
						} else if( response.data.type == "error" ) {
							this.alertBox('error', this.TRANS.error_title, response.data.message_desc);
						}
					}).catch( errors =>{
						this.isloadingUpdt	= false;
						this.errors 		= errors;
						console.log(errors)
					});
				} else {
					this.alertBox('error', this.TRANS.error_title, this.TRANS.empty_input_err_txt );
				}
			},
			onImageUpload(e){
				let file	= e.target.files[0];
				let fileExt = file.name.split('.').pop();
					fileExt = fileExt ? fileExt.toLowerCase() : '';
				 if( this.uploadImgExt.includes('.'+fileExt) ){
					this.removeAvatar 	= 0;
					this.showImage 		= true;
					this.$root.$emit('croppedProfileImage', file)
				 } else {
					this.alertBox('error', this.TRANS.error_title, this.TRANS.invalid_input_file);
            		return;
				}
				e.target.value = ''
			},
			removeImage(){
				this.removeAvatar 	= 1;
				this.showImage 	 	= false;
				this.uploadImage 	= this.defaultAvatar;
				this.file		 	= '';
				this.profileInfo.userAvatar = ''
			},
			setProfileInfo(){
				let data = this.userProfileData;
				let info = this.profileInfo;
				info.muteNotification 	= data.muteNotification;
				info.userAvatar 		= data.userAvatar;
				info.userEmail 			= data.userEmail;
				info.userId 			= data.userId;
				info.userName 			= data.userName;
				info.userPhone 			= data.userPhone;
				this.uploadImage = this.thumbnailImg = data.userAvatar;
				this.showImage   = data.userAvatar ? true : false; 
			}
		},
		mounted(){
			this.$root.$on('CroppedfileParams', (data)=>{
				this.file 		 = data.file;
				this.uploadImage = data.imageUrl;
			});
		},
		created(){
			this.setProfileInfo();
		}
	};
</script>

<style>
.mCSB_inside>.mCSB_container{margin: 0;}
.at-sidebarhead {
	z-index: 0;
	display: flex;
	align-items: center;
	position: relative;
	height:100%;
}
.at-sidebarhead > img {
	margin-right: 10px;
	border-radius: 50% !important;
	width: 50px;
	height: 50px;
}
.at-sidebarhead > h2 {
	color: #fff !important;
	letter-spacing: 0.5px;
	font-size: 22px;
	margin: 0;
	line-height: 30px;
	white-space: nowrap;
	overflow: hidden;
	padding-top: 0;
	text-overflow: ellipsis;
}
.at-sidebarhead_menu{
	margin-left: auto;
	position: relative;
	display: inline-flex;
	padding-left: 20px;
}
.at-sidebarhead_menu > a {
	color: #fff;
	font-size: 28px;
	display: inline-block;
	text-decoration: none !important;
}
.at-sidebarhead_menu .at-uploadoption {
	bottom: auto;
    top: 100%;
    right: 0;
}
.at-sidebarhead>a:hover{color: #fff;}
.at-overlay::before {
  content: "";
  position: absolute;
  top: 90px;
  left: 0;
  width: 100%;
  height: calc(100vh - 150px);
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
}
.at-dropbox {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    text-align: center;
    width: 100%;
    border: 1.5px dashed #DDDDDD;
    border-radius: 3px;
    flex-wrap: wrap;
    background: transparent;
}
.at-dropbox input {
	display: none;
}
.at-dropbox label {
	margin: 0;
	font: 500 14px/24px var(--primchatfont);
	letter-spacing: 0.5px;
	color: var(--secguppycolor);
	max-width: 180px;
	cursor: copy;
}
.at-dropbox label span {
	color: #3C57E5;
}

.at-dropboxempty {
	border: 0;
	margin-top: 10px;
	min-height: 194px;
}
.at-dropboxempty i {
	padding: 0;
	color: #ddd;
	font-size: 38px;
	margin: 0 0 10px;
	background-color: transparent;
}
.at-dropboxempty label {
	font-size: 15px;
	line-height: 24px;
	color: var(--terguppycolor);
	max-width: initial;
	cursor: initial;
	font-weight: 700;
}
.at-viewuploadimg{
	display: flex;
    align-items: center;
	flex-direction: column;
}
.at-viewuploadimg img{
	flex: none;
	border-radius: 5px 5px 0 0;
    height: 300px;
    width: 100%;
    border-radius: 5px;
    width: 100%;
	margin: 0 0 10px;
}
.at-uploadarea .at-btnareasetting {
	margin: 10px 0 0;
}

.at-removeuploadimg{
	line-height: 20px;
	background: #EF4444;
	border-radius: 0px 0px 10px 10px;
	padding: 10px 20px;
	letter-spacing: 0.5px;
	display: block;
	text-align: center;
	color: #FFFFFF;
	font-size: 16px;
	font-family: var(--primchatfont);
	font-weight: 700;
	border-radius: 0 0 10px 10px;
	position: absolute;
	left: 0;
	bottom: 0;
	min-width: initial;
	width: 100%;
	transition: all 300ms ease-in-out;
	text-decoration: none !important;
}
.at-uploadarea h6 {
	font-weight: 500 !important;
	font-size: 14px;
	text-transform: none;
	line-height: 22px;
	letter-spacing: 0.5px;
	text-align: center;
	margin: 0;
}
.at-removeuploadimg:focus,
.at-removeuploadimg:hover{color: #fff;}
.at-chat .at-removeuploadimg:focus{
	background: #EF4444 !important;
}
.at-chat_sidebarsettingtitle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 20px;
    background: #fff;
    box-shadow: inset 0px -1px 0px #eeeeee;
}
.at-chat_sidebarsettingtitle h2 {
    margin: 0;
    font-size: 18px;
    line-height: 26px;
    letter-spacing: 0.5px;
    font-weight: 600 !important;
}
.at-chat_sidebarsettingtitle > a {
  margin: 0 -4px 0 16px;
  font-size: 28px;
  color: var(--secguppycolor);
  display: inline-flex;
  text-decoration: none;
}
.at-chat_sidebarsettingtitle>a:hover{color: var(--secguppycolor);}
.at-sidebarhead .at-chat_sidebarsetting {
    width: 100%;
    padding-left: 60px;
}
.at-sidebarhead .at-chat_profilesettingopen {
  transform: translateX(0);
}
.at-chat_mutenotify {
  align-items: center;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
}
.at-chat_mutenotify.at-disabled{
	background: transparent;
	opacity: 0.5;
}
.at-chat_mutenotify input {
  display: none;
}
.at-chat_mutenotify input:checked + label {
  color: var(--terguppycolor);
}
.at-chat_mutenotify input:checked + label i {
  background-color: #F7F7F7;
  color: var(--terguppycolor);
}
.at-chat_mutenotify input:checked + label i::before {
  content: "";
}
.at-chat_mutenotify input + label {
  align-items: center;
  font: 700 16px/26px var(--primchatfont);
  letter-spacing: 0.5px;
  color: var(--secguppycolor);
  width: 100%;
  cursor: pointer;
  margin: 0 !important;
  display: -ms-flexbox;
  display: flex !important;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  padding: 0 !important;
}
.at-chat_mutenotify label span {
  align-items: center;
  flex: auto;
  height: 48px;
  padding-right: 20px;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
}
.at-chat_mutenotify label i {
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  flex: none;
  border-radius: 3px;
  background-color: var(--primguppycolor);
  font-size: 27px;
  color: #fff;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
}
.at-menue-options .at-guppylogout{
	display: flex;
	align-items: center;
	padding: 26px 30px;
	width: 100%;
	border-top: 0;
}
.at-menue-options .at-guppylogout a{
    display: inline-flex;
    color: #EF4444 !important;
    outline: none !important;
    box-shadow: none !important;
    background: transparent !important;
    letter-spacing: 0.5px;
    align-items: center;
    font: 500 16px/32px var(--primchatfont);
    width: 100%;
}
.at-guppylogout a i{
	color: #EF4444 !important;
	font-size: 22px;
    display: inline-block;
    vertical-align: middle;
    margin-right: 10px;
}
.at-cropping-popup .at-modaldialog{
	max-width: 700px;
}
.at-guppytooltip{
	position: relative;
	display: inline-block;
}
.at-guppytooltip > em{
	left: 0;
	width: auto;
    right: auto;
    margin-left: 0;
    border-radius: 4px 4px 4px 0;
	margin-bottom: 10px;
    bottom: 100%;
    transform: scale(0.5);
    position: absolute;
    color: #fff;
    background: var(--secguppycolor);
    padding: 5px 12px;
    letter-spacing: 0.5px;
    opacity: 0;
    visibility: hidden;
    font: 700 14px/22px var(--primchatfont);
    transition: all 0.3s ease-in-out;
}
.at-guppytooltip > em:after{
	left: 0;
    right: auto;
    border-left: 0;
    border-right: 10px solid transparent;
	width: 0;
    height: 0;
    border-top: 8px solid var(--secguppycolor);
    content: "";
    position: absolute;
    top: 100%;
}
.at-guppytooltip:hover em{
	opacity: 1;
    visibility: visible;
    transform: scale(1);
}
.at-chat_formwrapper{
	padding: 10px 20px;
}
.at-btn.at-btnsm{
	    background: #22C55E !important;
    height: 32px;
    font-size: 12px;
    line-height: 20px;
    min-width: 115px;
    font-weight: 700;
    padding: 0 5px;
}
.at-btn.at-btnplain {
    height: 32px;
    background: #EF4444 !important;
     min-width: 115px;
    font: 700 12px var(--primchatfont);
    padding: 0 15px;
}
.at-btn.at-btnplain i {
	display:inline-block;
	margin:  0 0 0 6px;
	font-size:12px;
}
.at-btnareasetting{
    display: flex;
    flex-wrap: nowrap;
    justify-content: center;
    gap: 10px;
}
.at-btn-block{
	width: 100%;
}
.at-switchbtn{
	display: flex;
    align-items: center;
}
.at-rightswitcharea {
	display: flex;
    align-items: center;
}
.at-rightswitcharea i {
	display: flex;
	align-self: center;
	color: #999999;
	font-size: 21px;
	margin:   0 13px 0 0;
}
.at-switchbtn input[type=checkbox] {
     position: relative;
    width: 38px;
    height: 20px;
    border: 1.5px solid #ddd;
    -webkit-appearance: none;
    background: #fff;
    background-color: #fff;
    outline: none;
    cursor: pointer;
    border-radius: 20px;
    transition: background 300ms linear;
}
.at-switchbtn input[type=checkbox]::before {
 position: absolute;
    content: "";
    width: 24px;
    height: 24px;
    top: -4px;
    left: -5px;
    border-radius: 20px;
    background-color: #ddd;
    box-shadow: 0 2px 5px rgb(0 0 0 / 20%);
    transition: left 300ms;
}
.at-switchbtn input[type=checkbox]::after{
	opacity: 0 !important;
}
.at-switchbtn input[type=checkbox]:checked {
    background-color: #fff;
    border: 1.5px solid #4dcf7d;
}
.at-switchbtn input[type=checkbox]:checked::before {
    left: 15px;
    background-color: #4dcf7d;
}
.at-dropboxv2 .at-viewuploadimg {
	width: 100%;
	flex-direction: row;
}
.at-dropboxv2 .at-viewuploadimg img {
	    margin: 0 10px 0 0;
}
.at-form-group .at-dropboxv2 {
	padding: 10px;
}
.at-dropboxv2 .at-viewuploadimg .at-uploadarea h6{
	text-align: left;
	margin:0;
}
.at-dropboxv2 .at-viewuploadimg .at-btnareasetting{
    justify-content: flex-start;
	flex-wrap: wrap;
}
.sv-newslots{
    position: relative;
    z-index: 0;
    border-radius: 10px;
	border: 0 !important;
    padding: 20px;
    width: 100%;
}
.sv-newslots svg{
	position: absolute;
	fill: transparent;
	stroke: #ddd;
	top: 0;
	left: 0;
	right: 0;
	margin: auto;
	overflow: visible;
	z-index: -1;
	padding: 0 1px;
	width: 100%;
	height: 100%;
}
.sv-newslots svg rect{
	stroke-width: 1px;
	stroke-dasharray: 10, 10;
	rx: 10px;
}
.sv-newslots .at-viewuploadimg img{
	max-width: 90px;
	height: 90px;
}
.at-settingbtns{
	justify-content: space-between;
	display: flex;
}
.at-settingbtns .at-rightswitcharea{
	max-width: 49%;
    background: #FFFFFF;
    border: 1.5px solid #DDDDDD;
    border-radius: 4px;
    padding: 5px 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
	cursor: pointer;
}
.at-settingbtns .at-rightswitcharea i {
	margin-bottom: 6px !important;
	font-size:24px;
	margin: 0;
}
.at-logout i {
	color:#EF4444;
}
.at-mute i {
	color:#22C55E;
}
.at-muted i {
	color:#999999;
}
</style>