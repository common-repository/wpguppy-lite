<template>
    <div class="at-sidbarwrapper at-userlist_tab" :class="isSupportMember ? 'at-contacts_list at-support-messages' : 'at-support-agents' ">
        <div class="at-userchat_tab" v-if="!isSupportMember">
            <a href="javascript:void(0);" :class="{'at-tabactive': selectedTab == 'agents'}" @click.prevent=" selectedTab = 'agents' ">
                <i class="guppy-users"></i>
                <span> {{TRANS.admin_support_agent_tab}} </span>
            </a>
            <a href="javascript:void(0);" :class="{'at-tabactive': selectedTab == 'messages', 'at-newnotify': adminSupportChatCount > 0}" @click.prevent="selectedTab = 'messages' ">
                <guppy-svg-icons ImageColor="group" :isActive="selectedTab == 'messages'" activeColor="#0A0F26"/>
                <span> {{TRANS.admin_support_msgs_tab}} </span>
            </a>
        </div>
        <template v-if="!isSupportMember">
            <template v-if="selectedTab == 'agents'">
                <user-list />
            </template>
            <template v-else-if="selectedTab == 'messages'">
                <chat-list />
            </template>
        </template>
        <template v-else>
            <chat-list />
        </template>
        
    </div>
</template>

<script>
import CustomerSupportUserList from "./CustomerSupportUserList.vue";
import CustomerSupportChatList from "./CustomerSupportChatList.vue";
import GuppySvgIcons from "../../EmptyViews/GuppySvgIcons.vue";
import { mapState } from 'vuex';
export default {
    name : "CustomerSupport",
    components : {
        UserList: CustomerSupportUserList,
        ChatList : CustomerSupportChatList,
        GuppySvgIcons
    },
    data(){
        return {
            selectedTab : 'agents',
        }
    },
    computed : mapState({
        adminSupportChatCount : state => state.adminSupportChatCount,
        isSupportMember       : state => state.isSupportMember
    }),
}
</script>

<style>
.user-list{
    height : 600px;
    overflow-y : auto;
    margin : 0;
    padding : 0;
}
.at-userlist_tab {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding-left: 70px;
}
.at-userlist_tab .at-userlist_tab{padding-bottom: 0;  padding-left: 0;}
.at-userchat_tab + .at-userlist_tab ul{
    height: 100%;
}
.at-userlist_tab ul {
    background: #fff;
  height: calc(100% - 0px);
  flex-direction: column;
  width: 100%;
  margin: 0;
  padding: 0;
}
.at-userlist_tab .at-userchat_tab + .at-sidebarhead_search + ul,
.at-userlist_tab .at-userchat_tab + ul{
    height: calc(100% - 168px);
}
.at-userlist_tab li {
  list-style-type: none;
  width: 100% !important;
  margin: 0;
}
.at-guppysidepopup .at-userlist_tab li.at-userbar:last-child{margin-bottom: 0px;}
.at-userlist_tab .at-empty-conversation{
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
.at-userlist_tab .at-empty-conversation > span{
    letter-spacing: 0.5px;
    font-weight: 500;
    font-size: 18px;
    line-height: 26px;
}
.at-userlist_tab li.at-inner-loaader{
    width: calc(100% - 80px) !important;
}
</style>