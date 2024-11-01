<template>
    <div class="at-messagewrap at-unknownuser">
        <a v-if="isShowDefaultMessage" href="javascript:void(0);" class="at-backtolist"><i class="guppy-chevron-left"></i></a>
        <div class="at-alert">
            <a href="javascript:void(0);" v-if="!isShowDefaultMessage" @click.prevent="closePopUp()" class="at-closepopup"><i class="guppy-x"></i></a>
            <i class="guppy-alert-circle"></i>
            <h2>{{userResponseData.userName}}</h2>
            <p>{{TRANS.invitation_top_desc}}</p>
            <ul class="at-btnlist">
                <!-- for accept invite -->
                <li>
                    <a  href="javascript:void(0);" 
                        @click.prevent="inviteResponse(1)" 
                        class="at-btn at-bgsuccess"
                        :class="{'at-disable-btn' : isLoading && actionType == 1 }"
                    >
                        {{TRANS.accept_invite}}
                    </a>
                </li>
                <!-- for decline invite -->
                <li>
                    <a  href="javascript:void(0);" 
                        @click.prevent="inviteResponse(2)" 
                        class="at-btn at-bgdanger"
                        :class="{'at-disable-btn' : isLoading && actionType == 2 }"
                        >{{TRANS.decline_invite}}
                    </a>
                </li>
            </ul>
            <!-- for block invite -->
            <a 
                href="javascript:void(0);" 
                class="at-anchor" 
                :class="{'at-disable-btn' : isLoading && actionType == 3 }"
                @click.prevent="inviteResponse(3)"
            >
            {{TRANS.block_user}}
            </a>
        </div>
        <div v-if="isShowDefaultMessage" class="at-messages at-message_sender">
            <div class="at-message">
                {{TRANS.invitaion_bottom_desc}}
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import GuppyChatManager from "../../../resources/controller";
export default {
    name : "GuppyChatInviteResponse",
    props : {
        isShowDefaultMessage : {
            type : Boolean,
            required : false,
            default : true
        }
    },
    data(){
        return {
            actionType : 0,
        }
    },
    computed:{
        ...mapState({
        userResponseData  : (state) => state.userResponseData,
        })
    },
    methods : {
        closePopUp(){
            this.$root.$emit('closePopUp', { type : 'acceptInvite' });
        },
        async inviteResponse( status ){
            let userId = this.userResponseData.userId;
            let params = {
                'statusType'    : status,
                'actionTo'      : userId,
                'userId'        : this.userId,
            }

            this.actionType = status;
            this.isLoading = true;
            let response = await GuppyChatManager.updateUserStatus(params);

            if( response.data.type == "success" ) {
                let data = response.data.userData
                if( data.status == 2 ) {
                    data['statusText'] = "invite";
                    this.$store.commit('declineInvite', data);
                    this.toggleScreen()
                } else if( data.status == 3 ) {
                    this.$store.commit('blockUser', data);
                    this.toggleScreen()
                } else if( data.status == 1 ) {
                    this.$store.commit('acceptInvite', data);
                    this.$emit('loadUserChat', this.userResponseData);
                }
                this.$store.commit('updateUnseenCounter', { UnreadCount : 1, chatType : 5, chatId: data.chatId });  // custom chatType for request invitations
            } else if( response.data.type == "error" ) {
                this.alertBox('error', this.TRANS.error_title, response.data.message_desc);
            }
            this.isLoading = false;
            this.closePopUp();
        },
        toggleScreen(){
            let data = { isEmptyView : true, isOpenMessagesScr : false}
            this.$store.dispatch('toggleMessagesScr', data)
        }
    },
    created(){

    }
}
</script>

<style>
.at-unknownuser .at-backtolist{
    align-self: flex-start;
}
.at-unknownuser {
  height: calc(100vh);
  padding-bottom: 21px !important;
  display: flex !important;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  padding-top: 20px;
}
.at-unknownuser .at-message{
  padding: 20px;
  max-width: 100%;
}
.at-unknownuser .at-messages{
  padding-left: 0;
  padding-right: 0;
  margin: 0 !important;
  padding-top: 30px;
}
.at-alert {
  margin: auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 10px;
  text-align: center;
  max-width: 528px;
  filter: drop-shadow(0px 2px 4px rgba(40, 41, 61, 0.04)) drop-shadow(0px 8px 16px rgba(96, 97, 112, 0.16));
}
.at-alert i {
  color: var(--terguppycolor);
  font-size: 54px;
}
.at-alert h2 {
    margin: 0;
    font-size: 28px;
    line-height: 40px;
    letter-spacing: 0.5px;
}
.at-alert p {
  font-size: 15px;
  line-height: 28px;
  letter-spacing: 0.5px;
  color: var(--secguppycolor);
  margin: 0 0 16px;
}
.at-alert > a {
  margin-top: 20px;
}
.at-alert > .at-closepopup{
    margin: 0;
    top: 20px;
    right: 20px;
    position: absolute;
}
.at-alert > .at-closepopup i{
    font-size: 24px;
}
.at-chat480 .at-unknownuser{
    padding-right: 15px!important;
    padding-left: 15px !important;
}
.at-chat480 .at-unknownuser .at-messages{
    padding-right: 0;
    padding-left: 0;
}
.at-chat480 .at-unknownuser .at-message{
    max-width: 100%;
}
</style>