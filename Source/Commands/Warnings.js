const app = require(`../App.js`);

const Command = require(`../Models/Command.js`);
const Argument = require(`../Models/Argument.js`);

const DESCRIPTION = `Gets the number of warnings for a user.`;
const ARGUMENT = [new Argument(`user`, `The user to get warnings for.`, true, true)];
const ROLES = require(`../Common.js`).staffRoles;
const callback = function(args, message)
{
  message.mentions.users.map((user) =>
  {
    var warnings = app.warnings.filter(x => x.id === user.id && !x.cleared);
    message.reply(`${user.username} (${user}) has ${warnings.length} warning(s).`);
  });
};

module.exports.command = new Command(`warnings`, DESCRIPTION, ARGUMENT, ROLES, callback);
