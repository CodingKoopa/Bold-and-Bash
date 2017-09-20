const app = require(`../app.js`);

const Command = require(`../models/Command.js`);
const Argument = require(`../models/Argument.js`);

const description = `Gets the number of warnings for a user.`;
const arg = [new Argument(`user`, `The user to get warnings for.`, true, true)];
const roles = require(`../common.js`).staffRoles;
const callback = function(args, message)
{
  message.mentions.users.map((user) =>
  {
    var warnings = app.warnings.filter(x => x.id === user.id && !x.cleared);
    message.reply(`${user.username} (${user}) has ${warnings.length} warning(s).`);
  });
};

module.exports.command = new Command(`warnings`, description, arg, roles, callback);
