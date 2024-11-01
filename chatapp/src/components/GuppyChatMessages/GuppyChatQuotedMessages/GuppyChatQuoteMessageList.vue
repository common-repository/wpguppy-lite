<template>
    <div>
      <div class="at-message-qoute">
        <div class="at-message-qoute_content">
          <span>{{messageProps.message}}</span> 
        </div>
        <slot name="message_actions"></slot>
      </div>
      <slot></slot>
    </div> 
</template>

<script>
  export default {
      name : "GuppyChatQuoteMessageList",
      props:['messageProps', 'chatId'],
  }
</script>