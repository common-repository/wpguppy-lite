import UserDefaultImage from "./avatar.png";
export const GUPPYCHAT_CONSTANTS = {
    AVATAR : UserDefaultImage,
    TODAY: "Today",
    YESTERDAY: "Yesterday",
    VIDEO_THUMBNAIL : window.wpguppy_scripts_vars.videoThumbnail
}
export const GUPPYCHAT_SETTINGS             = window.wpguppy_scripts_vars.chatSetting;
export const GUPPYCHAT_LOGOUT               = window.wpguppy_scripts_vars.logoutUrl;
export const GUPPYCHAT_TRANSLATION          = window.wpguppy_scripts_vars.chatSetting.translations;
export const GUPPYCHAT_SOCKET_ENDPOINT      = window.wpguppy_scripts_vars.chatSetting.socketHost + ':' + window.wpguppy_scripts_vars.chatSetting.socketPort;
export const GUPPYCHAT_SOCKET_PORT          = window.wpguppy_scripts_vars.chatSetting.socketPort; 