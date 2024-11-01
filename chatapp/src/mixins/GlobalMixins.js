import { GUPPYCHAT_TRANSLATION } from "../resources/constants";
import { mapState } from 'vuex';
export default {
    data(){
        return {
            messagesOffset   	: 0,
            UserChatOffset 	    : 0,
            isLoading           : false,
            isScrolling         : false,
            RecordLimit         : Number(window.wpguppy_scripts_vars.showRec),
            StatusText          : window.wpguppy_scripts_vars.friendListStatusText,
            isSingle            : window.wpguppy_scripts_vars.isSingle,
            errors              : '',
            TRANS               : GUPPYCHAT_TRANSLATION,
        }
    },
    computed : mapState({
        userId : state => {
            if(state.userId == "0"){
                return '';
            }
            return state.userId
        },
        userType : state => state.userType
    }),
    methods: {
        alertBox(type, title, description){ // type : warning, error, success, info, question
            this.$swal({
                icon: type,
                title: title,
                text: description,
                showCloseButton: true,
                showConfirmButton: false,
            })            
        }
    }
};