const logger = require(`../Logging.js`);
const app = require(`../App.js`);
const data = require(`../Data.js`);

const Command = require(`../Models/Command.js`);
const Argument = require(`../Models/Argument.js`);
const UserBan = require(`../Models/UserBan.js`);

const description = `Bans a user from the server.`;
// TODO: ban reason, and timed bans
const arg = [new Argument(`user`, `The user to be banned.`, true, true)];
const roles = require(`../Common.js`).staffRoles;
const callback = function(args, message)
{
  // It's easier to grab the user from the message object than the args.
  message.mentions.users.map(user => ban(user, message));
};

// This is in its own function so that the warn command can call it.
function ban(user, message)
{
  // Log the ban event.
  const authorInfo = `${message.author.username} (${message.author})`;
  const userInfo = `${user.username} (${user})`;
  const count = app.warnings.filter(x => x.id === user.id && !x.cleared).length || 0;
  const logMessage = `${authorInfo} has banned ${userInfo} (${count} warnings).`;
  logger.info(logMessage);
  app.logChannel.send(logMessage);

  // Send a banning message.
  message.reply(`banning ${userInfo} from this server.`);

  // Do the banning.
  app.bans.push(new UserBan(user.id, user.username, message.author.id, message.author.username,
    count));
  message.guild.member(user).ban().catch(error =>
  {
    // Log the ban error.
    const sharedMessage = `Failed to ban ${userInfo}. Error: `;
    // Internally log it.
    logger.error(`${sharedMessage}${error}`);
    // Return the string to be logged in Discord, use a code block.
    // Ordinarily, the error would be sent publicly, but for moderation commands this looks
    // unprofessional.
    app.logChannel.send(`${sharedMessage}\`\`\`${error}\`\`\``);
  });
  data.flushBans();
}

module.exports = {
  command: new Command(`ban`, description, arg, roles, callback),
  ban: ban
};
