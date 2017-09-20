const logger = require(`./logging.js`);
const app = require(`./app.js`);
const data = require(`./data.js`);

const Command = require(`../models/Command.js`);
const Argument = require(`../models/Argument.js`);

const description = `Clears the warnings for a user.`;
const arg = [new Argument(`user`, `The user to clear warnings for.`, true, true)];
const roles = require(`../common.js`).staffRoles;
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
    message.channel.send(`${message.author} clearing warnings for ${user} (${user.username})`);

    if (warnings && warnings.length > 0)
    {
      warnings.forEach(warning => warning.cleared = true);
      data.flushWarnings();
      message.channel.send(`${user}, your warnings have been cleared.`);
    }
    else
    {
      throw `No warnings found.`;
    }
  });
};

module.exports.command = new Command(`clearWarnings`, description, arg, roles, callback);
