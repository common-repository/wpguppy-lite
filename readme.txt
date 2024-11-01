=== One to one user Chat by WPGuppy ===

Contributors: amentotechpvtltd
Tags: chat, group chat, user-to-user chat, video chat, real time chat
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Requires at least: 6.0
Requires PHP: 8.1
Tested up to: 6.6
Stable tag: 1.1.0

== Description ==

WPGuppy is a well thought and clinically designed and developed WordPress chat plugin which has been engineered to fulfill the market needs. It is loaded with features without compromising on quality.

WPGuppy is not just a simple WordPress chat plugin – it is a comprehensive chat solution entailing features that are hard to find in a single WordPress chat plugin.

It is a comprehensive feature-rich WordPress chat plugin that not only provides numerous practical features for end-users but has been designed and developed keeping in mind the high-quality standards that subsequently provide the much-needed robustness and working performance in such plugins.

This plugin prides itself on using its built-in database which means that it will be integrated within your WordPress site database and you get to keep complete control on how you manage your data etc.

The team behind this plugin consists of experienced and professional software engineers and web designers who back this plugin with excellent customer support.

## Enable PHP HTTP Authorization Header

= Shared Hosts =

Most shared hosts have disabled the **HTTP Authorization Header** by default.

To enable this option you'll need to edit your **.htaccess** file by adding the following:

`
RewriteEngine on
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]
`

= WPEngine =

To enable this option you'll need to edit your **.htaccess** file by adding the following:

`
SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1
`

== What's new in WP Guppy Pro ==
- ** BudyPress & BudyBoss Integration **
- ** Post base chat **
- ** Start chat on the WooCommerce shop page **
- Emoji sharing
- ** Voice note **
- ** Group chat with friends **
- Create group
- Delete group
- Upload group avatar
- Leave group
- Share video files
- Share documents
- Share gallery or single images
- Send audio files
- **Hot:** Send current location with open street maps
- **Hot:** Reply to a message
- Delete a message from a chat
- Download attachments
- Real-time chat with pusher.com Channel API, Vue.js, and Vuex
- Real-time chat with node.js and socket.io. Your server should support node.js for this to activate the real-time experience
- All WordPress users listed by roles
- Media and attachment listing in the chat sidebar
- User profile management
- Reset the database with a single click from the back-end
- Settings for the default tab to activate
- Enable/disable tabs for the user, chats, friends, blocked
- Dynamic color schemes
- Media extensions to upload settings
- Mute bell sound for notifications
- Report user via email
- All media attachments download from a conversation
- Clear conversation
- RTL support
- Much more features, <a href="https://codecanyon.net/item/wpguppy-a-live-chat-plugin-for-wordpress/34619534">click here to check all the features</a>