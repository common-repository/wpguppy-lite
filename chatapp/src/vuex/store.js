import Vue from 'vue';
import Vuex from 'vuex';
import Pusher from 'pusher-js';
import jQuery from "jquery";
import GuppyChatManager from "../resources/controller";
import SocketioService from '../services/socketio.service';
import { GUPPYCHAT_CONSTANTS } from "../resources/constants";
import RestApiManager from "../resources/RestApiController";

import dateFormat from "dateformat";
import moment from "moment";

import { GUPPYCHAT_SETTINGS } from "../resources/constants";
Vue.use(Vuex)

var canType = true;
var throttleTime = 1500;

export default new Vuex.Store({
  state: {
    chatInfo : {},
    // admin support user list properties
    adminSupportUserListFlag  : false,
    adminSupportUserListOffset: 0,
    noMoreAdminSupportUsers   : false,
    adminSupportUserSearch    : '',
    adminSupportUserList      : {},
    // admin support chat list properties
    adminSupportChatsFlag     : false,
    adminSupportChatsOffset   : 0,
    noMoreAdminSupportChats   : false,
    adminSupportChatsSearch   : '',
    adminSupportChats         : {},
    adminSupportChatCount     : 0,
    
    // private chat properties
    privateChatOffset       : 0,
    noMorePrivateChat       : false,
    privateConvFlag         : false,
    privateChatSearch       : '',
    privateConversation     : {},
    privateChatCount        : 0,

    // contacts list properties
    contactListFlag         : false,
    contactListOffset 	    : 0,
    noMoreContactUsers      : false,
    contactUserSearch       : '',
    contactList             : {},

    // requests list properties
    requestListFlag         : false,
    requestListOffset 	    : 0,
    noMoreRequesttUsers     : false,
    requestUserSearch       : '',
    requestList             : {},
    requestCount            : 0,

    // friend list properties
    friendListFlag          : false,
    friendListOffset 	      : 0,
    noMoreFriendUsers       : false,
    friendUserSearch        : '',
    friendList              : {},

    // Block user list properties
    blockListFlag           : false,
    blockListOffset 	      : 0,
    noMoreBlockUsers        : false,
    blockUserSearch         : '',
    blockList               : {},
    // Whatsapp list properties
    whatsappListFlag        : false,
    whatsappListOffset 	    : 0,
    noMoreWhatsappUsers     : false,
    whatsappUserSearch      : '',
    whatsappList            : {},

    windowWidth             : 0,
    userId                  : window.wpguppy_scripts_vars.userId, // current loggedin user id
    userType                : window.wpguppy_scripts_vars.userType,
    isSupportMember         : window.wpguppy_scripts_vars.isSupportMember,
    FriendsOffset 		      : 0,
    BlocksOffset 		        : 0,
    isScrollList 		        : false,
    pusher 		              : false,
    noMoreFriends           : false,
    invitationResp          : false,
    ReceiveInvitation       : false,
    userFriendFlag          : false,
    userBlockFlag           : false,
    autoInvite              : true,
    isEmptyView             : true,
    isOpenMessagesScr       : false,
    isMessangerChat         : false,
    isWhatsappChat          : false, 
    isMobileView            : false, 
    userResponseData        : '',
    unseenMsgCount          : '',
    userProfile             : '',
    quoteMessageId 		      : {},
    widgetChatMessageInput  : {},
    messageInput            : '',
    friendSearch            : '',
    activeTab               : 'users',
    messagesList            : {},
    selectedChatId          : '',
    isfloatingChat          : false
  },
  getters: {
    // put sychronous functions for changing state e.g. add, edit, delete
    getTotalUnreadCount: (state) => {
      let privateCount      = state.privateChatCount
      let adminSupportChatCount = state.adminSupportChatCount;
      let requestCount      = state.requestCount;
      return Number(privateCount) + Number(adminSupportChatCount) + Number(requestCount);
    },
    getMessageInput : ( state ) => ( chatId ) => {
      if(state.isMessangerChat){
        return state.messageInput
      } else if( chatId ){
        return state.widgetChatMessageInput[chatId]
      }
    },
    typingUsersIndicatorText : ( state ) => ( chatId ) => {
      let chatInfo = '';
      if(state.isMessangerChat){
        chatInfo = state.chatInfo
      } else if( chatId ){
        chatInfo = state.chatInfo[chatId];
      }

      let existKey  = 'typingUsers' in chatInfo
      let indicator = '', typingUsers = '', tUsers = 0;
      if(existKey){
        let users   = chatInfo.typingUsers;
            tUsers  = users.length;
        if( tUsers ){
            let selectUsers = users.slice(0,3);
            
            if( tUsers == 1 ){
              indicator   = 'isTypingText';
              typingUsers = selectUsers[0];
            } else if( tUsers == 2 || tUsers == 3 ){
              indicator   = 'areTypingText';
              typingUsers = selectUsers.join(', ');
            } else {
              indicator = 'moreTypingText';
              typingUsers = selectUsers.join(', ');
            }
        }
      }
      return { indicator, typingUsers , tUsers};
    },
    isDisabledFooter : ( state ) => ( chatId ) => {
      let chatInfoId = '';
      if(state.isMessangerChat){
        chatInfoId = state.chatInfo.chatId
      } else if( chatId ){
        chatInfoId = chatId;
      }
      if ( state.messagesList[chatInfoId] ) {
        let message = state.messagesList[chatInfoId].messages.at(-1);
        if (message) {
          return message.messageType == 5;
        }
      }
      return false;
    },
    loadChat : ( state ) => ( chatId = '' ) => {
      if(state.isMessangerChat){
        if(state.messagesList[state.chatInfo.chatId]){
          return state.messagesList[state.chatInfo.chatId].loadChat;
        }
      } else if ( chatId && state.messagesList[chatId] ) {
        return state.messagesList[chatId].loadChat;
      }
      return true;
    },
    messageLoading : ( state ) => ( chatId = '' ) => {
      if(state.isMessangerChat){
        if(state.messagesList[state.chatInfo.chatId]){
          return state.messagesList[state.chatInfo.chatId].messagesLoading;
        }
      } else if ( chatId && state.messagesList[chatId] ) {
        return state.messagesList[chatId].messagesLoading;
      }
      return false;
    },
    widgetChats : state => {
      if(!state.isMessangerChat){
        return Object.values(state.chatInfo).filter(chat => chat.isMinimize === false);
      }
      return [];
    },
    minimizeChats : state => {
      if(!state.isMessangerChat){
        return Object.values(state.chatInfo).reverse().filter(chat => chat.isMinimize === true);
      }
      return [];
    },
    getQuoteMessage : (state) => ( chatKey = '') => {
      let chatId = ''
      if(state.isMessangerChat){
        chatId = state.chatInfo.chatId
      } else {
        chatId = chatKey;
      }
      let quoteMsgId = state.quoteMessageId[chatId];
      if(quoteMsgId){
        let messagesList = state.messagesList[chatId];
        if(messagesList){
          return messagesList.messages.find((message) => message.messageId == quoteMsgId);
        }
      }
      return ''
    },
    getQuoteMessageId : (state) => ( chatKey = '') => {
      let chatId = ''
      if(state.isMessangerChat){
        chatId = state.chatInfo.chatId
      } else {
        chatId = chatKey;
      }
      return state.quoteMessageId[chatId];
      
    },
    muteChatNotify: (state) => ( infoKey = '') => { // infoKey requeired when wiget chat is on
      if(state.isMessangerChat){
        return state.chatInfo.muteNotification
      }else{
        let chatInformation = {...state.chatInfo[infoKey]};
        if(chatInformation){
          return chatInformation.muteNotification;
        }
      }
      return false;
    },
    messagesListData : ( state) => (chatKey = '') => {
      let cDate = null;
      let chatId = ''
      if(state.isMessangerChat){
        chatId = state.chatInfo.chatId
      } else {
        chatId = chatKey;
      }
      if ( state.messagesList[chatId] ) {
        return state.messagesList[chatId].messages.map(
          (message) => {
            const messageSentDate = new Date(message.timeStamp * 1000).toLocaleDateString();
            if (cDate !== messageSentDate) {
              var currentMessageDate = moment(new Date(message.timeStamp * 1000));
              var today = moment().endOf("day");
              let dateDifference = today.diff(currentMessageDate, "days");

              if (dateDifference == 0) {
                message.messageSentDate = GUPPYCHAT_CONSTANTS.TODAY;
              } else if (dateDifference == 1) {
                message.messageSentDate = GUPPYCHAT_CONSTANTS.YESTERDAY;
              } else if (dateDifference > 1 && dateDifference < 7) {
                message.messageSentDate = dateFormat(new Date(message.timeStamp * 1000), "dddd");
              } else {
                message.messageSentDate = dateFormat(new Date(message.timeStamp * 1000),"dddd, mmm d, yyyy");
              }
            } else {
              message.messageSentDate = "";
            }
            cDate = messageSentDate;
            message['chatId'] = chatId;
            return message;
          }
        );
      } else {
        return [];
      }
    },
    getChatInfo : (state) => ( chatId = '') => {
      let chatInfo = {}
      if(state.isMessangerChat){
        chatInfo = state.chatInfo;
      } else if( chatId ){
        chatInfo = state.chatInfo[chatId];
      } else if( state.selectedChatId ){ // for popUps
        chatInfo = state.chatInfo[state.selectedChatId];
      }
      if(chatInfo){
        return chatInfo
      } else {
        return {}
      }
    },
    chatInfoData : (state) => ( chatId = null ) => {
      if( state.isMessangerChat){
        return state.chatInfo;
      } else if(chatId) {
        return state.chatInfo[chatId];
      }
      return {}
    },
  },
  mutations: {
    removeChatInfo( state, payload ){
      Vue.delete(state.chatInfo, payload.chatId);
    },
    refreshSupportChats(state){
      Vue.set(state, 'adminSupportChatsFlag', false );
      Vue.set(state, 'adminSupportChatsOffset', 0);
      Vue.set(state, 'noMoreAdminSupportChats', false );
      Vue.set(state, 'adminSupportChatsSearch', '' );
      Vue.set(state, 'adminSupportChats', {} );
      Vue.set(state, 'adminSupportChatCount', 0 );
    },
    updateUserInfo( state, payload ){
      if('userId' in payload){
        Vue.set(state, 'userId', payload.userId);
      }
      if('userType' in payload){
        Vue.set(state, 'userType', payload.userType);
      }
      if('isSupportMember' in payload){
        Vue.set(state, 'isSupportMember', payload.isSupportMember);
      }
    },
    removeContactListItem( state, payload){
      Vue.delete(state.contactList, payload.chatId);
    },
    updateWidgetType( state, payload){
      if( 'isMessangerChat' in payload ) {
        state.isMessangerChat = payload.isMessangerChat;
        if(state.isMobileView){
          state.chatInfo = new Object();
        }
      }
      
      if('isWhatsappChat' in payload){
        state.isWhatsappChat = payload.isWhatsappChat;
      }
  
      if( 'isMobileView' in payload ) {
        state.isMobileView = payload.isMobileView;
      }
      if( 'isfloatingChat' in payload ) {
        state.isfloatingChat = payload.isfloatingChat;
      }
  
    },
    updateChatInfo( state, payload ){
      if(Object.keys(payload).length == 0){
        Vue.set(state, 'chatInfo', {});
        Vue.set(state, 'widgetChatMessageInput', {});
        Vue.set(state, 'messageInput', '');
      } else {
        if( state.isMessangerChat ){
          Vue.set(state, 'chatInfo', payload.data);
        }else if( payload.userClick && state.isWhatsappChat){
          let infoData = new Object();
          infoData['00_4'] = payload.data;
          Vue.set(state, 'chatInfo', infoData);
          Vue.delete(state.widgetChatMessageInput, '00_4')
        }else{
          if( state.chatInfo['00_4'] && payload.userClick){
            Vue.delete(state.chatInfo, '00_4');
          }
          Vue.delete(state.widgetChatMessageInput, '00_4')
          let windowWidth = state.windowWidth;
          let totalWindows = 3;
          if(windowWidth < 1141){
            totalWindows = 1;
          }else if(windowWidth < 1601){
            totalWindows = 2;
          } 
          let chatId = payload.data.chatId;
          let recExist = false;
          let userClick = false;
          if(Object.prototype.hasOwnProperty.call(state.chatInfo, chatId ) ){
            recExist = true;
          }
          if(payload.userClick){
            userClick = true;
          }
          let openChatWindows = Object.values(state.chatInfo).filter(chat => chat.isMinimize == false);
          if(openChatWindows.length == totalWindows){
            if(userClick){
              if(!recExist){
                Vue.set( state.chatInfo[openChatWindows[0].chatId],'isMinimize',  true);
                payload.data['isMinimize'] = false;
                Vue.set(state.chatInfo, chatId, payload.data);
              }else{
                let recIndex = openChatWindows.findIndex( (chat => chat.chatId == chatId) );
                if(recIndex == -1){
                  let record = {};
                  record = state.chatInfo[chatId];
                  record.isMinimize = false;
                  Vue.delete(state.chatInfo, chatId);
                  Vue.set(state.chatInfo, chatId, record);
                  Vue.set( state.chatInfo[openChatWindows[0].chatId],'isMinimize',  true);
                }
              }
            }else{
              payload.data['isMinimize'] = !recExist ? true : false;
              Vue.set(state.chatInfo, chatId, payload.data);
            }
          }else{
            if(userClick){
              if(recExist){
                let record = {};
                record = state.chatInfo[chatId];
                record.isMinimize = false;
                // Vue.delete(state.chatInfo, chatId);
                Vue.set(state.chatInfo, chatId, record);
              }else{
                payload.data['isMinimize'] = false;
                Vue.set(state.chatInfo, chatId, payload.data);
              }
            }else{
              if(recExist){
                let recIndex = openChatWindows.findIndex( (chat => chat.chatId == chatId) );
                let isMinimize = true;
                if(recIndex != -1){
                  isMinimize = false;
                }
                payload.data['isMinimize'] = isMinimize;
                Vue.set(state.chatInfo, chatId, payload.data);
              }else{
                payload.data['isMinimize'] = true;
                Vue.set(state.chatInfo, chatId, payload.data);
              }
            } 
          }
        }
      }
    },
    unseenCountMessage( state, payload ){
      state.privateChatCount        = Number(payload.privateChatCount);
      state.adminSupportChatCount   = Number(payload.supportbaseChatCount);
      state.requestCount            = Number(payload.requestCount);
    },
    updateTabListRecord(state, payload){
      if( Object.keys(state[payload.listType]).length && payload.isScrolling){
        let data = {...state[payload.listType], ...payload.list}
        Vue.set(state, payload.listType, data)
      } else {
        Vue.set(state, payload.listType, payload.list)
      }
  
    },
    selectTab( state, payload ){
      let enableTabs = [...GUPPYCHAT_SETTINGS.enabledTabs,'profile'];
      if( enableTabs.includes(payload) ) {
        state.activeTab = payload;
      }
    },
    startChat( state, payload){
      let friendData      = payload.friendData;
      let messagelistData = payload.messagelistData;
      let chatId          = friendData.chatId;
          Vue.delete(state.contactList, chatId);
  
          let conversationData = {
            ...friendData,
            'isSender' : true,
            'message'  : messagelistData.message,
            'isStartChat'  : messagelistData.isStartChat,
            'blockedId'  : messagelistData.blockedId,
            'messageId'  : messagelistData.messageId,
            'messageStatus'  : messagelistData.messageStatus,
            'messageType'  : messagelistData.messageType,
            'muteNotification'  : false,
            'timeStamp' : messagelistData.timeStamp,
            'isMinimize' : false,
          }
  
          state.activeTab   = "messages"; 
  
          if(!Object.prototype.hasOwnProperty.call(state.friendList, chatId ) && !friendData.isBlocked){
            const updateRecord = Object.assign({ chatId: friendData}, state.friendList);
            Vue.set(state, 'friendList', updateRecord );
          }
  
          if(!Object.prototype.hasOwnProperty.call(state.privateConversation, chatId ) ){
            const updatedConversation = Object.assign({ chatId: conversationData}, state.privateConversation);
            Vue.set(state, 'privateConversation', updatedConversation) 
          }
  
          if(state.isMessangerChat){
            Vue.set(state, 'chatInfo', conversationData);
          } else {
            Vue.set(state.chatInfo, chatId, conversationData);
          }
  
          jQuery('.at-chat').addClass('at-opnchatbox');
    },
    updateConversationMessage(state, payload){
      let chatId = payload.chatId;
      let chatType = payload.chatType;
      let listType = '';
      if(chatType == 1){
        listType = ['privateConversation', 'friendList'];
      } else if ( chatType == 3 ){
        listType  = [ 'adminSupportUserList', 'adminSupportChats'];
      }
  
      if(payload.messageId){   // for delete message
        listType.forEach( type => {
          if(Object.prototype.hasOwnProperty.call(state[type], chatId ) && state[type][chatId].messageId == payload.messageId){
            state[type][chatId].messageStatus = 2;
          }
        })

      }else if(payload.messagelistData){
        let data           = JSON.parse(JSON.stringify(payload.messagelistData));
        data['clearChat'] = false;
        let unReadCount = 0;
        listType.forEach( type => {
          if( Object.prototype.hasOwnProperty.call(state[type], chatId ) ){
            Vue.delete(state[type], chatId);
          }
        })
        if(state.isMessangerChat){      // for messanger base chat
          if(Object.keys(state.chatInfo).length === 0  || (state.chatInfo.chatId != chatId || state.chatInfo.chatType != chatType) ){
            unReadCount = data.UnreadCount;
          }
          if(data.isStartChat){
            Vue.set(state, 'chatInfo', data);
            jQuery('.at-chat').addClass('at-opnchatbox');
          }
        }else{
          let openChatWindow = Object.values(state.chatInfo).filter(chat => chat.isMinimize == false && chat.chatId == chatId).length;
          if(openChatWindow == 0){
            unReadCount = data.UnreadCount;
          }
          let userClick = false; 
          if(data.isStartChat){
            userClick = true;
          }
          if(!state.isMobileView){
            this.commit("updateChatInfo", { data, userClick });
          }
        }
  
        if(Number( unReadCount ) > 0 ){
          if(data.chatType == 1){
            let counter = Number( state.privateChatCount ) + 1;
            Vue.set(state, 'privateChatCount', counter);
          } else if(data.chatType == 3){
            let counter = Number( state.adminSupportChatCount ) + 1;
            Vue.set(state, 'adminSupportChatCount', counter);
          }
        }
  
        data.UnreadCount = unReadCount;
        let record = new Object();
        record[chatId] = data;
        listType.forEach( type => {
          let newConvList   = {...record, ...state[type]};
          Vue.set(state, type, newConvList); 
        });
      }
    },
    updateWindowWidth(state, payload){
      state.windowWidth = payload.windowWidth;
    },
    updateSelectedChatId(state, payload){
      Vue.set( state, 'selectedChatId', payload.chatId )
    },
    closeWidgetChatbox( state, payload ){
        Vue.delete(state.widgetChatMessageInput, payload.chatId)
        Vue.delete(state.chatInfo, payload.chatId);
        Vue.delete(state.quoteMessageId, payload.chatId);
    },
    minimizeWidgetChatbox( state, payload ){
        let chatId = payload.chatId;
        if(payload.isMinimize){
            let record = { ...state.chatInfo[chatId] }
            record.isMinimize = true;
            Vue.delete(state.widgetChatMessageInput, chatId)
            Vue.delete(state.chatInfo, chatId);
            Vue.set(state.chatInfo, chatId, record )
        }else{
            let windowWidth = state.windowWidth;
            let totalWindows = 3;
            if(windowWidth < 1141){
              totalWindows = 1;
            }else if(windowWidth < 1601){
              totalWindows = 2;
            } 
            let openChatWindows = Object.values(state.chatInfo).filter(chat => chat.isMinimize == false);
            if(openChatWindows.length == totalWindows){
                Vue.set( state.chatInfo[openChatWindows[0].chatId],'isMinimize',  true);               
            }
            if(state.chatInfo[chatId].UnreadCount > 0){
                let  userId   = state.userId;
                let data = {
                    chatId,
                    chatType    : state.chatInfo[chatId].chatType,
                    userId
                }
                GuppyChatManager.updateSeenMessagesCounter(data);
            }
            let record = { ...state.chatInfo[chatId] }
            record.isMinimize = false;
            Vue.delete(state.chatInfo, chatId);
            Vue.set(state.chatInfo, chatId, record );
        }
    },
    updateQuoteMessageId(state, payload){
      Vue.set(state.quoteMessageId,payload.chatId, payload.messageId)
    },
    removeQuote(state, payload){
      Vue.delete(state.quoteMessageId,payload.chatId)
    }, 
    updateMessageInput(state, payload){
      if(state.isMessangerChat){
        Vue.set(state, 'messageInput', payload.text);
      } else if(payload.chatId) {
        Vue.set(state.widgetChatMessageInput, payload.chatId, payload.text);
      }
    },
    updateSearch( state, payload){
      state[payload.search] = payload.searchValue;
    },
    updateRecordList( state, payload){
      state[payload.RecordList] = payload.RecordListValue;
    },
    // update the offset of list tabs
    updateOffset( state, payload){
      state[payload.offset] = payload.offsetValue;
    },
    //update flag the first time load tab data
    updateListFlag( state, payload){
      state[payload.flag] = payload.flagValue;
    },
    // Reject the invitation
    declineInvite(state, payload ){
      Vue.delete(state.requestList, payload.chatId);
      Vue.set(state.contactList, payload.chatId, payload)
    },
    blockUser( state, payload ){
      Vue.delete(state.requestList, payload.chatId)
      Vue.set(state.blockList, payload.chatId, payload);
    },
    acceptInvite( state, payload ){
      let chatId = payload.chatId;
      Vue.delete(state.requestList, chatId);
      Vue.set(state.friendList, chatId, payload );
      if(state.isMessangerChat){
        Vue.set(state, 'chatInfo', payload);
      } else {
        payload['isMinimize'] = false;
        Vue.set(state.chatInfo, chatId, payload)
      }
      state.isEmptyView       = false;
      state.isOpenMessagesScr = true;
    },
    toggleMessagesScr( state, payload ){
      state.isEmptyView        = payload.isEmptyView;
      state.isOpenMessagesScr  = payload.isOpenMessagesScr;
    },
    UpdateMessageList( state, payload ){
      let chatId = payload.chatId;
      let data = {
        messages  : payload.messages,
        loadChat  : payload.loadChat,
        messagesLoading  : false,
      }

      let scrollTop = false;
      if( Object.prototype.hasOwnProperty.call(state.messagesList, chatId ) ) {
        state.messagesList[chatId].messages  = data.messages;
        state.messagesList[chatId].loadChat  = data.loadChat;
        state.messagesList[chatId].messagesLoading  = false;
        scrollTop = true;
      } else {
        Vue.set(state.messagesList, chatId, data )
      } 
      
      if(scrollTop){ //top
        GuppyChatManager.messagesScrollList( payload.lastScrollTop, payload.chatId);
      }else{ //bottom
        GuppyChatManager.messagesScrollList( 0, payload.chatId);
      }
    },
    userResponse( state, payload ){
      state.userResponseData = payload;
      state.isEmptyView = false;
      state.isOpenMessagesScr = false;
    },
    UpdateSelectUserStatus( state, payload ){
      if(payload.chatType == 1 ){
        if( payload.chatId in state.privateConversation ){
          Vue.set(state.privateConversation[payload.chatId], 'isBlocked' , payload.isBlocked);
        }
        if( payload.isBlocked ){
          if(payload.chatId in state.friendList ){
            Vue.delete(state.friendList, payload.chatId)
          }

          if( !Object.prototype.hasOwnProperty.call(state.blockList, payload.chatId ) ){
            Vue.set(state.blockList, payload.chatId, payload);
          }
        }else{
          if( Object.prototype.hasOwnProperty.call(state.blockList, payload.chatId ) ){
            Vue.delete(state.blockList, payload.chatId);
          }
          if( payload.friendStatus == 1){
            Vue.set(state.friendList, payload.chatId, payload)
          }else{
            if( !Object.prototype.hasOwnProperty.call(state.contactList, payload.chatId ) ){
              Vue.set(state.contactList, payload.chatId, payload)
            }
          }
        }
      }
      let blockedId = payload.chatId.split('_');
      blockedId = payload.chatType == 1 ? blockedId[0] : blockedId[1];
      if(state.isMessangerChat){
        if( state.chatInfo.chatType == 1 ){ // this only private case
          state.chatInfo = payload
        }
      } else {
        if(payload.chatId in state.chatInfo ){
          payload['isMinimize'] = false;
          let chatInfoData = state.chatInfo[payload.chatId]
          if(chatInfoData){
            chatInfoData['blockedId'] = blockedId
            chatInfoData['blockerId'] = payload.blockerId
            chatInfoData['clearChat'] = payload.clearChat
            chatInfoData['isBlocked'] = payload.isBlocked
            chatInfoData['isOnline']  = payload.isOnline
            Vue.set(state.chatInfo, payload.chatId, chatInfoData);
          }
        }
      }
    },
    setUserProfile( state, payload ){
      state.userProfile = payload.userInfo;
    },
    receiveMessage(state, payload){
      let chatId    = payload.chatId;
      let chatType  = payload.chatData.chatType;
      let isSender  = payload.chatData.isSender;
      let listType = '';
      if(chatType == 1){
        listType = 'privateConversation';
      } else if ( chatType == 3 ) {
        listType = 'adminSupportChats';
      }

      if( Object.prototype.hasOwnProperty.call(state[listType], chatId ) ){
        let  isMute =  state[listType][chatId].muteNotification;
        if(!state.userProfile.muteNotification && !isMute && !isSender){
          GuppyChatManager.playNotificationBell();
        }
      }
      if(state.messagesList[chatId]){
        let messageIndex = state.messagesList[chatId].messages.findIndex( (message => message.messageId == payload.chatData.messageId) );
        let randNumber = payload.chatData.metaData.randNum;
        let randNumberIndex = state.messagesList[chatId].messages.findIndex( 
          (message => {
            if(message.metaData){
              return message.metaData.randNum == randNumber
            } else {
              return false;
            }
          }) 
        );
        if(messageIndex == -1 && randNumberIndex == -1){
          state.messagesList[chatId].messages.push(payload.chatData);
        }
        if(jQuery('#message-wrap_'+chatId).length){
          jQuery('#message-wrap_'+chatId).animate({ scrollTop: jQuery('#message-wrap_'+chatId)[0].scrollHeight}, 800);
        }
      }
      if(state.isMessangerChat){ 
        if(state.chatInfo.chatId == payload.chatId && state.chatInfo.chatType == payload.chatData.chatType && !isSender){
          let  userId   = state.userId;
          let data = {
            chatId      : state.chatInfo.chatId,
            chatType    : payload.chatData.chatType,
            userId
          }
          GuppyChatManager.updateSeenMessagesCounter(data);
        }
      }else{
        let openChatWindow = Object.values(state.chatInfo).filter(chat => chat.isMinimize == false && chat.chatId == chatId).length;
        if(openChatWindow != 0  && !isSender){
          let  userId   = state.userId;
          let data = {
            chatId      : state.chatInfo[chatId].chatId,
            chatType    : payload.chatData.chatType,
            userId
          }
          GuppyChatManager.updateSeenMessagesCounter(data);
        }
      }
    },
    updateUnseenCounter(state, payload){
      let selectList = '';
      let msgCountKey = '';
      if( payload.chatType == 1 ) {
        msgCountKey = 'privateChatCount';
        selectList  = ['privateConversation', 'friendList'];
      } else if( payload.chatType == 3 ) {
        msgCountKey = 'adminSupportChatCount';
        selectList  = [ 'adminSupportUserList', 'adminSupportChats'];
      } else if ( payload.chatType == 5 ){ // for request invitations
        msgCountKey = 'requestCount';
      }

      if(payload.chatType == 1 || payload.chatType == 3) {
        selectList.forEach( item =>{
          if( payload.chatId && state[item][payload.chatId] ){
            Vue.set(state[item][payload.chatId], 'UnreadCount', 0);
          }
        });
      }

      let updateCount = 0;
      if(state[msgCountKey] > 0 ){
        updateCount = Number(state[msgCountKey]) - Number(payload.UnreadCount);
        Vue.set(state, msgCountKey, updateCount);
      }
    },

    appendMessage(state, payload){
      let chatId        = payload.chatId;
      let randNumber    = payload.metaData.randNum;
      if( state.messagesList[chatId] ) {
        let messageIndex = state.messagesList[chatId].messages.findIndex( 
          (message => {
            if(message.metaData){
              return message.metaData.randNum == randNumber
            } else {
              return false;
            }
          }) 
        );
        if( messageIndex > -1 ){
          Vue.set(state.messagesList[chatId]['messages'], messageIndex, payload);
        } else {
          state.messagesList[chatId]['messages'].push(payload);
        }
        GuppyChatManager.messagesScrollList( 0, payload.chatId);
      }
    },
    updateMessageStatus(state, payload){
      let chatId          = payload.chatId;
      let messageIds      = payload.messageIds;
      let messageCounter  = payload.messageCounter;
      let chatType        = payload.chatType;
      let isSender        = payload.isSender;
      let listType = '';
      if(chatType == 1){
        listType = ['privateConversation','friendList'];
      } else if( chatType == 3 ){
        listType = [ 'adminSupportUserList', 'adminSupportChats'];
      }
      if(state.messagesList[chatId] && isSender){
        if( chatType == '1' || chatType == '3'){
          if(messageIds){
            for (let [id] of Object.entries(messageIds)) {
              let messageIndex = state.messagesList[chatId].messages.findIndex( (message => message.messageId == id));
              if(messageIndex > -1){
                state.messagesList[chatId].messages[messageIndex].messageStatus = 1;
              }
            }
          }
        }
      }else if(!isSender){
        chatId = chatId.split('_');
        let counterlist = '';
        if(chatType == 1){
          let senderId = payload.senderId;
          counterlist = 'privateChatCount';
          chatId = senderId + '_' + chatType;
        } else if( chatType == 3 ){
          let senderId = payload.senderId;
          counterlist = 'adminSupportChatCount';
          chatId = senderId + '_' + chatType;
        }

        listType.forEach( type =>{
          if( Object.prototype.hasOwnProperty.call(state[type], chatId ) ){
            let counter = Number(state[type][chatId].UnreadCount) - Number(messageCounter);
            if(Number( counter ) >= 0 ){
              Vue.set( state[type][chatId],'UnreadCount',  counter);
            }
          }
        });

        if(state[counterlist] > 0 ){
          let totalUnseenCounter = Number( state[counterlist] ) - Number(messageCounter);
          Vue.set(state, counterlist, totalUnseenCounter);
        }

        if(!state.isMessangerChat){
          if(Object.prototype.hasOwnProperty.call(state.chatInfo, chatId ) ){
            Vue.set( state.chatInfo[chatId],'UnreadCount', 0);
          }
        }
      }
    },
    updateUser(state, payload){
      let chatId    = payload.chatId;
      let status    = payload.status;
      let blockedId = 0;
      let isBlocked = payload.isBlocked;
      let chatType  = payload.chatType;
      let blockerId = payload.blockerId;
      let listType  = '';
      
      if(chatType == 1){
        listType = 'privateConversation';
        blockedId = payload.blockedId;
      }

      if(chatType == 1){
        if(status == 3){
          if(chatId in state.friendList ){
            Vue.delete(state.friendList, chatId)
          }
          if(state.userId == blockerId ){
            if( !Object.prototype.hasOwnProperty.call(state.blockList, chatId ) ){
              Vue.set(state.blockList, chatId, payload);
            }
          }
        }else if(status == 1) {
          if( !Object.prototype.hasOwnProperty.call(state.friendList, chatId ) ){
            Vue.set(state.friendList, chatId, payload);
          }
          if(state.userId == blockerId ){
            if(chatId in state.blockList ){
              Vue.delete(state.blockList, chatId)
            }
          }
        }
        if( Object.prototype.hasOwnProperty.call(state[listType], chatId ) ){
          state[listType][chatId].blockedId         = blockedId;
          state[listType][chatId].friendStatus      = status;
          state[listType][chatId].isBlocked         = isBlocked;
          state[listType][chatId].isOnline         = payload.isOnline;
          state[listType][chatId].muteNotification  = payload.muteNotification;
        }
      }

      if(state.isMessangerChat){
        if(state.chatInfo.chatId == chatId && state.chatInfo.chatType == chatType){
          state.chatInfo.isBlocked                = isBlocked;
          state.chatInfo['blockedId']             =  blockedId;
          state.chatInfo['friendStatus']          = status;
          state.chatInfo['muteNotification']      = payload.muteNotification;
        }
      }else{
        if( Object.prototype.hasOwnProperty.call(state.chatInfo, chatId ) ){
          Vue.set(state.chatInfo[chatId], 'isBlocked', isBlocked);
          Vue.set(state.chatInfo[chatId], 'blockedId', blockedId);
          Vue.set(state.chatInfo[chatId], 'friendStatus', status);
          Vue.set(state.chatInfo[chatId], 'muteNotification', payload.muteNotification);
          Vue.set(state.chatInfo[chatId], 'muteNotification', payload.muteNotification);
        }
      }
    },
    deleteMessageStatus(state, payload){
      let messageId     = payload.messageId;
      let chatId        = payload.chatId;
      let chatType      = payload.chatType;
      if( state.messagesList[chatId] ){
        let messageIndex = state.messagesList[chatId].messages.findIndex( (message => message.messageId == messageId));
        if(messageIndex > -1){
          state.messagesList[chatId].messages[messageIndex].messageStatus = 2;
        }
      }
      if(!state.isMessangerChat && Object.prototype.hasOwnProperty.call(state.chatInfo, chatId )){
        let UnreadCount = state.chatInfo[chatId].UnreadCount;
        UnreadCount =  UnreadCount - 1;
        if(UnreadCount >= 0 ){
          Vue.set( state.chatInfo[chatId],'UnreadCount',  UnreadCount);
        }
      }
      let listType = '';
      let counterType = '';
      let counter = 0;
      if(chatType == 1){
        counter = state.privateChatCount - 1;
        counterType = 'privateChatCount';
        listType = 'privateConversation';
      }

      if(counter >= 0 ){
        Vue.set(state, counterType, counter);
        Vue.set(state[listType][chatId],'UnreadCount', counter);
      }
    },
    clearGuppyChat(state, payload){
      let chatId    = payload.chatId;

      if( state.messagesList[chatId] ){
        state.messagesList[chatId]['messages'] = [];
        state.messagesList[chatId].loadChat = false;
      }
      let stateList = '';
      if( payload.chatType == 1 ) {
        stateList = ['privateConversation', 'friendList']; // also update in friend list
      }

      stateList.forEach(item=>{
        if( state[item][chatId] ){
          Vue.set(state[item][chatId],'clearChat', true)
        }
      });

    },
    updateMessageLoadingFlag(state, payload){
      if( state.messagesList[payload.chatId] ){
        Vue.set(state.messagesList[payload.chatId], 'messagesLoading', payload.flagValue);
      } else {
        let data ={
          messages          : null,
          loadChat          : true,
          messagesLoading   : payload.flagValue,
        }
        Vue.set(state.messagesList,payload.chatId, data)
      }
    },
    updateMuteChatNotify(state, payload){
      let muteType = payload.muteType;
      let stateList = []; 
      if( muteType == 0 ) {

        if( payload.chatType == 1 ) {
          stateList = ['privateConversation', 'friendList']; // also update in friend list
        }

        if( state.isMessangerChat ){
          if(state.chatInfo.chatId == payload.chatId){
            Vue.set(state.chatInfo, 'muteNotification', payload.isMute);
          }
        } else {
          if(state.chatInfo[payload.chatId]){
            state.chatInfo[payload.chatId]['muteNotification'] = payload.isMute;
          }
        }
        stateList.forEach( item => {
          if( state[item][payload.chatId] ){
            Vue.set(state[item][payload.chatId],'muteNotification', payload.isMute)
          }
        });
      } else {
        state.userProfile.muteNotification = payload.isMute; 
      }

    },
    updateTypeIndicator(state, payload){
      let data = {};
      let chatKey = payload.chatId;
      if(state.isMessangerChat){
        data = JSON.parse(JSON.stringify(state.chatInfo));
      }else{
        if(payload.chatType == 1){
          chatKey = payload.senderId + '_' + payload.chatType;
        }else if(payload.chatType == 3){
          chatKey = chatKey.split('_');
          chatKey = payload.senderId + '_'+ payload.chatType;
        }
        if(Object.prototype.hasOwnProperty.call(state.chatInfo, chatKey ) ){
          data = JSON.parse(JSON.stringify(state.chatInfo[chatKey]));
        }
      }
      if(Object.keys(data).length){
        let isExist = 'typingUsers' in  data;
        if( !isExist ){ data['typingUsers'] = []; }
        
        if( payload.chatType == 1 || payload.chatType == 3 ){
          let senderId =  data.chatId;
          senderId = senderId.split('_');
          if(payload.chatType == 0){
            senderId = senderId[1];
          }else{
            senderId = senderId[0];
          }
         
          if( senderId == payload.senderId && data.chatType == payload.chatType){
            if(payload.text){
              data['typingUsers'] = [];
              data.typingUsers.push(payload.userName);
            }else{
              let index = data.typingUsers.indexOf(payload.userName);
              if ( index > -1){ data.typingUsers.splice(index, 1); }
            }
          }else{
            let index = data.typingUsers.indexOf(payload.userName);
            if ( index > -1){ data.typingUsers.splice(index, 1); }
          } 
        }

        if(state.isMessangerChat){
          Vue.set(state.chatInfo, 'typingUsers', data.typingUsers);
        }else{
          Vue.set(state.chatInfo[chatKey], 'typingUsers', data.typingUsers);
        }
      }
    },
  },
  actions: {
    startConversation(context, payload ) {
      context.commit('startConversation', payload)
    },
    unBlockUser (context, payload) {
      context.commit('unBlockUser', payload)
    },
    toggleMessagesScr(context, payload ) {
      context.commit('toggleMessagesScr', payload)
    },
    userResponse( context, payload ) {
      context.commit('userResponse', payload)
    },
    clearGuppyChat(context, payload){
      context.commit('clearGuppyChat', payload)
    },
    UpdateMessageList( context, payload ) {
      let state         = context.state;
      let chatData      = payload.chatData;
      let chatId        = chatData.chatId;
      let receiverId    = chatData.receiverId;
      let chatType      = Number(chatData.chatType);
      let userId        = state.userId;
      let messageData   = [];
      let offset        = 0;
      let loadChat      = true;
      let userType      = state.userType;
      let currentMessageList  = [];

      if(state.messagesList[chatId]){
        currentMessageList = state.messagesList[chatId].messages;
        if(currentMessageList.length){
          context.commit('updateMessageLoadingFlag', { flagValue : true, chatId })
          offset = currentMessageList[0].messageId;
        }
      }

      Vue.axios.get(
        'load-guppy-chat?offset=' +offset +
        '&receiverId='+ receiverId +
        '&userId='+ userId +
        '&chatType='+ chatType +
        '&userType=' + userType
        ).then( response => {
        if( response.data.type == 'success' ){
          if( !response.data.chatMessages.length ) {
            loadChat = false;
          }
          if( currentMessageList.length ){
            messageData = [].concat(response.data.chatMessages, currentMessageList);
          } else {
            messageData = response.data.chatMessages;
          }

          let data = {
            messages            : messageData,
            lastScrollTop       : payload.lastScrollTop,
            messagesLoading     : true,
            loadChat,
            chatId,
          }

          if(typeof response.data.muteNotfication != 'undefined'){
            data['muteNotfication'] = response.data.muteNotfication;
          }
          context.commit('UpdateMessageList', data)

        }
      }).catch( error => {
        console.log( error )
      });
    },
    updateConversationMessage( context, payload ) {
      context.commit('updateConversationMessage', payload)
    },
    updateMessageStatus( context, payload ) {
      context.commit('updateMessageStatus', payload)
    },
    deleteMessageStatus( context, payload ) {
      context.commit('deleteMessageStatus', payload)
    },
    initializePusher(context, payload){
      let pusher = new Pusher(payload.pusherKey, {
        cluster: payload.pusherCluster,
        authEndpoint: payload.restApiUrl+'channel-authorize',
      });
      
      if(pusher){
        let channel = pusher.subscribe('private-user-'+payload.userId);
        context.state.pusher = pusher;
        channel.bind('recChatData', function (data) {
          context.commit('updateConversationMessage', data);
          context.commit('receiveMessage', data);
        });

        channel.bind('updateUser', function (data) {
          context.commit('updateUser', data);
        });

        channel.bind('clearChat', function (data) {
          context.commit('clearGuppyChat', data);
        });


        // update ChatMuteNoification status
        channel.bind('updateMuteChatNotify' , function (data) {
          context.commit('updateMuteChatNotify', data);
        });
        
        channel.bind('senderChatData', function (data) {
          context.commit('receiveMessage', data);
          context.commit('updateConversationMessage', data);
        });

        channel.bind('updateMessage', function (data) {
          context.commit('updateMessageStatus', data);
        });
        channel.bind('deleteMessage', function (data) {
          context.commit('deleteMessageStatus', data);
          context.commit('updateConversationMessage', data);
        });
        channel.bind('isTyping', function (data) {
          context.commit('updateTypeIndicator', data);
        });
      }
    },

    initializeSocket(context, settings){
      let socket =  SocketioService.socketConnection(settings.authToken);
      if(socket){

        // add user to socket 
        if(settings.userId){
          let id = settings.userId;
          SocketioService.connectUser(id);
        }

        // listening for sending data and update receiver 
        socket.on('receiverChatData' , (data) => {
          context.commit('receiveMessage', data);
          context.commit('updateConversationMessage', data);
        });

        // listening for sending data and update sender 
        socket.on('senderChatData' , (data) => {
          context.commit('receiveMessage', data);
          context.commit('updateConversationMessage', data);
        });

        // update message status 
        socket.on('updateMsgStatus' , (data) => {
          context.commit('updateMessageStatus', data);
        });

        // delete message from sender 
        socket.on('deleteSenderMessage' , (data) => {
          context.commit('deleteMessageStatus', data);
          context.commit('updateConversationMessage', data);
        });

        // delete message from receiver  
        socket.on('deleteReceiverMessage' , (data) => {
          context.commit('deleteMessageStatus', data);
          context.commit('updateConversationMessage', data);
        });

        // is typing 
        socket.on('isTyping' , (data) => {
          context.commit('updateTypeIndicator', data);
        });

        // update user status
        socket.on('updateUser' , (data) => {
          context.commit('updateUser', data);
        });

        // update ChatMuteNoification status
        socket.on('updateMuteChatNotify' , (data) => {
          context.commit('updateMuteChatNotify', data);
        });

        // update ChatMuteNoification status
        socket.on('clearChat' , (data) => {
          context.commit('clearGuppyChat', data)
        });

      }
    },
    triggerSocketEvents(context, data){
      if(GUPPYCHAT_SETTINGS.realTimeOption == 'socket' && GUPPYCHAT_SETTINGS.socketEnable){
        if(data.event == 'sendMessage'){
          SocketioService.sendMessage(data.payload);
        } else if(data.event == 'updateMuteChatNotify'){
          SocketioService.updateMuteChatNotify(data.payload);
        } else if(data.event == 'updateMsgStatus'){
          SocketioService.updateMsgStatus(data.payload);
        }else if(data.event == 'clearChat'){
          SocketioService.clearChat(data.payload);
        }else if(data.event == 'deleteMessage'){
          SocketioService.deleteMessage(data.payload);
        }else if(data.event == 'updateUser'){
          SocketioService.updateUser(data.payload);
        }
      }
    },
    triggerclientEvents(context, data){
      if(GUPPYCHAT_SETTINGS.realTimeOption == 'socket' && GUPPYCHAT_SETTINGS.socketEnable){
        if(data.event == 'isTyping'){
          SocketioService.isTyping(data.payload);
        }
      }else if(GUPPYCHAT_SETTINGS.realTimeOption == 'pusher' && GUPPYCHAT_SETTINGS.pusherEnable){
        if( data.event == 'isTyping'){
          if(canType) {
            RestApiManager.pusherTypeIndicator({userId : context.state.userId, ...data.payload});
            canType = false;
            setTimeout(function() {
              canType = true;
            }, throttleTime);
          }
        }
      }
    },
    initRealTimeChatSetting( context, payload ){
      if(GUPPYCHAT_SETTINGS.realTimeOption == 'pusher' && GUPPYCHAT_SETTINGS.pusherEnable){
        let settings = { 
           pusherKey     : GUPPYCHAT_SETTINGS.pusherKey,
           pusherCluster : GUPPYCHAT_SETTINGS.pusherCluster,
           restApiUrl    : window.wpguppy_scripts_vars.restapiurl,
           userId        : context.state.userId,
         };
         context.dispatch('initializePusher', settings);
       } else if(GUPPYCHAT_SETTINGS.realTimeOption == 'socket' && GUPPYCHAT_SETTINGS.socketEnable){
         let settings = { 
           authToken     : payload.authToken,
           userId        : context.state.userId,
         };
         context.dispatch('initializeSocket', settings);
       }
    }
  }

})