const logger = require(`../Logging.js`);
const app = require(`../App.js`);
const data = require(`../Data.js`);

const Command = require(`../Models/Command.js`);
const Argument = require(`../Models/Argument.js`);
const UserWarning = require(`../Models/UserWarning.js`);

const description = `Warns a user.`;
const args = [
  new Argument(`user`, `The user to be warned.`, true, true),
  new Argument(`reason`, `The reason why the user is being warned.`, false)
];
const roles = require(`../Common.js`).staffRoles;
const callback = function(args, message)
{
  var reason = args[1];
  message.mentions.users.map((user) =>
  {
    const authorInfo = `${message.author.username} (${message.author})`;
    const userInfo = `${user.username} (${user})`;
    const count = app.warnings.filter(x => x.id === user.id && !x.cleared).length || 0;
    const newCount = count + 1;
    message.channel.send(`${message.author} warning ${userInfo}.`);
    var logMessage;
    var channelMessage;
    if (!reason)
    {
      reason = ``;
      logMessage =
        `${authorInfo} has warned ${user.username} ${user} (${newCount} warnings).`;
      channelMessage =
        `${user} You have been warned. Additional infractions may result in a ban.`;
    }
    else
    {
      logMessage =
        `${authorInfo} has warned ${user.username} ${user} for ${reason} (${newCount} warnings).`;
      channelMessage =
        `${user} You have been warned for ${reason}. Additional infractions may result in a ban.`;
    }
    logger.info(logMessage);
    app.logChannel.send(logMessage);
    message.channel.send(channelMessage);

    app.warnings.push(new UserWarning(user.id, user.username, reason, message.author.id,
      message.author.username));
    data.flushWarnings();
    app.stats.warnings++;
    if (newCount >= 3)
      require(`./Ban.js`).ban(user, message);
  });
};

module.exports.command = new Command(`warn`, description, args, roles, callback);
