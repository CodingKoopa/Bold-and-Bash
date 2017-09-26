const common = require(`../Common.js`);
const logger = require(`../Logging.js`);
const app = require(`../App.js`);
const data = require(`../Data.js`);

const Command = require(`../Models/Command.js`);
const Argument = require(`../Models/Argument.js`);

const description = `Clears the warnings for a user.`;
const arg = [new Argument(`user`, `The user to clear warnings for.`, true, true)];
const roles = require(`../Common.js`).staffRoles;
const callback = function(args, message)
{
  // Use some and not forEach, so we can return.
  message.mentions.users.forEach((user) =>
  {
    const authorInfo = `${message.author.username} (${message.author})`;
    const userInfo = `${user.username} (${user})`;
    const warnings = app.warnings.filter(x => x.id === user.id && !x.cleared);
    const logMessage =
      `${authorInfo} has cleared warnings for ${userInfo} (${warnings.length} warnings).`;
    logger.info(logMessage);
    app.logChannel.send(logMessage);

    message.reply(`clearing warnings for ${userInfo}`);

    if (warnings && warnings.length > 0)
    {
      warnings.forEach(warning => warning.cleared = true);
      data.flushWarnings();
      message.channel.send(`${user}, your warnings have been cleared.`);
    }
    else
    {
      common.sendPrivateErrorMessage(`Failed to clear warnings for ${userInfo}`);
    }
  });
};

module.exports.command = new Command(`clearWarnings`, description, arg, roles, callback);
