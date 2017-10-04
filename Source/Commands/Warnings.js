'use strict';

const app = require(`../App.js`);

const Command = require(`../Models/Command.js`);
const Argument = require(`../Models/Argument.js`);

const DESCRIPTION = `Gets the number of warnings for a user.`;
const arg = [new Argument(`user`, `The user to get warnings for.`, true, true)];
const ROLES = require(`../Common.js`).STAFF_ROLES;
const callback = (message) =>
{
  message.mentions.users.map(user =>
  {
    const warnings = app.warnings.filter(x => x.id === user.id && !x.cleared);
    message.reply(`${user.username} (${user}) has ${warnings.length} warning(s).`);
  });
};

module.exports.command = new Command(`warnings`, DESCRIPTION, arg, ROLES, callback);
