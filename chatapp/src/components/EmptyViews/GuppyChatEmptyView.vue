<template>
  <div class="at-empty-conversation">
    <guppy-svg-icons v-if="svgIcon" :isEmptyView="true" :ImageColor="listIcon"/>
    <i v-else :class="listIcon"></i>
    <span v-if="isSidebarProps">{{TRANS.no_results}}</span>
    <span v-else>{{TRANS.admin_start_conversation}}</span>
  </div>
</template>

<script>
 import GuppySvgIcons from "./GuppySvgIcons.vue";
  export default {
    name : "EmptyView",
    props: {
      isSidebarProps : {
        type : Boolean,
        default : false,
        required : false
      },
      listIcon : {
        type : String,
        default : '',
        required : false
      },
      svgIcon : {
        type : Boolean,
        default : false,
        required : false
      },
    },
    components : {
      GuppySvgIcons
    }
  }
</script>

<style>
.at-empty-conversation {
  text-align: center;
  background-color: #F7F7F7;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
}
.at-empty-conversation i {
  color: var(--primguppycolor);
  font-size: 52px;
  display: block;
  margin-bottom: 20px;
}
.at-empty-conversation span {
  color: var(--terguppycolor);
  display: block;
  font: 500 18px/30px var(--primchatfont);
}
 @media (max-width: 480px){

   .at-empty-conversation i {
    font-size: 27px;
    margin: 0 0 12px;
 }
 }
</style>