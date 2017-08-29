const RichEmbed = require('discord.js').RichEmbed;
const common = require('../common.js');
const app = require('../app.js');
const logger = require('../logging.js');

class Command {
  constructor(name, description, args, roles, callback) {
    this.name = name;
    this.description = description;
    this.args = args;
    this.roles = roles;
    this.callback = callback;
  }

  execute(message, args) {
    // Check if the user is allowed to use the command.
    if (this.roles != undefined && common.findArray(message.member.roles.map(role => role.name), this.roles) == false) {
      logMessage = `${message.author.username} (${message.author}) attempted to use staff command ${this.name} with arguments ${args}.`;
      logger.info(logMessage);
      common.sendErrorMessage(`Permission denied. This command can only be used by: \`${this.roles}\`.`, message);
      app.logChannel.sendMessage(logMessage);
    }
    // Check if the user is looking for help.
    else if (args[0] != undefined && args[0].toLowerCase() == '--help') {
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
    }
    // Check if the number of arguments is correct.
    // TODO: Optional/mandatory params.
    else if (args.length < this.args.length) {
      // Don't use reply because it adds a comma.
      const errorMessage = `Error: Too little arguments. Expected ${this.args.length}, given ${args.length}. See \`${require('config').commandPrefix}${this.name} --help\` for usage.`;
      common.sendErrorMessage(errorMessage, message);
      // Everything is good, run the command.
    } else
      this.callback(args, message);
  }

}

module.exports = Command;
