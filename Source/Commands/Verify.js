const common = require(`../Common.js`);
const app = require(`../App.js`);

const Command = require(`../Models/Command.js`);

const description = `Gives you the \`Verified\` role.`;
const callback = function(args, message)
{
  const role = app.guild.roles.find(role => role.name === `Verified`);
  if (role)
    message.member.addRole(role).catch(error =>
      common.sendPrivateErrorMessage(`Failed to give verified role.`, error));
  else
    common.sendPrivateErrorMessage(`Failed to find Verified role.`);
};

module.exports.command = new Command(`verify`, description, [], null, callback);
