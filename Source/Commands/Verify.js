const common = require(`../Common.js`);
const app = require(`../App.js`);

const Command = require(`../Models/Command.js`);

const DESCRIPTION = `Gives you the \`Verified\` role.`;
const callback = (args, message) =>
{
  const role = app.guild.roles.find(role => role.name === `Verified`);
  if (role)
    message.member.addRole(role).catch(error =>
      common.SendPrivateErrorMessage(`Failed to give the verified role.`, error));
  else
    common.SendPrivateErrorMessage(`Failed to find the verified role.`);
};

module.exports.command = new Command(`verify`, DESCRIPTION, [], null, callback);
