const common = require(`../Common.js`);
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
    const count = app.warnings.filter(x => x.id === user.id && !x.cleared).length + 1 || 0;
    var logMessage;
    var warnMessage;
    if (!reason)
    {
      logMessage =
        `${authorInfo} has warned ${userInfo} (${count} warnings).`;
      warnMessage =
        `${user} You have been warned. Additional infractions may result in a ban.`;
    }
    else
    {
      logMessage =
        `${authorInfo} has warned ${userInfo} for ${reason} (${count} warnings).`;
      warnMessage =
        `${user} You have been warned for ${reason}. Additional infractions may result in a ban.`;
    }
    common.sendPrivateInfoMessage(logMessage);

    message.reply(`warning ${userInfo}.`);

    message.channel.send(warnMessage);
    app.warnings.push(new UserWarning(user.id, user.username, reason, message.author.id,
      message.author.username));
    data.flushWarnings();
    app.stats.warnings++;
    if (count >= 3)
      require(`./Ban.js`).ban(user, `third warning`, null, message);
  });
};

module.exports.command = new Command(`warn`, description, args, roles, callback);
