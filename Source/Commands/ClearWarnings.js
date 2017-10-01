const common = require(`../Common.js`);
const app = require(`../App.js`);
const data = require(`../Data.js`);

const Command = require(`../Models/Command.js`);
const Argument = require(`../Models/Argument.js`);

const DESCRIPTION = `Clears the warnings for a user.`;
const ARG = [new Argument(`user`, `The user to clear warnings for.`, true, true)];
const ROLES = require(`../Common.js`).staffRoles;
const callback = function(args, message)
{
  // Use some and not forEach, so we can return.
  message.mentions.users.forEach((user) =>
  {
    const author_info = `${message.author.username} (${message.author})`;
    const user_info = `${user.username} (${user})`;
    const warnings = app.warnings.filter(x => x.id === user.id && !x.cleared);
    common.sendPrivateInfoMessage(`${author_info} has cleared warnings for ${user_info}
(${warnings.length} warnings).`);

    message.reply(`clearing warnings for ${user_info}`);

    if (warnings && warnings.length > 0)
    {
      warnings.forEach(warning => warning.cleared = true);
      data.flushWarnings();
      message.channel.send(`${user}, your warnings have been cleared.`);
    }
    else
    {
      common.sendPrivateErrorMessage(`Failed to clear warnings for ${user_info}`);
    }
  });
};

module.exports.command = new Command(`clearWarnings`, DESCRIPTION, ARG, ROLES, callback);
