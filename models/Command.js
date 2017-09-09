const RichEmbed = require('discord.js').RichEmbed;
const common = require('../common.js');
const app = require('../app.js');
const logger = require('../logging.js');

class Command {
  constructor(name, description, args, roles, callback) {
    this.name = name;
    this.description = description;
    this.args = args;
    // this.numRequiredArguments = this.args.map(argument => {
    //   if (argument.required == true)
    //     return argument;
    // }).length;
    this.numRequiredArguments = 0;
    this.args.map(argument => {
      if (argument.required == true)
        this.numRequiredArguments++;
    });
    this.roles = roles;
    this.callback = callback;
  }

  execute(message, args) {
    const seeHelpMessage = `See \`${require('config').commandPrefix}${this.name} --help\` for \
usage.`;
    // Check if the user is allowed to use the command.
    if (this.roles != undefined && common.findArray(message.member.roles.map(role => role.name),
      this.roles) == false) {
      // TODO: handle no arguments.
      const logMessage = `${message.author.username} (${message.author}) attempted to use staff \
command ${this.name} with arguments ${args}.`;
      logger.info(logMessage);
      common.sendErrorMessage(`Permission denied. This command can only be used by: \
\`${this.roles}\`.`, message);
      app.logChannel.sendMessage(logMessage);
    } else if (args[0] != undefined && args[0].toLowerCase() == '--help') {
      const description = `**Description**: ${this.description}.\n`;
      var usage = `**Usage**: \`${require('config').commandPrefix}${this.name} [--help] `;
      // arguments is reserved.
      var argumentList = '';
      this.args.map(argument => {
        usage += `${argument.shortName} `;
        argumentList += `\`${argument.shortName}\`: ${argument.explanation}\n`;
      });
      // Close the mini code block.
      usage += '`';
      const helpEmbed = new RichEmbed({
        title: `\`${this.name}\` Command Help`,
        description: `${description}${usage}\n${argumentList}`
      });
      message.reply(`here's the command help for \`${this.name}\`:`, {
        embed: helpEmbed
      });
    } else if (args.length < this.numRequiredArguments) {
      common.sendErrorMessage(`Too little arguments. At least ${this.numRequiredArguments} needed, \
given ${args.length}. ${seeHelpMessage}`, message);
    } else if (args.length > this.args.length) {
      common.sendErrorMessage(`Too many arguments. No more than ${this.args.length} accepted, \
given ${args.length}. ${seeHelpMessage}`, message);
      // Everything is good, run the command.
    } else {
      const res = this.callback(args, message);
      // If nothing was returned, the command succeded, and the original message can be deleted.
      if (!res)
      {
        try {
          message.delete();
        }
        catch(error) {
          logger.error(`Failed to delete message, check if bot has message management permissions. \
Error: ${error}.`);
        }
      }
      else
        common.sendErrorMessage(res);
    }
  }

}

module.exports = Command;
