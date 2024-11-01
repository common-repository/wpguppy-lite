<template>
    <div class="at-message at-deletemsg">
      <div class="at-del-msg"><i class="guppy-slash"></i> {{TRANS.deleted_message}}</div>
    </div>
</template>

<script>
export default {
  name: "GuppyDeleteMessage",
  props:['messageProps'],
};
</script>