var discord = require('discord.js');
var app = require('../app.js');
var data = require('../data.js');
var logger = require('../logging.js');
var sendErrorMessage = require('../common.js').sendErrorMessage;
const Command = require('../models/Command.js');
const Argument = require('../models/Argument.js');
const UserBan = require('../models/UserBan.js');

const description = 'Bans a user from the server.';
// TODO: ban reason, and timed bans
const argument = [new Argument('user', 'The user to be banned.', true, true)];
const roles = require('../common.js').staffRoles;
const callback = function(args, message) {
  // It's easier to grab the user from the message object than the args.
  message.mentions.users.map(user => ban(user, message));
};

// This is in its own function so that the warn command can call it.
function ban(user, message) {
  const count = app.warnings.filter(x => x.id == user.id &&
    !x.cleared).length || 0;

  const authorInfo = `${message.author.username} (${message.author})`;
  const userInfo = `${user.username} (${user})`;
  const logMessage = `${authorInfo} has banned ${userInfo} (${count} warnings).`;
  logger.info(logMessage);
  message.channel.sendMessage(`${message.author} banning ${user} (${user.username}) from this \
server.`);
  app.logChannel.sendMessage(logMessage);

  app.bans.push(new UserBan(user.id, user.username, message.author.id, message.author.username,
    count));

  message.guild.member(user).ban().catch(error => {
    app.logChannel.sendMessage(`Error banning ${userInfo}. Error: \`\`\`${error}\`\`\``);
    logger.error(`Error banning ${userInfo}. Error: ${error}`);
  });

  data.flushBans();
}

module.exports = {
   command: new Command('ban', description, argument, roles, callback),
   ban: ban
};
