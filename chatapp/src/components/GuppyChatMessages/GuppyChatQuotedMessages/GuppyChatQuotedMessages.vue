<template>
  <div class="at-replay_message">
    <div class="at-message-qoute">
      <div class="at-message-qoute_content">
          <div v-if="Number(quoteMsgProps.messageType) == 0" class="at-sendfile">
            <span>{{quoteMsgProps.message}}</span>
          </div>
      </div>
      <span class="at-remove-quotes" @click.prevent="removeQuoteMessage()"> <i class="guppy-x" /> </span>
    </div>
  </div>
</template>

<script>
export default {
  name : "GuppyChatQuotedMessages",
  props:['quoteMsgProps'],
  methods:{
    removeQuoteMessage(){
        this.$emit('removeQuoteMessage');
    }
  }
}
</script>

<style>
.at-replay_message {
  background-color: #F7F7F7;
  padding: 10px 20px;
  margin: 0 0 10px 0;
  border-radius: 10px;
}
.at-replay_message .at-message-qoute {
  margin: 0;
}
.at-message-qoute_content{
  padding: 14px;
  background: #fff;
  border-radius: 3px;
}
.at-message-qoute_content .at-sendfile{
  background: transparent;
  padding: 0;
}
.at-message-qoute .at-sendfile span {
  font-size: 12px;
  line-height: 16px;
  display: block;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}
</style>