'use strict';

const common = require(`../Common.js`);
const state = require(`../State.js`);

const Command = require(`../Models/Command.js`);

const DESCRIPTION = `Gives you the \`Verified\` role.`;
const callback = (message) =>
{
  const role = state.guild.roles.find(role => role.name === `Verified`);
  if (role)
    message.member.addRole(role).catch(error =>
      common.SendPrivateErrorMessage(`Failed to give the verified role.`, error));
  else
    common.SendPrivateErrorMessage(`Failed to find the verified role.`);
};

module.exports.command = new Command(`Verify`, DESCRIPTION, [], null, callback);
