const common = require(`../Common.js`);

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
    var mention_index = 0;
    this.args.forEach((argument, index, args) =>
    {
      if (argument.isMention)
      {
        args[index].mention_index = mention_index;
        mention_index++;
      }
    });
    this.roles = roles;
    this.callback = callback;
  }

  IsMentionMissing(message, passedArguments)
  {
    const mentions = message.mentions.users.map(user => user.toString());
    var mention_missing = false;
    this.args.forEach((argument, index) =>
    {
      // If the argument expects a mention, make sure the passed argument is one.
      if (argument.isMention && passedArguments[index] !== mentions[argument.mention_index])
        // If we return here, it won't work properly because only an exception can break forEach().
        mention_missing = true;
    });
    return mention_missing;
  }

  // Used by the help command.
  IsExecutable(message)
  {
    // If there are roles to fulfill, and the user's roles contain the command's.
    if (this.roles && common.FindArray(message.member.roles.map(role => role.name), this.roles))
      return true;
    // If there are no roles to fulfill.
    else if (!this.roles)
      return true;
    else
      return false;
  }

  Execute(message, passedArguments)
  {
    const see_help_message =
      `See \`${require(`config`).commandPrefix}${this.name} --help\` for usage.`;
    if (!this.IsExecutable(message))
    {
      common.SendPrivateInfoMessage(`${message.author.username} (${message.author}) attempted to
use staff command ${this.name} with argument(s) ${passedArguments}.`);
      common.SendErrorMessage(`Permission denied. This command can only be used by
${common.PrintArray(this.roles)}.`, message);
    }
    else if (passedArguments[0] && passedArguments[0].toLowerCase() === `--help`)
    {
      const description = `**Description**: ${this.description}\n`;
      var usage = `**Usage**: \`${require(`config`).commandPrefix}${this.name} [--help] `;
      // arguments is reserved.
      var argument_list = ``;
      this.args.map(argument =>
      {
        usage += `${argument.shortName} `;
        argument_list += `\`${argument.shortName}\``;
        if (argument.required && argument.isMention)
          argument_list += ` (Mention)`;
        else if (!argument.required && argument.isMention)
          argument_list += ` (Optional Mention)`;
        else if (!argument.required && !argument.isMention)
          argument_list += ` (Optional)`;
        argument_list += `: ${argument.explanation}\n`;
      });
      // Close the mini code block.
      usage += `\``;
      const help_embed = new RichEmbed(
        {
          title: `\`${this.name}\` Command Help`,
          description: `${description}${usage}\n${argument_list}`
        });
      message.reply(`here's the command help for \`${this.name}\`:`,
        {
          embed: help_embed
        });
    }
    else if (passedArguments.length < this.numRequiredArguments)
    {
      common.SendErrorMessage(
        `Too little arguments. At least ${this.numRequiredArguments} needed, given \
${passedArguments.length}. ${see_help_message}`,
        message);
    }
    else if (passedArguments.length > this.args.length)
    {
      common.SendErrorMessage(
        `Too many arguments. No more than ${this.args.length} accepted, given \
${passedArguments.length}. ${see_help_message}`,
        message);
      // Everything is good, run the command.
    }
    else if (this.IsMentionMissing(message, passedArguments))
    {
      common.SendErrorMessage(`Expected mention(s), but one or more were not found.`, message);
    }
    else
    {
      this.callback(passedArguments, message);
      if (message.deletable)
        message.delete();
    }
  }
}

module.exports = Command;
