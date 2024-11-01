<template>
    <div class="gp-whatsappchatfloat">
        <div class="gp-sidebarhead">
            <h2>{{TRANS.whatsap_list_title}}</h2>
            <p v-html="whatsappText"></p>
            <whatsapp-image ImageColor="lightGreen" />
        </div>
        <div id="friendlist" class="gp-userlist_tab">
            <div class="gp-sidebarhead_search">
                <div class="gp-form-group">
                    <i class="guppy-search"></i>
                    <input type="search" v-model="search" @input="userSearch()" class="gp-form-control" :placeholder="TRANS.search" />
                </div> 
            </div>
            <div class="gp-willrespond">
                <span>{{TRANS.list_respond_text}}</span>
            </div>
            <ul v-if="Object.keys(whatsappList).length" @scroll.prevent="userListScrollHandler($event)" class="gp-conversation-list">
                <li @click.prevent="openConversation( whatsappUser )" class="gp-userbar gp-whatsapp-user" :class="{'active' : whatsappUser.chatId == chatInfo.chatId, 'gp-notavailable' : !whatsappUser.isOnline}" v-for="(whatsappUser, index ) in whatsappList" :key="index + '_' + Math.floor(Math.random() * 99999999)" >
                    <figure class="gp-userbar_profile gp-profileuserstatus">
                        <span class="gp-userstatus" :class="whatsappUser.isOnline ? 'online' : 'offline'"></span>
                        <img :src="whatsappUser.userAvatar ? whatsappUser.userAvatar : defaultAvatar" :alt="whatsappUser.userName">
                    </figure>
                    <div class="gp-userbar_title">
                        <em v-if="whatsappUser.userDesignation">{{whatsappUser.userDesignation}}</em>
                        <h3 v-if="whatsappUser.userName">{{ whatsappUser.userName | capitalize }}</h3>
                        <p v-if="whatsappUser.startTime && whatsappUser.endTime"><span> {{whatsappUser.startTime}} - {{whatsappUser.endTime}}</span> <span v-if="whatsappUser.GMTTimezone">( <b>GMT&nbsp;{{whatsappUser.GMTTimezone}} hrs </b> ) </span> </p>
                        <p v-else>{{TRANS.offline}}</p>
                    </div>
                    <div class="gp-userbar_right">
                        <a href="javascript:void(0);" class="gp-whatsappbtn">
                            <whatsapp-image />
                        </a>
                    </div>
                </li>
                <guppy-chat-inner-loader v-if="isLoading"/>
            </ul>
            <template v-else>
                <guppy-chat-loader v-if="isLoading"/>
                <guppy-chat-empty-view v-else :isSidebarProps="true" listIcon="guppy-user-plus"/> 
            </template>
        </div>
    </div>
</template>

<script>
import { GUPPYCHAT_CONSTANTS, GUPPYCHAT_SETTINGS } from "../../../resources/constants";
import GuppyChatEmptyView from "../../EmptyViews/GuppyChatEmptyView.vue";
import GuppyChatLoader from "../../GuppyChatLoader/GuppyChatLoader.vue";
import GuppyChatInnerLoader from "../../GuppyChatLoader/GuppyChatInnerLoader.vue";
import RestApiManager from "../../../resources/RestApiController";
import WhatsappImage from "./WhatsappImage.vue";
import moment from 'moment-timezone';
import jQuery from "jquery";
import { mapState } from 'vuex';
export default {
    name : "GuppyChatWhatsappUserList",
    components:{
        GuppyChatEmptyView,
        GuppyChatLoader,
        GuppyChatInnerLoader,
        WhatsappImage
    },
    data(){
        return{
            defaultAvatar : GUPPYCHAT_CONSTANTS.AVATAR,
            search      : '',
            timer : null,
        }
    },
    computed :{
        whatsappText : function (){
            let text = GUPPYCHAT_SETTINGS.translations.whatsapp_support_desc;
            let convName = '<span>'+GUPPYCHAT_SETTINGS.translations.conversation_name_txt+'</span>';
            return text.replace('{{conversation_name}}', convName);
        },
        ...mapState({
            whatsappList          : state => {
                let userList = state.whatsappList
                if(Object.keys(userList).length){
                    let utcDate         = moment.utc().format('YYYY-MM-DD HH:mm:ss'); // in utc
                    let utcCutoff       = moment.utc(utcDate, 'YYYYMMDD HH:mm:ss');
                
                    return Object.values(userList).map( whatsappUser => {
                        let timeZoneDate    = utcCutoff.clone().tz(whatsappUser.usertimeZone);
                    
                        let timeZoneDay     = timeZoneDate.format('dddd').toLowerCase(); 
                        let currentDate     = timeZoneDate.format('YYYY-MM-DD');
                        let currentDatetime = timeZoneDate.format('YYYY-MM-DD HH:mm:ss');
                        
                        let currentDay      = whatsappUser.availableTime[timeZoneDay];
                        let isOnline        = false;
                        let GMTTimezone     = 0;
                        if(currentDay){
                            
                            let startDateTime   = `${currentDate} ${currentDay['start_time']}`;
                            let endDateTime     = `${currentDate} ${currentDay['end_time']}`;
                                isOnline        = moment(currentDatetime).isBetween( startDateTime, endDateTime );

                            let currentTimeZone     = moment.tz.guess();
                            let currentUtcCutoff    = utcCutoff.clone().tz(currentTimeZone, true);

                            let userTimeZoneCutOff      = Number(timeZoneDate.format('Z').split(':')[0]);
                            let currentTimeZoneCutOff   = Number(currentUtcCutoff.format('Z').split(':')[0]);

                            let timeZoneDiff    = currentTimeZoneCutOff - userTimeZoneCutOff;
                                GMTTimezone     = timeZoneDiff * (-1);

                            let currentZoneDate     = currentUtcCutoff.format('YYYY-MM-DD');
                            let _startDateTime      = `${currentZoneDate} ${currentDay['start_time']}`;
                            let _endDateTime        = `${currentZoneDate} ${currentDay['end_time']}`;
                            
                            let displayFormat       = 'hh:mm a';

                            let startTime  = moment(_startDateTime).format(displayFormat);
                            let endTime    = moment(_endDateTime).format(displayFormat);
                            
                            whatsappUser.startTime  = startTime;
                            whatsappUser.endTime    = endTime;


                        }
                        whatsappUser.isOnline = isOnline
                        whatsappUser.GMTTimezone = GMTTimezone
                        return whatsappUser
                    });
                } else {
                    return []
                }
            },
            whatsappListFlag      : state => state.whatsappListFlag,
            whatsappListOffset    : state => state.whatsappListOffset,
            noMoreWhatsappUsers   : state => state.noMoreWhatsappUsers,
            whatsappUserSearch    : state => state.whatsappUserSearch,
            chatInfo              : state => state.chatInfo,
            userProfile           : state => state.userProfile,
        })
    },
    methods:{
        showWidget(){
            this.$root.$emit('showWidget');
        },
        userSearch(){
            this.$store.commit('updateRecordList', {RecordList: 'noMoreWhatsappUsers', RecordListValue: false});
            this.isScrolling = false;
            clearTimeout(this.timer); 
            this.timer = setTimeout(()=>{
                this.updateListRecord( {} );
                this.$store.commit('updateOffset', {offset:'whatsappListOffset', offsetValue: 0});
                this.$store.commit('updateSearch', {search:'whatsappUserSearch', searchValue: this.search});
                this.getUsersList();
                this.updateOffset();
            }, 800)
        },
        async getUsersList(){
            if ( !this.noMoreWhatsappUsers ) {
                this.isLoading = true;
                let response = await RestApiManager.getWhatsappUserList(this.whatsappListOffset, this.search)
                this.isLoading = false;
                if( response.data.type == "success" ) {
                    let currentMoreRecord = Object.keys(response.data.userList).length == 0 ? true : false;
                    this.$store.commit('updateRecordList', {RecordList: 'noMoreWhatsappUsers', RecordListValue: currentMoreRecord});
                    if( !this.whatsappListFlag ) {
                        this.$store.commit('updateListFlag', {flag: 'whatsappListFlag', flagValue:true});
                    }
                    this.updateListRecord( response.data.userList )
                } else if(response.data.type == "error"){
                    this.alertBox('error', this.TRANS.error_title, response.data.message_desc);
                }
            }
        },
        updateOffset(){
            let currentOffset = this.whatsappListOffset + this.RecordLimit;
            this.$store.commit('updateOffset', {offset:'whatsappListOffset', offsetValue: currentOffset});
        },
        // Handles user list scroll
        userListScrollHandler(elem) {
            if ( (elem.target.offsetHeight + elem.target.scrollTop) + 1 >= elem.target.scrollHeight ) {
                this.isScrolling = true;
                this.getUsersList();
                this.updateOffset();
            }
        },
        openConversation( params ){
            let width = jQuery('.gp-chat').width();
            if ( width <= 768){
                jQuery('.gp-chat').addClass("gp-opnchatbox")
            }
            this.$store.commit('updateChatInfo', { data: params, userClick : true });
            this.$root.$emit('toggleSignInWindow', false);
        },
        updateListRecord( recList ){
            let data = {
                'list'      : recList,
                'listType'  : 'whatsappList',
                'isScrolling' : this.isScrolling
                }
            this.$store.commit('updateTabListRecord', data)
            setTimeout(()=>{
                jQuery('.gp-users-list .gp-conversation-list').addClass('active');
            },200)
        },
    },
    created(){
        if(!Object.keys(this.whatsappList).length || !this.whatsappListFlag ){
            this.getUsersList();
            this.updateOffset();
        }
    },
    mounted(){
        this.search = this.whatsappUserSearch;
    }

}
</script>
<style>
.gp-closechat{
    margin-left: auto;
    color: #fff;
    font-size: 28px;
    text-decoration: none;
}
.gp-userbar_title {
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 15px;
}
.gp-userbar_title > em{
    display: block;
    margin: 0 0 2px;
    color: #3C57E5;
    font-size: 14px;
    font-weight: 600;
    line-height: 22px;
    font-style: normal;
    
}
.gp-userbar_title h3{
    font-size: 16px;
    line-height: 19px;
    white-space: nowrap;
    overflow: hidden;
    margin: 0;
    text-overflow: ellipsis;
}
.gp-userbar_title > p{
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    font-size: 14px;
    align-items: center;
    line-height: 22px;
    color: var(--secwhatsappcolor);
}
.gp-floatchat_title-right a i{display: block;}
.gp-userbar_title > p span{
    margin: 0;
    line-height: 22px;
    color: var(--terwhatsappcolor);
}
.gp-userbar_title > p em{
    font-style: normal;
    line-height: 22px;
}
.gp-whatsappbtn{
    display: flex;
    align-items: center;
    border-radius: 60px;
    padding:  8.5px 14.5px;
    border: 1.5px solid var(--primguppycolor);
}
.gp-whatsappbtn svg path{fill: var(--primguppycolor);}
.gp-whatsappbtn svg{
    margin-right: 10px;
}
.gp-whatsappbtn span{
    color: var(--secwhatsappcolor);
    font: 700 13px/20px var(--primchatfont);
}
.gp-userlist_tab {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 70px);    
}
.gp-inner-loaader{
    bottom: 0;
}
.gp-sidebarhead {
	z-index: 2;
	padding: 20px;
	display: flex;
	align-items: center;
	position: relative;
    background: var(--primguppycolor);
}
.gp-sidebarhead > img {
	margin-right: 10px;
	border-radius: 50% !important;
	width: 50px;
	height: 50px;
}
.gp-whatsappsidepopup{
  position: relative;
  z-index: 9999999;
  color: var(--secwhatsappcolor);
  font: 400 14px/26px  var(--terwhatsappcolor);
}
.gp-sidebarhead > h2 {
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
.gp-userlist_tab li.gp-userbar:last-child {
    margin-bottom: 40px;
}

.gp-sidebarhead>a:hover{color: #fff;}
.gp-sidebarhead_search {
  width: 100%;
  position: relative;
  padding: 20px;
  background: #ffffff;
  align-self: flex-start;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  border-bottom: 1px solid #ddd;
}
.gp-sidebarhead_search h3 {
  font-size: 18px;
  line-height: 26px;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  width: 100%;
  margin: 0 0 10px;
}
.gp-sidebarhead_search .gp-form-group i {
  position: absolute;
  left: 18px;
  font-size: 18px;
  color: var(--terwhatsappcolor);
}
.gp-sidebarhead_search .gp-form-group {
    padding: 0;
    display: flex;
    align-items: center;
    position: relative;
    width: 100%;
}
.gp-sidebarhead_search .gp-form-group input {
    font-size: 14px;
    padding-left: 45px;
    width: 100%;
    height: 40px;
    outline: none;
    border-radius: 3px;
}
.gp-userlist_tab ul {
  height: calc(100% - 116px);
  flex-direction: column;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow-y: auto;
}
.gp-userlist_tab li {
  list-style-type: none;
  width: 100%;
  margin: 0;
}
.gp-userbar {
  padding: 20px !important;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
}
.gp-userbar_profile {
    flex: none;
    width: 100%;
    max-width: 50px;
    height: 50px;
    border-radius: 50%;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f7f7f7;
    transition: all 0.3s ease-in-out;
    position: relative;
}
.gp-userbar_profile img {
  width: 100%;
  margin: 0 auto;
  height: 50px;
  display: block;
  object-fit: cover;
  border-radius: 50px !important;
}
.gp-userstatus {
    font-size: 14px;
    line-height: 26px;
    letter-spacing: 0.01em;
    display: inline-flex;
    vertical-align: middle;
    align-items: center;
    right: 0;
    bottom: 0;
    z-index: 1;
    position: absolute;
}
.gp-userstatus::before {
    content: '';
    margin: 0;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    display: inline-block;
}
.gp-userbar_profile .gp-userstatus:before {
    margin: 0;
    width: 14px;
    height: 14px;
    border: 3px solid #fff;
}
.gp-userstatus.online:before {
  background-color: #22C55E;
}
.gp-userstatus.offline:before {
  background-color: #ddd;
}
.gp-userstatus.away:before {
  background-color: #EAB308;
}
.gp-userstatus.notify:before {
  background-color: #FF7300;
}
.gp-userbar.gp-notavailable {
    mix-blend-mode: luminosity;
}
.gp-userbar_right {
  text-align: right;
  margin-left: auto;
  flex: none;
  padding-left: 10px;
}
.gp-userbar_right a{text-decoration: none !important;}
.gp-userbar_right > span {
  display: block;
  font-size: 14px;
  line-height: 24px;
  color: var(--terwhatsappcolor);
}
.gp-userlist_tab li + li {
    border-top: 1px solid #ddd;
}

@media (max-width: 420px){
    .gp-whatsappbtn{
        padding: 13.5px;
    }
    .gp-whatsappbtn span{
        display: none;
    }
    .gp-whatsappbtn svg{
        margin: 0;
    }
}
/* NEWWIDGET */
.gp-willrespond{
    background: #F7F7F7;
    box-shadow: inset 0px -1px 0px #eeeeee;
    padding: 10px 20px;
    display: flex;
    justify-self: center;
    align-items: center;
    text-align: center;
    width: 100%;
}
.gp-willrespond span{
    color: #999999;
    font-size: 13px;
    line-height: 18px;
    font-weight: 600;
    display: inline-block;
    font-family: var(--secchatfont);
    width: 100%;
    text-align: center;
}
.gp-users-list::after{
        position: absolute;
        content: '';
        right: 48px;
        display: inline-block;
        z-index: 1111;
        width: 0;
        height: 0;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-top: 10px solid #fff;
        box-shadow: inset 1px -1px 0px #EEEEEE;
     
}
.gp-users-list .gp-sidebarhead_search{
    box-shadow: inset 0px -1px 0px #eeeeee;
    border: 0;
}
.gp-users-list .gp-conversation-list{
    padding:20px;
    height: calc(100% - 235px);
}
.gp-users-list  .gp-chat_sidebar{
    border-radius:0 0 10px 10px;
    display: block !important;
}
.gp-users-list .gp-conversation-list li {
    border-radius: 0px 10px 10px 0px;
    border: 1px solid #EEEEEE;
    padding: 16px 20px !important;
    box-shadow: 0px 4px 6px rgb(0 0 0 / 0) ,inset 3px 0px 0px #25d366;
    transition: all .300s ease-in-out;
    -webkit-transition: all 0.3s;
    -moz-transition: all 0.3s;
    -o-transition: all 0.3s;
    transition: all 0.3s;
    opacity: 0;
    -webkit-transform: translateY(-10px);
    -moz-transform: translateY(-10px);
    -ms-transform: translateY(-10px);
    -o-transform: translateY(-10px);
    transform: translateY(-10px);
    position: relative;
}
.gp-users-list.active {
  max-height: 600px;
 -webkit-transition: all 0.5s;
  -moz-transition: all 0.5s;
  -o-transition: all 0.5s;
  transition: all 0.5s;
}
.gp-conversation-list.active li {
  opacity: 1;
  -webkit-transform: translateY(0px);
  -moz-transform: translateY(0px);
  -ms-transform: translateY(0px);
  -o-transform: translateY(0px);
  transform: translateY(0px);
}
.gp-conversation-list.active li:nth-of-type(1) {
  transition-delay: 0.3s;
}
.gp-conversation-list.active li:nth-of-type(2) {
  transition-delay: 0.6s;
}
.gp-conversation-list.active li:nth-of-type(3) {
  transition-delay: 0.7s;
}

.gp-conversation-list.active li:nth-of-type(4) {
  transition-delay: 0.8s;
}

.gp-conversation-list.active li:nth-of-type(5) {
  transition-delay: 0.9s;
}
.gp-users-list .gp-conversation-list li:hover{
    box-shadow:0px 4px 6px rgb(0 0 0 / 7%), inset 3px 0px 0px #25D366 ;
}
.gp-users-list .gp-conversation-list li + li {
    margin: 10px 0 0;
}
.gp-users-list .gp-userbar_title h3 {
    font-size: 16px;
    line-height: 19px;
}
.gp-users-list .gp-userbar_title > em {
    display: block;
    margin: 0 0 2px;
    color: #3C57E5;
    font-size: 13px;
    font-weight: 600;
    line-height: 17px;
}
.gp-users-list .gp-userbar_title > p span {
    font-size:13px;
    margin: 2px 0 0;
    line-height: 18px;
    font-weight: 600;
    font-family: var(--secchatfont);
}
.gp-users-list .gp-whatsapp-user .gp-userbar_right .gp-whatsappbtn {
    background: var(--primguppycolor);
    width: 44px;
    border-radius: 50%;
    line-height: 44px;
    height: 44px;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;

}
.gp-users-list .gp-whatsapp-user .gp-userbar_right .gp-whatsappbtn svg{
    margin:0;
}
.gp-users-list .gp-whatsappbtn svg path {
    fill: #ffffff;
}
.gp-users-list .gp-conversation-list li.gp-notavailable .gp-userbar_right .gp-whatsappbtn{
    background:#ffffff;
    border: 2px solid #EEEEEE;
}
.gp-users-list .gp-conversation-list li.gp-notavailable{
    background: #F7F7F7;
    mix-blend-mode: normal;
    box-shadow: 0px 4px 6px rgb(0 0 0 / 0%), inset 3px 0px 0px #999999;
}
.gp-users-list .gp-conversation-list li.gp-notavailable figure {
    mix-blend-mode: luminosity;
}
.gp-singleimg.gp-notavailable img{
    filter: grayscale(1);
}
.gp-users-list .gp-conversation-list li.gp-notavailable:hover{
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.07), inset 3px 0px 0px #999999;
}
.gp-users-list .gp-conversation-list li.gp-notavailable svg path {
    fill: #999999;
}
.gp-users-list .gp-userstatus.offline:before {
    background-color: #999999;
}
.gp-users-list  .gp-userbar_title {
    margin-left: 10px;
}
.gp-users-list .gp-conversation-list li.gp-notavailable .gp-userbar_title > em {
    color: #3C57E5;
     font-family: var(--secchatfont);
}
.gp-users-list .gp-sidebarhead {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px 20px 16px 67px;
    border-radius: 10px 10px 0 0;
}
.gp-users-list .gp-sidebarhead svg {
    position: absolute;
    left: 0;
    opacity: 0.5;
}
.gp-users-list .gp-sidebarhead > h2 {
    margin: 0 0 4px;
    font-size:20px;
    line-height:22px;
    white-space: normal;
}
.gp-users-list .gp-sidebarhead p{
    font-size: 15px;
    line-height: 22px;
    color: #fff;
    font-weight: 400;
    width: 90%;
    margin: 0;
}
.gp-users-list .gp-sidebarhead p span {
    font-weight: 700;
}
.gp-chatsidebar_float.gp-users-list{
    max-width: 400px;
    border-radius: 10px;
    top: 20vh;
    height: auto;
    bottom: 146px;
}
.gp-users-list .gp-userlist_tab {
   height: calc(100% - 55px);
}
.gp-users-list .gp-whatsappchatfloat{
     width: 100%;
    height: 100%;
}
.gp-users-list .gp-userlist_tab li.gp-userbar:last-child {
    margin-bottom: 0;
}
.gp-chatsidebar_float:not(.gp-widgetclose) + .gp-chatfloatholder .gp-chatfloat.gp-layouttwo{
    visibility: visible;
    opacity: 1;
    display: block;
    height: 100%;
}
.gp-chatfloat.gp-layouttwo > span a{
    text-decoration: none;
    width: 67px;
    height: 67px;
}
.gp-chatfloat.gp-layouttwo > span a i{
    color: #ffffff;
}
.gp-chatfloatholder.gp-floatholdertwo{
    right: 40px;
}
.gp-floatholdertwo .gp-floatchat_content {
        border-radius: 20px 20px 0 0;
}
.gp-floatholdertwo .gp-floatchat_titlev2{
    border-radius: 20px 20px 0 0;
}
.gp-floatholdertwo .gp-floatchat_titlev2 .gp-singleimg .gp-userstatus {
    outline: 3px solid #128C7E;
    border-width: 0;
}
.gp-floatholdertwo .gp-floatchat {
    right: 450px;
}
/* otherlayout */
.gp-layout-one .gp-conversation-list {
    padding: 0;
    height: calc(100% - 152px);
}
.gp-layout-one .gp-conversation-list::-webkit-scrollbar {
    width: 3px;
}

 .at-empty-conversation svg {
    margin:  0 0 20px;
}
.gp-layout-one .gp-users-list .gp-conversation-list li + li {
    margin: 0;
    bottom: 0;
    border-radius: 0;
}
.gp-layout-one .gp-users-list .gp-conversation-list li.gp-notavailable{
    box-shadow:none;
    border-radius: 0;
}
.gp-layout-one .gp-users-list .gp-conversation-list li {
    padding: 20px !important;
    box-shadow: none;
    border-radius: 0;
    z-index: 1;
}
.gp-layout-one .gp-users-list .gp-sidebarhead {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px 20px 16px 52px;
}
.gp-layout-one .gp-users-list .gp-sidebarhead > h2 {
    margin: 0;
}
.gp-layout-one .gp-users-list .gp-conversation-list li.gp-notavailable .gp-userbar_right .gp-whatsappbtn{
    background:#ffffff;
}
.gp-needchat{
    display: flex;
    padding: 10px 20px;
    align-items: center;
    box-shadow: 0px 2px 4px rgb(40 41 61 / 4%), 0px 8px 16px rgb(96 97 112 / 16%);
    border-radius: 10px 10px 0px 0px;
    cursor: pointer;
}
.gp-needchat svg{
    width: 24px;
    height: 24px;
    margin: 0 10px 0 0;
}
.gp-needchat h6{
    font-weight: 700;
    font-size: 15px;
    line-height: 20px;
    color:#ffffff !important;
}
.gp-layout-one .gp-chatfloatholder{
    bottom: 0;
    right: 20px;
}
.gp-layout-one .gp-chatsidebar_float.gp-users-list {
    top: 20vh;
    height: auto;
    bottom: 73px;   
}
.gp-opnchatbox .gp-whatsappside-responsive.gp-opnchatbox .gp-chat_sidebar {
    display: block !important;
}
.gp-whatsappside-responsive:not(.gp-layout-one) .gp-users-list.gp-chatsidebar_float.gp-users-list {
    max-width: 100%;
    bottom: 0;
    top: 0;
    left: 0;
    z-index: 99999;
}
.gp-whatsappside-responsive:not(.gp-layout-one) .gp-users-list .gp-sidebarhead{
    border-radius: 0;
}
.gp-whatsappside-responsive .gp-layout-one .gp-chatsidebar_float.gp-users-list{
    right: 20px;
    width: 90%;
}
.gp-layout-one .gp-whatsappside-responsive.gp-opnchatbox .gp-chat_sidebar{
    display: block !important;
}
.gp-whatsappside-responsive .gp-users-list::after {
    position: absolute;
    content: '';
    right: 4px;
    bottom: -7px;
}
.gp-whatsappside-responsive .gp-users-list .gp-sidebarhead {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px 20px 16px 50px;
}
.gp-whatsappside-responsive:not(.gp-layout-one) .gp-sidebarhead > h2 {
    margin: 0 0 4px;
    font-size: 16px;
    line-height: 17px;
}
.whatsappside-responsive .gp-users-list .gp-conversation-list {
    height: calc(100% - 265px);
}
.gp-closeremovechat{
     position: absolute;
    right: 20px;
    text-decoration: none;
    display: inline-block;
    top: 20px;
}
.gp-closeremovechat i{
    color:#fff;
    font-size:25px;
}
.gp-layout-one.gp-layout-overlay {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    background: rgb(0 0 0 / 50%);
}
.gp-layout-one.gp-whatsappside-responsive .gp-users-list::after {
    position: absolute;
    content: '';
    right: 34px;
    bottom: -7px;
}
.gp-users-list.gp-chatsidebar-widgetclose.gp-chatsidebar_float {
    opacity: 0;
    right: 0;
    bottom: 0;
    visibility: hidden;
    transform: scale(0);
    transition: all .3s ease-in-out;
}
.gp-layout-one.gp-opnchatbox .gp-users-list {
    display: none;
}
.gp-layout-one.gp-whatsappside-responsive .gp-floatchat {
    right: 20px;
}
.gp-whatsappside-responsive .gp-whatsappchat-responsive .gp-message[data-v-42308e4f] {
    max-width: 290px;
}
.wpguppy-rtl.gp-layout-one .gp-needchat svg{
    margin-left: 10px;
    margin-right: 0;
}
.wpguppy-rtl.gp-layout-one .gp-users-list {
    left: 20px;
    right: auto;
}
.wpguppy-rtl.gp-layout-one  .gp-users-list::after {
    right: auto;
    left: 48px;
}
.wpguppy-rtl.gp-layout-one.gp-whatsappside-responsive .gp-floatchat {
    left: 20px;
    right: auto;
}
.wpguppy-rtl.gp-layout-one  .gp-iconclosered {
    justify-content: flex-start;
}
.wpguppy-rtl .gp-chatsidebar_float.gp-users-list {
    right: auto;
    left: 20px;
}
.wpguppy-rtl .gp-floatholdertwo .gp-floatchat {
    left: 450px;
    right: auto;
}
.wpguppy-rtl.gp-layout-one.gp-whatsappside-responsive .gp-chatfloatholder {
    right: auto;
    left: 44px;
}
.wpguppy-rtl .gp-users-list .gp-sidebarhead svg {
    right: 20px;
    left: auto;
}
/* .gp-layout-one.wpguppy-rtl .gp-users-list .gp-sidebarhead svg{
    right: 20px;
    transform: translate(0%, -50%);
} */
.wpguppy-rtl .gp-users-list .gp-sidebarhead svg{
    right: 0;
    transform: rotate(180deg);
}
.gp-layout-one.wpguppy-rtl .gp-floatchat {
    right: auto;
    left: 443px;
}
.gp-layout-one.wpguppy-rtl  .gp-widgetclose ~ .gp-chatfloatholder .gp-floatchat {
    right: auto;
    left: 299px;
}
.wpguppy-rtl  .gp-users-list .gp-sidebarhead {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px 67px 16px 20px;
}
.wpguppy-rtl  .gp-floatholdertwo .gp-floatchat_title h2{
    padding-left: 20px;
    padding-right: 0;
}
.wpguppy-rtl .gp-users-list .gp-closeremovechat {
    left: 20px;
    right: auto;
}
.wpguppy-rtl .gp-users-list  .gp-whatsappchat-responsive .gp-userinfo_title_img[data-v-42308e4f]{
    margin-right: 0 !important;
    margin-left: 10px !important;
}
.wpguppy-rtl .gp-users-list  .gp-backtolist[data-v-42308e4f] {
    margin-left: 15px;
    margin-right: 0;
    transform: rotate(180deg);
}
.gp-layout-one .gp-widgetclose ~ .gp-chatfloatholder .gp-floatchat {
    right: 275px;
}

@media (max-width: 480px){
    .gp-users-list .gp-userbar_title > em,
    .gp-users-list .gp-userbar_title > p span{
        font-size: 12px;
    }
    .gp-layout-one.gp-whatsappside-responsive .gp-chatsidebar_float {
        max-width: 340px;
    }
    .gp-layout-one .gp-users-list .gp-sidebarhead > h2{
        font-size: 16px;
    }
    .gp-layout-one .gp-users-list .gp-conversation-list li {
        padding: 10px !important;
    }
    .gp-layout-one .gp-userbar_title h3 {
        font-size: 16px;
        line-height: 17px;
    }
    .gp-layout-one .gp-userbar_profile img {
        height: 40px;
    }
    .gp-layout-one  .gp-userbar_profile {
        max-width: 40px;
        height: 40px;
    }
    .gp-layout-one.gp-whatsappside-responsive .gp-floatchat{
        width: calc(100% + -40px);
    }
    .wpguppy-rtl.gp-layout-one.gp-whatsappside-responsive .gp-floatchat {
        left: 20px;
        right: auto;
    }
}
@media (max-width: 360px){
.gp-layout-one.gp-whatsappside-responsive .gp-floatchat {
    max-width: 290px;
}
.gp-layout-one .gp-conversation-list {
    padding: 0;
    height: calc(100% - 172px);
}
.at-chatsidebar_float {
    max-width: 296px;
}
.wpguppy-rtl.gp-layout-one .gp-users-list{
    left: 10px;
    right: auto;
    max-width: 290px;
}
.gp-sidebarhead_search{padding: 10px;}
.gp-layout-one.gp-whatsappside-responsive .gp-chatsidebar_float {
    max-width: 290px;
}
}
</style>