<template v-if="listItem">
  <li class="at-userbar_loader at-inner-loaader">
      <span><i class="at-spinericon"></i></span>
  </li>
</template>

<script>
export default {
  name : "GuppyChatInnerLoader",
}
</script>

<style>
.at-userbar_loader.at-inner-loaader,
  .at-inner-loaader{
    height: 134px;
    bottom: 60px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #FFFFFF 59.37%);
  }
  .at-inner-loaader span{
    height: 64px;
  }
  .at-inner-loaader i{
    width: 24px;
    height: 24px;
    border: 3px solid #ddd;
    border-right-color: #fff;
    border-radius: 50px 50px 50px 50px;
    animation: spinericon 1s linear infinite;
  }
</style>