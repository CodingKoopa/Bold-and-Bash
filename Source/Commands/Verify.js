const logger = require(`../Logging.js`);
const app = require(`../App.js`);

const Command = require(`../Models/Command.js`);

const description = `Gives you the \`Verified\` role.`;
const callback = function(args, message)
{
  const role = app.guild.roles.find(role => role.name === `Verified`);
  if (role)
  {
    message.member.addRole(role).catch(error =>
    {
      const sharedMessage = `Failed to give verified role. Error: `;
      logger.error(`${sharedMessage}${error}`);
      app.logChannel.send(`${sharedMessage}\`\`\`${error}\`\`\``);
    });
  }
  else
  {
    const logMessage = `Error: Failed to find Verified role.`;
    logger.error(logMessage);
    app.logChannel.send(logMessage);
  }
};

module.exports.command = new Command(`verify`, description, [], null, callback);
