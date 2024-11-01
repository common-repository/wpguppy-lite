<template>
  <div class="at-chat_messages">
    <no-record-found :listIcon="'guppy-message-circle'" v-if="isEmptyView" />
    <template v-else>
      <template v-if="isOpenMessagesScr">
        <guppy-chat-message-header v-if="chatInfo.chatId" />
        <messages-container :conversationData="convData"/>
        <div v-if="chatInfo.isBlocked && chatInfo.blockedId == userId" class="at-chatblockuser" >
          <span> {{ TRANS.you_are_blocked }} </span>
        </div>
        <div v-else-if="chatInfo.isBlocked && chatInfo.blockedId != userId" class="at-chatblockuser" >
          <span v-html="unblockButtonText"></span>
        </div>
        <guppy-chat-message-footer v-else
          :isDisabledFooter="loadChat && !messagesList.length ? true : isDisabledFooter"
          @loadMessageListEvent="updateMessageList($event)"
        />
      </template>
      <guppy-chat-invite-response @loadUserChat="loadUserChat($event)" v-else />
    </template>
  </div>
</template>

<script>
import GuppyChatInviteResponse from "../GuppyChatInviteResponse/GuppyChatInviteResponse.vue";
import GuppyChatMessageHeader from "../GuppyChatMessageHeader/GuppyChatMessageHeader.vue";
import GuppyChatMessageFooter from "../GuppyChatMessageFooter/GuppyChatMessageFooter.vue";
import { GUPPYCHAT_TRANSLATION } from "../../../resources/constants";
import GuppyChatEmptyView from "../../EmptyViews/GuppyChatEmptyView.vue";
import GuppyChatMessagesContainer from "./GuppyChatMessagesContainer.vue";
import { mapState } from "vuex";
import GuppyChatManager from "../../../resources/controller";

export default {
  name: "GuppyChatMessages",
  components: {
    NoRecordFound: GuppyChatEmptyView,
    GuppyChatInviteResponse,
    GuppyChatMessageHeader,
    GuppyChatMessageFooter,
    MessagesContainer :GuppyChatMessagesContainer
  },
  data() {
    return {
      convData: {
        offset      : 0,
        userId      : "",
        chatType    : "",
        receiverId  : "",
        chatId      : "",
      },
    };
  },
  watch:{
    chatInfo : {
      handler : function(){
        if(this.isMessangerChat){
          this.updateConvData();
          if (!this.messagesList.length) {
            this.loadChatMessages();
          }
          this.scrollListToBottom();
          let toggleData = { isEmptyView: false, isOpenMessagesScr: true };
          this.$store.dispatch("toggleMessagesScr", toggleData);
        }
      }
    }
  },
  computed: {
    messagesList(){
      let chatId = ''
      if(this.$store.state.isMessangerChat){
          chatId = this.$store.state.chatInfo.chatId
      } else {
          chatId = this.chatId;
      }
      return this.$store.getters.messagesListData(chatId);
    },
    loadChat(){
      if(this.$store.state.isMessangerChat){
        return this.$store.getters.loadChat(this.$store.state.chatInfo.chatId);
      }
      return true;
    },
    isDisabledFooter(){
      return this.$store.getters.isDisabledFooter();
    },
    chatInfo(){
      return this.$store.getters.getChatInfo();
    },
    ...mapState({
      isOpenMessagesScr : (state) => state.isOpenMessagesScr,
      isEmptyView       : (state) => state.isEmptyView,
      isMessangerChat   : (state) => state.isMessangerChat,
      unblockButtonText() {
        let text        = GUPPYCHAT_TRANSLATION.blocked_user_message;
        let buttonText  = GUPPYCHAT_TRANSLATION.unblock_now;
        let button      = '<a href="javascript:;" guppy-data-target="#blockuser">' + buttonText + " </a>";
        let updatedText = text.replace("%Unblock%", button);
        return updatedText;
      },
    }),
  },
  methods: {
    updateConvData(){
      let offset  = 0;
      let userId  = "", chatType = "", receiverId = "", chatId ="";
      chatType    = Number(this.chatInfo.chatType);
      chatId      = this.chatInfo.chatId;
      userId      = this.userId;
      if ([1,3].includes(Number(this.chatInfo.chatType)) ) {
          receiverId = chatId.split('_')[0];
      }
      this.convData = { offset, userId, chatType,receiverId, chatId }
    },
    loadChatMessages() {
        if (this.loadChat) {
            this.$store.dispatch("UpdateMessageList", {
                chatData: this.convData,
                lastScrollTop: this.lastScrollTop ? this.lastScrollTop : 0,
            });
        }
    },
    loadUserChat(parems) {
      this.convData = {
        offset      : 0,
        userId      : this.userId,
        chatType    : 1,
        receiverId  : parems.userId,
        chatId      : parems.chatId,
      };
      this.loadChatMessages();
    },
    scrollListToBottom(scrollHeight = 0) {
      GuppyChatManager.messagesScrollList(scrollHeight, this.chatInfo.chatId);
    },
  },
};
</script>

<style scoped>
.at-chat_messages {
  background-color: #f7f7f7;
  flex-direction: column;
  -webkit-box-flex: 0;
  -ms-flex: 0 0 68%;
  flex: 0 0 68%;
  max-width: 68%;
  display: -ms-flexbox;
  display: flex;
  transition: all 0.3s ease-in-out;
}
.at-chat_messagesslide {
  -ms-flex: 0 0 calc(75% - 300px);
  flex: 0 0 calc(75% - 300px);
  max-width: calc(75% - 300px);
}

.at-unknownuser {
  padding-left: 30px;
  padding-right: 30px;
}

.at-loadermsg {
  display: flex;
  align-items: center;
  padding: 20px;
  color: var(--terguppycolor);
  height: auto;
  bottom: auto;
}
.at-loadermsg + .at-message_time {
  display: none;
}
.at-loadermsg i {
  font-size: 24px;
  display: inline-block;
  margin-right: 12px;
  vertical-align: middle;
  width: 20px;
  height: 20px;
}
.at-chatseparation {
  width: 100%;
  position: relative;
  margin: 10px 0;
  z-index: 1;
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: center;
}
.at-chatseparation:before {
  height: 1px;
  width: 100%;
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  z-index: -1;
  background: #ddd;
}
.at-chatseparation span {
  color: var(--terguppycolor);
  background: #f7f7f7;
  padding: 0 20px;
  font-size: 15px;
  line-height: 28px;
  letter-spacing: 0.5px;
}
</style>