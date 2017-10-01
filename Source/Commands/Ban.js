const common = require(`../Common.js`);
const app = require(`../App.js`);
const data = require(`../Data.js`);

const Command = require(`../Models/Command.js`);
const Argument = require(`../Models/Argument.js`);
const UserBan = require(`../Models/UserBan.js`);
const UserWarning = require(`../Models/UserWarning.js`);

const DESCRIPTION = `Bans a user from the server.`;
const ARGUMENTS = [
  new Argument(`user`, `The user to be banned.`, true, true),
  new Argument(`reason`, `The reason why the user is being banned.`, false),
  new Argument(`length`, `The number of days the user should be banned for.`, false, false)
];
const ROLES = require(`../Common.js`).staffRoles;
const callback = function(args, message)
{
  // It's easier to grab the user from the message object than the args.
  message.mentions.users.map(user => ban(user, args[1], args[2], message));
};

// This is in its own function so that the warn command can call it.
function ban(user, reason, length, message)
{
  // Log the ban event.
  const author_info = `${message.author.username} (${message.author})`;
  const user_info = `${user.username} (${user})`;
  const count = app.warnings.filter(x => x.id === user.id && !x.cleared).length || 0;
  let log_message = ``;
  let ban_message = ``;
  if (!reason)
  {
    log_message =
      `${author_info} has banned ${user_info} (${count} warnings)`;
    ban_message =
      `${user} You are being banned`;
  }
  else
  {
    log_message =
      `${author_info} has banned ${user_info} for ${reason} (${count} warnings)`;
    ban_message =
      `${user} You are being banned for ${reason}`;
  }
  const append_string = length ? `, for ${length} days.` : `.`;
  log_message += append_string;
  ban_message += append_string;

  common.sendPrivateInfoMessage(log_message);

  // Send a banning message.
  message.reply(`banning ${user_info}.`);

  // Do the banning.
  message.channel.send(ban_message);
  message.guild.ban(user, {reason: reason}).then(() =>
  {
    var unban_date = null;
    // Schedule an unbanning, if required.
    if (length)
    {
      const date = new Date;
      unban_date = date.getTime() + length;

      // Add a warning for when they come back.
      app.warnings(new UserWarning(user.id, user.username, reason, message.author.id,
        message.author.username));
      data.flushWarnings();
    }

    app.bans.push(new UserBan(user.id, user.username, reason, message.author.id,
      message.author.username, count, unban_date));
    data.flushBans();
  },
  error => common.sendPrivateErrorMessage(`Failed to ban ${user_info}.`, error));
}

module.exports = {
  command: new Command(`ban`, DESCRIPTION, ARGUMENTS, ROLES, callback),
  ban: ban
};
