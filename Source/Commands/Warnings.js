'use strict';

const app = require(`../App.js`);

const Command = require(`../Models/Command.js`);
const Argument = require(`../Models/Argument.js`);

const DESCRIPTION = `Gets the number of warnings for a user.`;
const arg = [new Argument(`user`, `The user to get warnings for.`, true, true)];
const roles = require(`../Common.js`).STAFF_ROLES;
const callback = (message) =>
{
  const user = message.mentions.users.first();
  const warnings = app.warnings.filter(x => x.id === user.id && !x.cleared);
  message.reply(`${user.username} (${user}) has ${warnings.length} warning(s).`);
};

module.exports.command = new Command(`warnings`, DESCRIPTION, arg, roles, callback);
