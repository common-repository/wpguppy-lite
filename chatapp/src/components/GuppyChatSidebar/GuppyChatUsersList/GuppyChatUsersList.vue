<template>
    <div class="at-sidbarwrapper at-userlist_tab at-contacts_list">
        <div class="at-userchat_tab">
            <a href="javascript:void(0);" :class="{'at-tabactive': selectedTab == 'contacts'}" @click.prevent="selectedTab = 'contacts' ">
                <i class="guppy-user"></i> 
                <span>
                    {{TRANS.contacts}}
                </span>
            </a>
            <a href="javascript:void(0);" :class="{'at-tabactive': selectedTab == 'requests'}" @click.prevent="selectedTab = 'requests' ">
                <i class="guppy-user-plus"></i> 
                <span>
                    {{TRANS.requests_heading}} 
                </span>
                <em class="at-userchat_tab-noti" v-if="requestCount">{{ requestCount > 99 ? '+99': requestCount}}</em>
            </a>
        </div>
        <template v-if="selectedTab == 'contacts'">
            <contact-list />
        </template>
        <template v-else-if="selectedTab == 'requests'">
            <requests-list />
        </template>
    </div>
</template>

<script>
import GuppyChatContactList from "./GuppyChatContactList.vue";
import GuppyChatRequestsList from "./GuppyChatRequestsList.vue";
import { mapState } from 'vuex';
export default {
    name : "GuppyChatUserList",
    components : {
        ContactList: GuppyChatContactList,
        RequestsList : GuppyChatRequestsList,
    },
    data(){
        return{
            search      : '',
            inviteResonseData : '',
            timer : null,
            scrolledToBottom: false,
            selectedTab: 'contacts'
        }
    },
    computed :mapState({
        requestCount:   state => state.requestCount,
        autoInvite:     state => state.autoInvite,
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
.at-chatsidebar_float .at-userlist_tab { padding-left: 60px;}
.at-userlist_tab {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding-left: 70px;
}
.at-userlist_tab .at-userlist_tab{padding-bottom: 0;  padding-left: 0;}

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
.at-guppysidepopup .at-userlist_tab li.at-userbar:last-child{margin-bottom: 20px;}
.at-userlist_tab .at-empty-conversation{
    width: 100%;
    background: transparent;
    z-index: -2;
}
.at-userlist_tab .at-empty-conversation > span{
    letter-spacing: 0.5px;
    font-weight: 500;
    font-size: 18px;
    line-height: 26px;
}
.at-chatsidebar_float .at-userlist_tab .at-empty-conversation > span{
    font-size: 16px;
    line-height: 24px;
}
.at-userlist_tab li.at-inner-loaader{
    width: calc(100% - 80px) !important;
}
</style>