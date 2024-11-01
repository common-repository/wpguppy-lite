<template v-if="listItem">
  <div class="at-empty-conversation"><div class="at-chatloader"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div><span>{{TRANS.search_results}}</span></div>
</template>

<script>
export default {
  name : "GuppyChatLoader",
}
</script>

<style>
.at-userbar_loader {
  position: absolute;
  bottom: 0;
  border: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}
.at-userbar_loader .at-spinericon {
  display: inline-block;
  line-height: 64px;
}
.at-spinericon {
    color: var(--terguppycolor) !important;
    -webkit-animation: spinericon 2s linear infinite;
    animation: spinericon 2s linear infinite;
}
.at-userbar_loader span {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  line-height: 64px;
  background: #FFFFFF;
  font-size: 24px;
  border-radius: 40px;
}
@-webkit-keyframes spinericon {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(1turn);
    transform: rotate(1turn);
  }
}
@keyframes spinericon {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(1turn);
    transform: rotate(1turn);
  }
}
.at-chatloader {
  width: 52px;
  height: 52px;
  margin: 0 0 20px;
  position: relative;
  transform: translateZ(0) scale(0.52);
  transform-origin: 0 0;
}
.at-chatloader span {
  left: 49px;
  top: 0px;
  position: absolute;
  animation: at-chatloader linear 0.78125s infinite;
  background: var(--terguppycolor);
  width: 5.8px;
  height: 25px;
  border-radius: 1.5px;
  transform-origin: 1px 49px;
  display: block;
}
.at-chatloader span:nth-child(1) {
  transform: rotate(0deg);
  animation-delay: -0.68359375s;
}
.at-chatloader span:nth-child(2) {
  transform: rotate(45deg);
  animation-delay: -0.5859375s;
}
.at-chatloader span:nth-child(3) {
  transform: rotate(90deg);
  animation-delay: -0.48828125s;
}
.at-chatloader span:nth-child(4) {
  transform: rotate(135deg);
  animation-delay: -0.390625s;
}
.at-chatloader span:nth-child(5) {
  transform: rotate(180deg);
  animation-delay: -0.29296875s;
}
.at-chatloader span:nth-child(6) {
  transform: rotate(225deg);
  animation-delay: -0.1953125s;
}
.at-chatloader span:nth-child(7) {
  transform: rotate(270deg);
  animation-delay: -0.09765625s;
}
.at-chatloader span:nth-child(8) {
  transform: rotate(315deg);
  animation-delay: 0s;
}
@keyframes at-chatloader {
  0% { opacity: 1 }
  100% { opacity: 0 }
}
.at-empty-conversation{
    width: 100%;
    background: transparent;
    z-index: -2;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    margin: 60px 0 0;
}
</style>