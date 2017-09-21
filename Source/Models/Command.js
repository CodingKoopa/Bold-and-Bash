const common = require(`../Common.js`);
const logger = require(`../Logging.js`);
const app = require(`../App.js`);

const RichEmbed = require(`discord.js`).RichEmbed;

class Command
{
  constructor(name, description, args, roles, callback)
  {
    this.name = name;
    this.description = description;
    this.args = args;
    this.numRequiredArguments = 0;
    this.args.forEach(argument =>
    {
      if (argument.required)
        this.numRequiredArguments++;
    });
    var mentionIndex = 0;
    this.args.forEach((argument, index, args) =>
    {
      if (argument.isMention)
      {
        args[index].mentionIndex = mentionIndex;
        mentionIndex++;
      }
    });
    this.roles = roles;
    this.callback = callback;
  }

  isMentionMissing(message, passedArguments)
  {
    const mentions = message.mentions.users.map(user => user.toString());
    var mentionMissing = false;
    this.args.forEach((argument, index) =>
    {
      // If the argument expects a mention, make sure the passed argument is one.
      if (argument.isMention && passedArguments[index] !== mentions[argument.mentionIndex])
        // If we return here, it won't work properly because only an exception can break forEach().
        mentionMissing = true;
    });
    return mentionMissing;
  }

  execute(message, passedArguments)
  {
    const seeHelpMessage =
      `See \`${require(`config`).commandPrefix}${this.name} --help\` for usage.`;
    // Check if the user is not allowed to use the command.
    if (!this.roles && !common.findArray(message.member.roles.map(role => role.name),
      this.roles))
    {
      // TODO: handle no arguments.
      const logMessage =
        `${message.author.username} (${message.author}) attempted to use staff command \
${this.name} with arguments ${passedArguments}.`;
      logger.info(logMessage);
      common.sendErrorMessage(
        `Permission denied. This command can only be used by: \`${this.roles}\`.`, message);
      app.logChannel.sendMessage(logMessage);
    }
    else if (passedArguments[0] && passedArguments[0].toLowerCase() === `--help`)
    {
      const description = `**Description**: ${this.description}.\n`;
      var usage = `**Usage**: \`${require(`config`).commandPrefix}${this.name} [--help] `;
      // arguments is reserved.
      var argumentList = ``;
      this.args.map(argument =>
      {
        usage += `${argument.shortName} `;
        argumentList += `\`${argument.shortName}\``;
        if (argument.required && argument.isMention)
          argumentList += ` (Mention)`;
        else if (!argument.required && argument.isMention)
          argumentList += ` (Optional Mention)`;
        else if (!argument.required && !argument.isMention)
          argumentList += ` (Optional)`;
        argumentList += `: ${argument.explanation}\n`;
      });
      // Close the mini code block.
      usage += `\``;
      const helpEmbed = new RichEmbed(
        {
          title: `\`${this.name}\` Command Help`,
          description: `${description}${usage}\n${argumentList}`
        });
      message.reply(`here's the command help for \`${this.name}\`:`,
        {
          embed: helpEmbed
        });
    }
    else if (passedArguments.length < this.numRequiredArguments)
    {
      common.sendErrorMessage(
        `Too little arguments. At least ${this.numRequiredArguments} needed, given \
${passedArguments.length}. ${seeHelpMessage}`,
        message);
    }
    else if (passedArguments.length > this.args.length)
    {
      common.sendErrorMessage(
        `Too many arguments. No more than ${this.args.length} accepted, given \
${passedArguments.length}. ${seeHelpMessage}`,
        message);
      // Everything is good, run the command.
    }
    else if (this.isMentionMissing(message, passedArguments))
    {
      common.sendErrorMessage(`Expected mention(s), but one or more were not found.`, message);
    }
    else
    {
      try
      {
        // This callback can throw an exception if something goes wrong.
        this.callback(passedArguments, message);
        try
        {
          message.delete();
        }
        catch (error)
        {
          logger.error(
            `Failed to delete message, check if bot has message management permissions. \
  Error: ${error}.`
          );
        }
      }
      catch (error)
      {
        common.sendErrorMessage(error, message);
      }
    }
  }
}

module.exports = Command;
