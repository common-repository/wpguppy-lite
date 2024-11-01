<template>
    <div class="at-leftgroupinfo">
        <span v-html="messageText"></span>
    </div>
</template>

<script>
import {GUPPYCHAT_TRANSLATION} from "../../../resources/constants";
export default {
    name:'GuppyChatNotifyMessage',
    props:['messageProps', 'chatInfo'],
    computed:{
        messageText: function(){
            let data              = this.messageProps;
            let chatType          = data.chatType;
            let notifymessageData = this.messageProps.message;
            let notifyType        = Number(notifymessageData.type);
            let translation       = GUPPYCHAT_TRANSLATION;
            if( chatType == 1 ) { // for one to one chat
                if( notifyType == 1 ){
                    let transText = data.isSender ? translation.auto_inv_sender_msg : translation.auto_inv_receiver_msg;
                    transText = transText.replace(/\\/g, '');
                    return transText.replace('((username))', this.chatInfo.userName);
                }
             }
            return ''
        },
    },
    methods:{

    }
}
</script>

<style>
</style>