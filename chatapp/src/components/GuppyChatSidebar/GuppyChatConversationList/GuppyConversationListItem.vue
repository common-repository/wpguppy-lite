<template>
  <li class="at-userbar" :class=" Number(chatInfo.chatId) == Number(itemProps.chatId) && Number(chatInfo.chatType ) == Number(itemProps.chatType) ? 'active' : ''" @click.prevent="selectUserChat()">
        <!-- for one-to-one chat avatar -->
        <figure class="at-userbar_profile" :class="{'at-blockuser' : itemProps.isBlocked}">
            <i v-if="itemProps.isBlocked" class="guppy-slash"></i>
            <span v-else class="at-userstatus" :class="itemProps.isOnline ? 'online' : 'offline' "></span>
            <img :src="itemProps.userAvatar" alt="profile image" />
        </figure>
        <!-- for user display name and slogan message -->
        <div class="at-userbar_title">
            <h3 v-if="itemProps.userName">
                {{itemProps.userName}}
            </h3>
            <!-- when clear chat is false -->
            <template v-if="!itemProps.clearChat">
                <span v-if="Number(itemProps.messageStatus) == 2 "><i class="guppy-slash"></i>{{TRANS.deleted_message}}</span>	
                <span v-else-if="Number(itemProps.messageType) == 0 ">{{itemProps.message}}</span>
                <!-- for notify messages  -->
                <span v-if="Number(itemProps.messageType) == 4"> 
                    <span v-html="notifyMessage(itemProps)"></span>
                </span>
            </template>
        </div>
        <div v-if="itemProps.clearChat == false" class="at-userbar_right">
            <span v-if="itemProps.timeStamp">{{getMessageTime(itemProps.timeStamp)}}</span>
            <em v-if="Number(itemProps.UnreadCount) > 0 && Number(itemProps.UnreadCount) < 100" class="at-notify">{{itemProps.UnreadCount}}</em>
            <em v-else-if="Number(itemProps.UnreadCount) > 99" class="at-notify">99+</em>
        </div>
    </li>
</template>

<script>
    import GuppyChatManager from "../../../resources/controller";
    import { mapState } from "vuex";
    export default {
        name : "ConversationListItem",
        props:['itemProps'],
        data(){
            return {
            }
        },
        computed :{
            chatInfo(){
                return this.$store.getters.getChatInfo(this.itemProps.chatId)
            },
            ...mapState({
                userProfile: state => state.userProfile,
            })
        },
        methods:{
            notifyMessage(data){
                let chatType          = data.chatType;
                let notifymessageData = data.message;
                let notifyType        = Number(notifymessageData.type);
                let translation       = this.TRANS;
                if( chatType == 1 ) {  // for one to one chat
                    if( notifyType == 1 ){
                        let transText   = data.isSender ? translation.auto_inv_sender_msg : translation.auto_inv_receiver_msg;
                        transText = transText.replace(/\\/g, '');
                        return transText.replace('((username))', data.userName)
                    }
                }
                return ''
            },
            selectUserChat(){
                let data = this.itemProps;
                if(data.UnreadCount > 0){
                    let dataValues = {
                        chatId      : data.chatId,
                        userId      : this.userId,
                        chatType    : data.chatType,
                    }
                    this.$store.commit('updateUnseenCounter', this.itemProps);
                    GuppyChatManager.updateSeenMessagesCounter(dataValues);
                }
                if( Object.keys(this.chatInfo).length ) {
                    let payload = {
                        userName   : this.userProfile.userName,
                        chatType   : this.chatInfo.chatType,
                        chatId     : this.chatInfo.chatId,
                        senderId   : this.userId,
                        text       : '',
                    }
                    this.$store.dispatch('triggerclientEvents', {'event':'isTyping', payload});
                }
                this.$store.commit('updateChatInfo', {data, userClick : true});
            },
            getMessageTime(messageTimeStamp) {
                return GuppyChatManager.getLongDateTime(messageTimeStamp)
            },
        },
    }
</script>