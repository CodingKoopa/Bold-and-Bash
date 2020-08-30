'use strict';

const common = require(`../Common.js`);
const state = require(`../State.js`);

const Command = require(`../Models/Command.js`);

const DESCRIPTION = `Gives you the \`Verified\` role.`;
const callback = (message) =>
{
  const role = state.guild.roles.cache.find(role => role.name === `Verified`);
  if (role)
  {
    message.member.roles.add(role).catch(error =>
      common.SendPrivateErrorMessage(`Failed to give the verified role.`, error));
  }
  else
  {
    common.SendPrivateErrorMessage(`Failed to find the verified role.`);
    return 1;
  }

  return 0;
};

module.exports.command = new Command(`verify`, DESCRIPTION, [], null, callback);
