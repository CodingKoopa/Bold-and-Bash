<p align="center">
  <img src="https://raw.githubusercontent.com/TheKoopaKingdom/Bold-and-Bash/master/Docs/BoldAndBash.png" alt="Logo" height="200" />
</p>

# Bold and Bash
Bold and Bash is a Discord bot made for the [Mario Kart 8 Modding Central](http://discord.gg/K3ERBFC), based off of [CitraBot](https://github.com/citra-emu/discord-bot). It shares some functionality with the [Bash](https://www.gnu.org/software/bash/) shell, as the name implies. Some examples of said functionality are the help commands, analogous to a command's manpage, and the stringing of commands together with `&&` and `||` (This part is not quite ready yet.).

## Setup

### Prerequisities
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en/)

### Instructuions

#### Discord Setup
1. Create a Discord server.
2. Modify the `@everyone` role to take away the `Send Messages` permission in the `Text Permissions` section.
3. Make 4 roles (These must be named exactly how they are typed here, unless noted otherwise.):
 - The `Admins` role. These are administrators, the staff with the most power. The permissions are up to you.
 - The `Moderators` role. These are moderators, staff members with less power than the administrators. The permissions are up to you.
 - The Bold and Bash role (The name of this role is up to you.). This is the bot's role. The permissions must include:
    - `Manage Roles` for the `verify` command.
    - `Ban Members` for the `ban` command.
    - `Read Text Channels & See Voice Channels` to recieve commands.
    - `Send Text Messages` to respond to commands.
    - `Manage Messages` to delete entered commands that ended sucessfully, and clean up the verification channel.
 - The `Verified` role. The permissions should have everything except for `Send Messages` **disabled**, with `Send Messages` itself **enabled**.
4. Make 3 text channels in addition to the default `#general` channel (The names are up to you.):
 - The verification channel. This is where people will enter the `verify` command to give themselves the permission to send messages. The permissions must be:
     - `@everyone` has the `Read Messages` and `Send Messages` permissions.
     - `Verified` is denied the `Read Messages` permission (`Send Messages` is neutral.).
     - `Admins` and `Moderators` have the `Read Messages` permission.
 - The mod showcase channel. This is where the bot will post mod updates on behalf of people using the `showcase` command. The permissions must be:
     - `@everyone` is denied the `Send Messages` permission.
     - `Admins`, `Moderators`, and the bot have the `Send Messages` permission.
 - The log channel. This is where the bot reports events like warns or bans that are of interest to the staff. The permissions must be:
     - `@everyone` is denied the `Read Messages` permission.
     - `Admins`, `Moderators`, and the bot have the `Read Messages` permission.
4. Make a bot user using [this](https://discordapp.com/developers/docs/intro) guide.
5. Invite the bot to the server using [this](https://discordapp.com/developers/docs/topics/oauth2#bot-authorization-flow) guide. For the permissions, just use `0`, because we already have a role with the bot's permissions.
6. Give the bot role to the newly invited bot.

Now, you should have a Discord server setup with roles, channels, and a bot invited but offline. Now, we will setup the bot to run and respond to commands.

#### Bot Setup
1. Open up a terminal or command prompt.
2. Clone the `Bold-and-Bash` repository:
```bash
git clone https://github.com/TheKoopaKingdom/Bold-and-Bash.git
```
3. Enter the `Bold-and-Bash` directory:
```bash
cd Bold-and-Bash
```
4. Install the Node.js dependencies with the [NPM](https://www.npmjs.com/) package manager:
```bash
npm install
```
5. Make a copy of the default configuration to be the development configuration:
```bash
cp config/default.json config/production.json
```
6. Fill out the values in `config/production.json`. Here's some info about what they are:
- `client_login_token` (String): The bot's token, from [here](https://discordapp.com/developers/applications/me).
- `invite_link` (String): The server's invite link, used when reinviting users after timed bans.
- `verification_channel` (String), `showcase_channel` (String), `log_channel` (String): The IDs of the channels the bot uses. To get the ID of a channel, go into your Discord settings, `Appearance`, and enable `Developer Mode` at the bottom. Now, you should be able to right click on a channel and copy its ID.
- `command_prefix` (String): The way that commands are launched. For example, with `.` (The default.), you would type `.ban`.
- `enable_logdna_logging` (Boolean): Whether LogDNA logging will be used or not. Setting up LogDNA is beyond the scope of this guide, and is not required for the bot to function.
- `logdna_key` (String): Your LogDNA Ingestion Key, if you are using LogDNA.
- `playing_statuses` (Array of strings): A status will be randomly picked from here every day to be shown. This may be undefined if you don't want this feature.
7. Launch the bot in production mode:
```bash
npm run start-prod
```

If you did everything right, the bot should now be up and running!

##### What Now?
From now on, to run the bot you will just follow the last step of [Bot Setup](#bot-setup), running `npm run start-prod`.

If you are interested in working on the bot's code, follow these steps to get a development environment up and running:
1. Follow [Discord Setup](#discord-setup) again, creating a separate Discord server, and separate bot account.
2. Make a copy of your production configuration, for development:
```bash
cp config/production.json config/development.json
```
3. Edit the values of `config/development.json` to fit the new server, and new bot account.
4. Directly run the bot from `Server.js` (This is faster than going through NPM.):
```bash
clear && NODE_ENV=development node Source/Server.js
```
(Here, the `clear` isn't necessary, but is very helpful when constantly restarting the bot.)

5. When you've made your changes, use ESLint to check them for errors:
```bash
npm test
```

## Features
A full list of commands be found by running the `help` command.

### `&&`ing Commands
This wouldn't be a Bash-themed bot without `&&`. For the uninformed, `&&` allows you to execute multiple commands, but from one line of input. If one command fails, then the rest will not be executed. Here's a demonstration:
![&& Demonstration GIF](https://raw.githubusercontent.com/TheKoopaKingdom/Bold-and-Bash/master/Docs/StatementCombining.png)

## Command Help
Every command comes with an automatically generated help embed, similiar to a Bash command's manpage.
![Command Help Screenshot](https://raw.githubusercontent.com/TheKoopaKingdom/Bold-and-Bash/master/Docs/CommandHelp.png)

### Moderation
The `ban` and `warn` commands ban or warn users for a reason. The former supports banning a user for a number of days, for temporary suspensions. The latter supports automatically permenantly banning someone when they have been warned 3 times.

Additionally, Bold and Brash logs messages to `Logs/Date.Messages.log`, so if you need to see what someone said in a deleted message, it can be found here. Logs are also padded to make them easier to look at. Here's an excerpt from the non-messages log:
```
[info]    [7:21 PM]  Bold and Bash Version 0.0.1 Starting.
[info]    [7:21 PM]  Loading Command Modules.
[debug]   [7:21 PM]  Loaded module: Ban.js
```
And here's an excerpt from the messages log (Featuring @Hexexpeck):
```
[#general    ] Koopa        (168559677913694208): Hey <@202614166689677312> can you say something?
[#general    ] Koopa        (168559677913694208): I'm getting an example of the message log for the Bold & Brash readme.
[#general    ] Hexexpeck    (202614166689677312): test 1
[#general    ] Koopa        (168559677913694208): Thanks~
[#verificatio] Koopa        (168559677913694208): And just for good measure, here's a message in another channel.
```

### Verification
In compliance with [section 2.4 of the Discord Developer Terms of Service](https://discordapp.com/developers/docs/legal#2-license-accounts-and-restrictions), Bold and Brash gets permission from all users before retaining chat logs. In order for a user to send messages in a server, they must run the `verify` command to have the bot give them the `Verified` role that gives them the permission. By running this command, users give permission to the bot owner to keep their "end user data".

This system does have pros outside of the legal stuff though. By making users have to look for a command before particiating in a community, they have to at least take a quick look at the rules.

### Mod Showcasing
In a modding server, generally people will have mods to share. However, in a channel dedicated to this purpose, one mod being shared can lead to offtopic discussion, making it hard to find new mods. So, with this system, the mod showcase channel is read only, and users run a command to submit a mod from another channel. Here's an example of what the bot's message looks like:

![Mod Showcase Screenshot](https://raw.githubusercontent.com/TheKoopaKingdom/Bold-and-Bash/master/Docs/ModShowcase.png)

# License
GNU General Public License v2.0
