import { io } from 'socket.io-client';
import { GUPPYCHAT_SOCKET_ENDPOINT} from "../resources/constants";
class SocketioService {
  socket;
  constructor() {}

  // connect to socket server
  socketConnection(authToken) {
    let secureConnection = false;
    if (window.location.protocol === 'https:') {  
      secureConnection = true;
    }
    this.socket = io(GUPPYCHAT_SOCKET_ENDPOINT, {
      auth: {
        token: authToken
      },
      secure: secureConnection,
      reconnect:true
    });
    return this.socket;
  }

  // connect user 
  connectUser(userId){
    if(this.socket){
      this.socket.emit('addUser', { userId: userId } );
    }
  }
  
  // send message
  sendMessage(data){
    if(this.socket && this.socket.connected){
      this.socket.emit('receiverChatData' , data);
      this.socket.emit('senderChatData' , data );
    }
  }

  // update Message Status
  updateMsgStatus(data){
    if(this.socket && this.socket.connected){
      this.socket.emit('updateMsgStatus' , data);
    }
  }

  // update Message Status
  deleteMessage(data){
    if(this.socket && this.socket.connected){
      this.socket.emit('deleteSenderMessage' , data);
      this.socket.emit('deleteReceiverMessage' , data);
    }
  }

  // is typing
  isTyping(data){
    if(this.socket && this.socket.connected){
      this.socket.emit('isTyping' , data);
    }
  }

  // update user
  updateUser(data){
    if(this.socket && this.socket.connected){
      this.socket.emit('updateReceiverUser' , data);
    }
    if(this.socket && this.socket.connected){
      this.socket.emit('updateSenderUser' , data);
    }
  }

  // update mute notification status
  updateMuteChatNotify(data){
    if(this.socket && this.socket.connected){
      this.socket.emit('updateMuteChatNotify' , data);
    }
  }

  // clear Chat notification status
  clearChat(data){
    if(this.socket && this.socket.connected){
      this.socket.emit('clearChat' , data);
    }
  }
}

export default new SocketioService();
