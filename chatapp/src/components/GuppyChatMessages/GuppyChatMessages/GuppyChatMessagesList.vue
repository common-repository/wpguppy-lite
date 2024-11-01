<template>
    <div>
        <div class="at-messages" :class="{ 'at-message_sender': message.isSender }" :key="message.messageId + '_' + Math.floor(Math.random() * 99999999)" v-for="message in messagesList" >
            <!-- for show date message -->
            <div v-if="message.messageSentDate" class="at-chatseparation" :key="message.messageId" >
                <span> {{ message.messageSentDate }} </span>
            </div>
            <!-- for delete message template -->
            <guppy-delete-message :messageProps="message" v-if="Number(message.messageStatus) == 2" />

            <!-- for text message template-->
            <guppy-chat-text-message v-else-if="Number(message.messageType) == 0" :messageProps="message" @deleteMsgEvt="deleteChatMessage($event)" />

            <!-- for notify message template -->
            <guppy-chat-notify-message v-else-if="Number(message.messageType) == 4" :chatInfo="chatInfo" :messageProps="message" />

            <!-- for private chat display time template -->
            <span class="at-message_time" :class="{ 'at-seenmsg': message.isSender && Number(message.messageStatus) == 1 }" >
                {{ getMessageTime(message.timeStamp) }}
            </span>
        </div>
    </div>
</template>

<script>
    import GuppyChatTextMessage from "../GuppyChatTextMessage/GuppyChatTextMessage.vue";
    import GuppyChatNotifyMessage from "../GuppyChatNotifyMessage/GuppyChatNotifyMessage.vue";
    import GuppyDeleteMessage from "../GuppyDeleteMessage/GuppyDeleteMessage.vue";
    import GuppyChatManager from "../../../resources/controller";
    export default {
        name: "GuppyChatMessagesList",
        components: {
            GuppyChatTextMessage,
            GuppyDeleteMessage,
            GuppyChatNotifyMessage,
        },
        props : {
            'chatId':{
            type: String,
            required : false,
                default : ()=>{
                    return null
                }
            },
        },
        computed: {
            messagesList(){
                return this.$store.getters.messagesListData(this.chatId);
            },
            chatInfo(){
                return this.$store.getters.getChatInfo(this.chatId);
            },
        },
        methods: {
            getMessageTime(messageTimeStamp) {
                return GuppyChatManager.getMessageTime(messageTimeStamp);
            },
            deleteChatMessage(messageId) {
                let recordIndex   = this.messagesList.findIndex((message) => message.messageId == messageId);
                let deletMessage  = this.messagesList[recordIndex];
                deletMessage.messageStatus = 2;
                this.$set(this.messagesList, recordIndex, deletMessage);
            },
        },
    };
</script>