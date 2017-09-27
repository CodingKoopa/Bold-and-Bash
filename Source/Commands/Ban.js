const common = require(`../Common.js`);
const app = require(`../App.js`);
const data = require(`../Data.js`);

const Command = require(`../Models/Command.js`);
const Argument = require(`../Models/Argument.js`);
const UserBan = require(`../Models/UserBan.js`);
const UserWarning = require(`../Models/UserWarning.js`);

const description = `Bans a user from the server.`;
// TODO: ban reason, and timed bans
const arg = [
  new Argument(`user`, `The user to be banned.`, true, true),
  new Argument(`reason`, `The reason why the user is being banned.`, false),
  new Argument(`length`, `The number of days the user should be banned for.`, false, false)
];
const roles = require(`../Common.js`).staffRoles;
const callback = function(args, message)
{
  // It's easier to grab the user from the message object than the args.
  message.mentions.users.map(user => ban(user, args[1], args[2], message));
};

// This is in its own function so that the warn command can call it.
function ban(user, reason, length, message)
{
  // Log the ban event.
  const authorInfo = `${message.author.username} (${message.author})`;
  const userInfo = `${user.username} (${user})`;
  const count = app.warnings.filter(x => x.id === user.id && !x.cleared).length || 0;
  let logMessage = ``;
  let banMessage = ``;
  if (!reason)
  {
    logMessage =
      `${authorInfo} has banned ${userInfo} (${count} warnings)`;
    banMessage =
      `${user} You are being banned`;
  }
  else
  {
    logMessage =
      `${authorInfo} has banned ${userInfo} for ${reason} (${count} warnings)`;
    banMessage =
      `${user} You are being banned for ${reason}`;
  }
  const appendString = length ? `, for ${length} days.` : `.`;
  logMessage += appendString;
  banMessage += appendString;

  common.sendPrivateInfoMessage(logMessage);

  // Send a banning message.
  message.reply(`banning ${userInfo}.`);

  // Do the banning.
  message.channel.send(banMessage);
  message.guild.ban(user, {reason: reason}).then(() =>
  {
    var unbanDate = null;
    // Schedule an unbanning, if required.
    if (length)
    {
      const date = new Date;
      unbanDate = date.getTime() + length;

      // Add a warning for when they come back.
      app.warnings(new UserWarning(user.id, user.username, reason, message.author.id,
        message.author.username));
      data.flushWarnings();
    }

    app.bans.push(new UserBan(user.id, user.username, reason, message.author.id,
      message.author.username, count, unbanDate));
    data.flushBans();
  },
  error => common.sendPrivateErrorMessage(`Failed to ban ${userInfo}.`, error));
}

module.exports = {
  command: new Command(`ban`, description, arg, roles, callback),
  ban: ban
};
