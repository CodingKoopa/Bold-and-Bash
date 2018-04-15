'use strict';

const common = require(`../Common.js`);
const state = require(`../State.js`);
const data = require(`../Data.js`);

const Command = require(`../Models/Command.js`);
const Argument = require(`../Models/Argument.js`);
const UserBan = require(`../Models/UserBan.js`);
const UserWarning = require(`../Models/UserWarning.js`);

const DESCRIPTION = `Bans a user from the server.`;
const args = [
  new Argument(`user`, `The user to be banned.`, true, true),
  new Argument(`reason`, `The reason why the user is being banned.`, false),
  new Argument(`length`, `The number of days the user should be banned for.`, false, false)
];
const roles = require(`../Common.js`).STAFF_ROLES;
const callback = (message, args) =>
{
  // It's easier to grab the user from the message object than the args.
  Ban(message, message.mentions.users.first(), args[1], args[2]);
};

// This is in its own function so that the warn command can call it.
function Ban(message, user, reason, length)
{
  // Log the Ban event.
  const author_info = `${message.author.username} (${message.author})`;
  const user_info = `${user.username} (${user})`;
  const count = state.warnings.filter(x => x.id === user.id && !x.cleared).length || 0;
  let log_message = `${author_info} has banned ${user_info}`;
  let ban_message = `:hammer: ${user}, you are being banned`;
  if (reason)
  {
    log_message += ` for ${reason}`;
    ban_message += ` for ${reason}`;
  }
  log_message += ` (${count} Warnings)`;
  const append_string = length ? `, for ${length} days.` : `.`;
  log_message += append_string;
  ban_message += append_string;

  common.SendPrivateInfoMessage(log_message);

  // Send a Banning message.
  message.channel.send(`:hammer: ${message.author}, banning ${user_info}.`);

  // Do the Banning.
  message.channel.send(ban_message);
  message.guild.ban(user, {reason: reason}).then(() =>
  {
    let unban_date = null;
    // Schedule an unBanning, if required.
    if (length)
    {
      const date = new Date;
      unban_date = date.getTime() + length;

      // Add a warning for when they come back.
      state.warnings.push(new UserWarning(user.id, user.username, reason, message.author.id,
        message.author.username));
      data.WriteWarnings();
    }

    state.bans.push(new UserBan(user.id, user.username, reason, message.author.id,
      message.author.username, count, unban_date));
    data.WriteBans();
  },
  error => common.SendPrivateErrorMessage(`Failed to ban ${user_info}.`, error));
}

module.exports = {
  command: new Command(`ban`, DESCRIPTION, args, roles, callback),
  Ban: Ban
};
