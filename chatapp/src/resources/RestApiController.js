import Vue from 'vue';
import store from '../vuex/store.js';
import jQuery from "jquery";

class RestApiManager {
    userId      = window.wpguppy_scripts_vars.userId;
    recordLimit = Number(window.wpguppy_scripts_vars.showRec);
    async getConversation(offset, search, chatType){
        let userId = store.state.userId;
        try {
            return await Vue.axios.get( "load-guppy-messages-list?userId="+userId+"&offset=" + offset + '&search='+ search + '&chatType=' + chatType);
        } catch(error){
            console.log(error);
            return error;
        }
    }

    async getUsersList(offset,search = '') {
        let userId = store.state.userId;
        try {
            return await Vue.axios.get("load-guppy-users?userId="+userId+"&offset="+offset+'&search='+search)
        } catch(error){
            console.log(error);
            return error;
        }
    }
    async getFriendRequestsList(offset,search = '') {
        let userId = store.state.userId;
        try {
            return await Vue.axios.get("load-guppy-friend-requests?userId="+userId+"&offset="+offset+'&search='+search)
        } catch(error){
            console.log(error);
            return error;
        }
    }
    async getContactList( offset, friendStatus, search = '' ) {
        let userId = store.state.userId;
        try {
            return await Vue.axios.get('load-guppy-contacts?userId='+userId+'&offset=' + offset + '&search=' + search+'&friendStatus=' + friendStatus)
        } catch(error){
            console.log(error);
            return error;
        }
    }

    async getWhatsappUserList( offset, search = '' ) {
        let userId = store.state.userId;
        try {
            return await Vue.axios.get('load-guppy-whatsapp-users?userId='+userId+'&offset=' + offset + '&search=' + search)
        } catch(error){
            console.log(error);
            return error;
        }
    }
    async getAdminSupportUserList( offset, search = '' ) {
        let userId = store.state.userId;
        let userType = Number(store.state.userType);
        try {
            return await Vue.axios.get('load-guppy-support-users?userId='+userId+'&offset=' + offset + '&userType='+userType+'&search=' + search)
        } catch(error){
            console.log(error);
            return error;
        }
    }
    async getAdminSupportUserChats( offset, search = '', isSupportMember ) {
        let userId = store.state.userId;
        let userType = Number(store.state.userType);
        try {
            return await Vue.axios.get('load-guppy-support-messages-list?userId='+userId+'&offset=' + offset + '&userType='+userType+'&search=' + search + '&isSupportMember=' + isSupportMember)
        } catch(error){
            console.log(error);
            return error;
        }
    }

    async sendMessage( data, chatId = '' ){
        jQuery('.at-replay_upload').removeClass('at-uploadoption_open');
         let userName           = ''; 
        let userAvatar          = '';
        let chatInfo            = new Object();
        if(store.state.isMessangerChat){
            chatInfo = {...store.state.chatInfo};
        } else {
            chatInfo = {...store.state.chatInfo[chatId]};
        }
        
        let muteNotification    = chatInfo.muteNotification;
        if(chatInfo.chatType == 3 || chatInfo.chatType == 1){
            userName    = chatInfo.userName;
            userAvatar  = chatInfo.userAvatar;
        } 
        try {
        let response = await Vue.axios.post('send-guppy-message', data);
          if( response.data.type == 'success' ){
            let chatResponce = JSON.parse(JSON.stringify(response.data.chatData));
                chatResponce["isSender"] = true;
            store.commit("appendMessage", chatResponce);
            let messagelistData = JSON.parse(JSON.stringify(response.data.messagelistData));
            let chatData        = JSON.parse(JSON.stringify(response.data.chatData));
            let chatType        = response.data.chatType;
            let userId          = store.state.userId;
            
            let payload = { chatData, messagelistData, userName, userAvatar, userId, chatType, muteNotification }
            store.dispatch('triggerSocketEvents', {'event':'sendMessage', payload});
          }
          return response.data
        } catch( error ) {
            this.errors = error;
            return error;
        }
    }
    async pusherTypeIndicator(data) {
        try {
            return await Vue.axios.post("user-typing", data)
        } catch(error){
            console.log(error);
            return error;
        }
    }
    getUnReadMessages(){
        let userId = store.state.userId;
        let userType = Number(store.state.userType);
        let isSupportMember = store.state.isSupportMember;
        Vue.axios.get('load-unread-count?userId='+userId+'&userType='+userType+'&isSupportMember='+isSupportMember).then(response=>{
          store.commit('unseenCountMessage', response.data.unReadContent);
        }).catch(error=>{
          console.log(error);
        });
    }
    async muteNotification(data){
        let userId = store.state.userId;
        try {
            let response = await Vue.axios.post( "mute-guppy-notifications", data );
            if( response.data.type == 'success'){
                let payload = {
                    muteType : data.muteType,
                    chatType : data.chatType,
                    chatId   : data.chatId,
                    isMute   : ( response.data.muteAll == '1') ? true : false,
                    userId
                };
                store.commit('updateMuteChatNotify', payload);
                store.dispatch('triggerSocketEvents', {'event':'updateMuteChatNotify', payload});
            }
            return response;
        } catch(error){
            console.log(error);
            return error;
        }
    }

    getProfileInfo(){
        let userId = store.state.userId;
        let userType = Number(store.state.userType);
        Vue.axios.get('load-profile-info?userId='+userId+'&userType='+userType).then( response =>{
            if(response.data.type == 'success'){
                let payload = {
                    userInfo: response.data.userInfo,
                }
                if(response.data.onlineFriendslist){
                    payload.onlineFriendslist = response.data.onlineFriendslist;
                }
                store.commit('setUserProfile', payload);
            } else if( response.data.type == "error" ) {
                // this.alertBox('error', this.TRANS.error_title, response.data.message_desc);
            }
        }).catch( errors =>{
            console.log(errors)
        });
    }
    
    getGuestUserInfo(){
        let accountInfo = '';
        var pair = document.cookie.split('; ').find(x => x.startsWith('guppy_guest_account='));
        if (pair) {
            accountInfo = pair.split('=')[1];
        }

        if ( accountInfo ){
            let data = decodeURIComponent(accountInfo).split('|');
            let userInfo = {
                muteNotification : false,
                userAvatar : '',
                userEmail : '',
                userId : data[1],
                userName : data[0],
                userPhone : ''
            }
            store.commit('setUserProfile', { userInfo });
        }
    }
}

export default new RestApiManager;