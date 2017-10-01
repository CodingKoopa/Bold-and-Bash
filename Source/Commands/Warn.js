const common = require(`../Common.js`);
const app = require(`../App.js`);
const data = require(`../Data.js`);

const Command = require(`../Models/Command.js`);
const Argument = require(`../Models/Argument.js`);
const UserWarning = require(`../Models/UserWarning.js`);

const DESCRIPTION = `Warns a user.`;
const ARGUMENTS = [
  new Argument(`user`, `The user to be warned.`, true, true),
  new Argument(`reason`, `The reason why the user is being warned.`, false)
];
const ROLES = require(`../Common.js`).staffRoles;
const callback = function(args, message)
{
  var reason = args[1];
  message.mentions.users.map((user) =>
  {
    const author_info = `${message.author.username} (${message.author})`;
    const user_info = `${user.username} (${user})`;
    const count = app.warnings.filter(x => x.id === user.id && !x.cleared).length + 1 || 0;
    var log_message;
    var warn_message;
    if (!reason)
    {
      log_message =
        `${author_info} has warned ${user_info} (${count} warnings).`;
      warn_message =
        `${user} You have been warned. Additional infractions may result in a ban.`;
    }
    else
    {
      log_message =
        `${author_info} has warned ${user_info} for ${reason} (${count} warnings).`;
      warn_message =
        `${user} You have been warned for ${reason}. Additional infractions may result in a ban.`;
    }
    common.sendPrivateInfoMessage(log_message);

    message.reply(`warning ${user_info}.`);

    message.channel.send(warn_message);
    app.warnings.push(new UserWarning(user.id, user.username, reason, message.author.id,
      message.author.username));
    data.flushWarnings();
    app.stats.warnings++;
    if (count >= 3)
      require(`./Ban.js`).ban(user, `third warning`, null, message);
  });
};

module.exports.command = new Command(`warn`, DESCRIPTION, ARGUMENTS, ROLES, callback);
