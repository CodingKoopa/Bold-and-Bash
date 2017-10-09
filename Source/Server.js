'use strict';

const fs = require(`fs`);
const path = require(`path`);

const discord = require(`discord.js`);
const config = require(`config`);
const schedule = require(`node-schedule`);

const common = require(`./Common.js`);
const logger = require(`./Logger.js`);
const message_logger = require(`./MessageLogger.js`);
const app = require(`./App.js`);
const data = require(`./Data.js`);

logger.Info(`Bold and Bash Version ${require(`../package.json`).version} Starting.`);

const client = new discord.Client();
let command_list = [];

// Load all command modules.
logger.Info(`Loading Command Modules.`);
fs.readdirSync(`Source/Commands/`).forEach(file =>
{
  // Load the module if it's a script.
  if (path.extname(file) === `.js`)
  {
    if (file.includes(`.disabled`))
    {
      logger.Debug(`Did not load disabled module: ${file}`);
    }
    else
    {
      logger.Debug(`Loaded module: ${file}`);
      command_list.push(require(`./Commands/${file}`).command);
    }
  }
});

data.ReadWarnings();
data.ReadBans();
data.ReadQuotes();
if (!fs.existsSync(`./Data/`))
  fs.mkdirSync(`./Data/`);

process.on(`unhandledRejection`, err =>
{
  throw err;
});

process.on(`SIGINT`, () =>
{
  logger.Info(`Shutting down.`);
  process.exit();
});

function SetPlayingStatus()
{
  if (config.playing_statuses)
  {
    client.user.setGame(config.playing_statuses[common.GetRandomNumber(0,
      config.playing_statuses.length - 1)]);
  }
}

client.on(`ready`, () =>
{
  // Initalize app channels.
  app.log_channel = client.channels.get(config.log_channel);
  if (!app.log_channel)
  {
    logger.Error(`Logging channel #${config.log_channel} not found.`);
    throw (`LOG_CHANNEL_NOT_FOUND`);
  }
  app.showcase_channel = client.channels.get(config.showcase_channel);
  if (!app.showcase_channel)
  {
    logger.Error(`Showcase channel #${config.showcase_channel} not found.`);
    throw (`SHOWCASE_CHANNEL_NOT_FOUND`);
  }
  app.verification_channel = client.channels.get(config.verification_channel);
  if (!app.verification_channel)
  {
    logger.Error(`Verification channel #${config.verification_channel} not found.`);
    throw (`VERIFICATION_CHANNEL_NOT_FOUND`);
  }
  app.guild = app.log_channel.guild;

  logger.Info(`Bot is now online and connected to server.`);
  SetPlayingStatus();
});

client.on(`guildMemberAdd`, () => app.stats.joins += 1 );

client.on(`guildMemberRemove`, () => app.stats.leaves += 1 );

// Output the stats for app.stats every 24 hours, and unban where necessary.
schedule.scheduleJob({
  hour: 0,
  minute: 0
}, function()
{
  common.SendPrivateInfoMessage(`Here are today's stats for ${(new Date()).toLocaleDateString()}!
${app.stats.joins} users have joined, ${app.stats.leaves} users have left, ${app.stats.warnings}
warnings have been issued.`);

  // Clear the stats for the day.
  app.stats.joins = 0;
  app.stats.leaves = 0;
  app.stats.warnings = 0;

  SetPlayingStatus();

  const current_date = new Date;
  const num_seconds = current_date.getTime();
  app.bans.forEach((ban, index, array) =>
  {
    if (!ban.cleared && ban.unban_date <= num_seconds)
    {
      common.SendPrivateInfoMessage(`Unbanning ${ban.username}.`);
      // Unban the user.
      app.guild.unban(ban.id, `Scheduled unbanning.`).then(() =>
      {
        client.users.get(ban.id).send(`You have been unbanned from the server
**${app.guild.name}**. Here's the invite link: ${config.invite_link}.`).catch(error =>
          common.SendPrivateErrorMessage(`Failed to send unban message to ${ban.username}.`,
            error));
        array[index].cleared = true;
      }, error => common.SendPrivateErrorMessage(`Failed to unban ${ban.username}.`, error));
    }
  });
  data.WriteBans();
});

function PadString(string, number)
{
  return string.length < number ? string.padEnd(number) : string.slice(0, number);
}

function FormatMessage(message, channel)
{
  // Breakdown of the message logging (Should take up exactly 50 chars.):
  // 1: The opening bracket for the channel.
  // 12: The channel name, or PM (Including the #, if present.).
  // 1: The closing bracket for the channel.
  // 1: The space separating the channel section from the username.
  // 12: The username.
  // 1: The space separating the username section from the user ID section.
  // 1: The opening parenthesis for the user ID.
  // 18: The user ID.
  // 1: The closing parenthesis the user ID.
  // 1: The colon indicating the message.
  // 1: The space separating the message Info from the message itself.
  return `[${PadString(channel, 12)}] ${PadString(message.author.username, 12)} \
(${message.author.id}): ${message.content}`;
}

client.on(`message`, message =>
{
  // Ignore bot messages.
  if (message.author.bot)
    return;

  if (!message.guild)
  {
    // We want to log DM attempts.
    message_logger.Message(FormatMessage(message, `DM`));
    return;
  }
  // Don't log messages in the verification channel, because we don't have permission to do so, yet.
  if (message.channel !== app.verification_channel)
    message_logger.Message(FormatMessage(message, `#${message.channel.name}`));

  if (message.content.startsWith(config.command_prefix))
  {
    // If the message starts with more than one of the command prefix, don't do anything.
    // For example: "...well ok then."
    if (message.content[0] === message.content[1])
      return;
    const commands = message.content.split(/&&/g);
    let ret = 0;
    try
    {
      commands.forEach((command, command_index, command_array) =>
      {
        const split_message = command.match(/([\w|.|@|#|<|>|:|/|(|)|-]+)|("[^"]+")/g);

        const entered_command = split_message[0].slice(config.command_prefix.length).toLowerCase();
        let args = split_message.slice(1, split_message.length);
        // Strip any quotes, they're not needed any more.
        args.forEach((arg, arg_index, arg_array) =>
        {
          if (arg[0] === `"`)
            arg_array[arg_index] = arg.substring(1, arg.length - 1);
        });
        logger.Silly(`Command entered: ${entered_command} with args ${args}.`);

        // Get the index of the command in the list.
        const index = command_list.map(command =>
          command.name.toLowerCase()).indexOf(entered_command);

        // The help command is handled differently. Consider it to be, like, a shell builtin, like
        // alias.
        if (entered_command === `help`)
        {
          message.channel.send(`${message.author} private messaging bot help to you.`);
          let command_name_list = ``;
          command_list.forEach(command =>
          {
            // Only add commands that the user can run to the list.
            if (command.IsExecutable(message))
              command_name_list += `\`${command.name}\`: ${command.description}\n`;
          });
          const help_embed = new discord.RichEmbed({
            title: `Bold and Bash Help`,
            description: command_name_list
          });
          message.author.send(`Here's the help for this bot:`, {embed: help_embed}).then(() =>
            message.delete());
        }
        // Restrict verification channel to the verify command.
        else if (message.channel === app.verification_channel && entered_command !== `verify`)
        {
          message.delete();
        }
        else if (index >= 0)
        {
          ret = command_list[index].Execute(message, args,
            command_index + 1 === command_array.length ? true : false);
        }
        else
        {
          common.SendErrorMessage(message, `Command not found. See: \`.help\`.`);
          ret = 1;
        }

        // With &&, if one statement fails, then the rest shouldn't be executed.
        if (ret !== 0)
          throw `STATEMENT_FAILED`;
      });
    }
    catch(e)
    {
      if (commands.length > 1)
        common.SendErrorMessage(message, `A statement failed, so the rest of the && combination \
was not executed.`);
    }
  }
  // Clean up, for the verification channel.
  else if (message.channel === app.verification_channel)
    message.delete();
});

if (config.client_login_token)
{
  client.login(config.client_login_token);
  logger.Info(`Startup completed. Established connection to Discord.`);
}
else
{
  logger.Error(`Cannot establish connection to Discord. Client login token is not defined.`);
  throw (`MISSING_CLIENT_LOGIN_TOKEN`);
}
