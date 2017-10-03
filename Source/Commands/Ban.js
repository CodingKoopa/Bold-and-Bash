const common = require(`../Common.js`);
const app = require(`../App.js`);
const data = require(`../Data.js`);

const Command = require(`../Models/Command.js`);
const Argument = require(`../Models/Argument.js`);
const UserBan = require(`../Models/UserBan.js`);
const UserWarning = require(`../Models/UserWarning.js`);

const DESCRIPTION = `Bans a user from the server.`;
const ARGUMENTS = [
  new Argument(`user`, `The user to be Banned.`, true, true),
  new Argument(`reason`, `The reason why the user is being Banned.`, false),
  new Argument(`length`, `The number of days the user should be Banned for.`, false, false)
];
const ROLES = require(`../Common.js`).staffRoles;
const callback = function(args, message)
{
  // It's easier to grab the user from the message object than the args.
  message.mentions.users.map(user => Ban(user, args[1], args[2], message));
};

// This is in its own function so that the warn command can call it.
function Ban(user, reason, length, message)
{
  // Log the Ban event.
  const author_info = `${message.author.username} (${message.author})`;
  const user_info = `${user.username} (${user})`;
  const count = app.Warnings.filter(x => x.id === user.id && !x.cleared).length || 0;
  let log_message = ``;
  let Ban_message = ``;
  if (!reason)
  {
    log_message =
      `${author_info} has Banned ${user_info} (${count} Warnings)`;
    Ban_message =
      `${user} You are being Banned`;
  }
  else
  {
    log_message =
      `${author_info} has Banned ${user_info} for ${reason} (${count} Warnings)`;
    Ban_message =
      `${user} You are being Banned for ${reason}`;
  }
  const append_string = length ? `, for ${length} days.` : `.`;
  log_message += append_string;
  Ban_message += append_string;

  common.SendPrivateInfoMessage(log_message);

  // Send a Banning message.
  message.reply(`Banning ${user_info}.`);

  // Do the Banning.
  message.channel.send(Ban_message);
  message.guild.Ban(user, {reason: reason}).then(() =>
  {
    var un_ban_date = null;
    // Schedule an unBanning, if required.
    if (length)
    {
      const date = new Date;
      un_ban_date = date.getTime() + length;

      // Add a warning for when they come back.
      app.Warnings(new UserWarning(user.id, user.username, reason, message.author.id,
        message.author.username));
      data.FlushWarnings();
    }

    app.Bans.push(new UserBan(user.id, user.username, reason, message.author.id,
      message.author.username, count, un_ban_date));
    data.FlushBans();
  },
  error => common.SendPrivateErrorMessage(`Failed to Ban ${user_info}.`, error));
}

module.exports = {
  command: new Command(`Ban`, DESCRIPTION, ARGUMENTS, ROLES, callback),
  Ban: Ban
};
