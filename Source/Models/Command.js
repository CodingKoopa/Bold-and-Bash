const common = require(`../Common.js`);

const RichEmbed = require(`discord.js`).RichEmbed;

class Command
{
  constructor(name, description, args, roles, callback)
  {
    this.name = name;
    this.description = description;
    this.args = args;
    this.num_required_arguments = 0;
    this.args.forEach(argument =>
    {
      if (argument.required)
        this.num_required_arguments++;
    });
    let mention_index = 0;
    this.args.forEach((argument, index, args) =>
    {
      if (argument.is_mention)
      {
        args[index].mention_index = mention_index;
        mention_index++;
      }
    });
    this.roles = roles;
    this.callback = callback;
  }

  IsMentionMissing(message, passed_arguments)
  {
    const mentions = message.mentions.users.map(user => user.toString());
    let mention_missing = false;
    this.args.forEach((argument, index) =>
    {
      // If the argument expects a mention, make sure the passed argument is one.
      if (argument.is_mention && passed_arguments[index] !== mentions[argument.mention_index])
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

  Execute(message, passed_arguments)
  {
    const see_help_message =
      `See \`${require(`config`).command_prefix}${this.name} --help\` for usage.`;
    if (!this.IsExecutable(message))
    {
      common.SendPrivateInfoMessage(`${message.author.username} (${message.author}) attempted to
use staff command ${this.name} with argument(s) ${passed_arguments}.`);
      common.SendErrorMessage(message, `Permission denied. This command can only be used by
${common.PrintArray(this.roles)}.`);
    }
    else if (passed_arguments[0] && passed_arguments[0].toLowerCase() === `--help`)
    {
      const description = `**Description**: ${this.description}\n`;
      var usage = `**Usage**: \`${require(`config`).command_prefix}${this.name} [--help] `;
      // arguments is reserved.
      let argument_list = ``;
      this.args.map(argument =>
      {
        usage += `${argument.short_name} `;
        argument_list += `\`${argument.short_name}\``;
        if (argument.required && argument.is_mention)
          argument_list += ` (Mention)`;
        else if (!argument.required && argument.is_mention)
          argument_list += ` (Optional Mention)`;
        else if (!argument.required && !argument.is_mention)
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
    else if (passed_arguments.length < this.num_required_arguments)
    {
      common.SendErrorMessage(
        `Too little arguments. At least ${this.num_required_arguments} needed, given \
${passed_arguments.length}. ${see_help_message}`,
        message);
    }
    else if (passed_arguments.length > this.args.length)
    {
      common.SendErrorMessage(
        `Too many arguments. No more than ${this.args.length} accepted, given \
${passed_arguments.length}. ${see_help_message}`,
        message);
    }
    else if (this.IsMentionMissing(message, passed_arguments))
    {
      common.SendErrorMessage(message, `Expected mention(s), but one or more were not found.`);
    }
    else
    {
      this.callback(message, passed_arguments);
      if (message.deletable)
        message.delete();
    }
  }
}

module.exports = Command;
