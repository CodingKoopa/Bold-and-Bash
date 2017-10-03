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

var command_list = [];
var client = new discord.Client();

process.on(`unhandledRejection`, function onError(err)
{
  throw err;
});

process.on(`SIGINT`, () =>
{
  logger.Info(`Shutting down.`);
  process.exit();
});

client.on(`ready`, () =>
{
  // Initalize app channels.
  app.logChannel = client.channels.get(config.logChannel);
  if (!app.logChannel)
  {
    logger.Error(`Logging channel #${config.logChannel} not found.`);
    throw (`LOG_CHANNEL_NOT_FOUND`);
  }
  app.showcaseChannel = client.channels.get(config.showcaseChannel);
  if (!app.showcaseChannel)
  {
    logger.Error(`Showcase channel #${config.showcaseChannel} not found.`);
    throw (`SHOWCASE_CHANNEL_NOT_FOUND`);
  }
  app.verificationChannel = client.channels.get(config.verificationChannel);
  if (!app.verificationChannel)
  {
    logger.Error(`Verification channel #${config.verificationChannel} not found.`);
    throw (`VERIFICATION_CHANNEL_NOT_FOUND`);
  }
  app.guild = app.logChannel.guild;

  logger.Info(`Bot is now online and connected to server.`);
});

client.on(`guildMemberAdd`, () =>
{
  app.stats.joins += 1;
});

client.on(`guildMemberRemove`, () =>
{
  app.stats.leaves += 1;
});

// Output the stats for app.stats every 24 hours, and unban where necessary.
schedule.scheduleJob(function()
{
  common.SendPrivateInfoMessage(`Here are today's stats for ${(new Date()).toLocaleDateString()}!
${app.stats.joins} users have joined, ${app.stats.leaves} users have left, ${app.stats.warnings}
warnings have been issued.`);

  // Clear the stats for the day.
  app.stats.joins = 0;
  app.stats.leaves = 0;
  app.stats.warnings = 0;

  const current_date = new Date;
  const num_seconds = current_date.getTime();
  app.bans.forEach((ban, index, array) =>
  {
    if (!ban.cleared && ban.unbanDate <= num_seconds)
    {
      common.SendPrivateInfoMessage(`Unbanning ${ban.username}.`);
      // Unban the user.
      app.guild.unban(ban.id, `Scheduled unbanning.`).then(() =>
      {
        client.users.get(ban.id).send(`You have been unbanned from the server
**${app.guild.name}**. Here's the invite link: ${config.inviteLink}.`).catch(Error =>
          common.SendPrivateErrorMessage(`Failed to send unban message to ${ban.username}.`,
            Error));
        array[index].cleared = true;
      }, Error => common.SendPrivateErrorMessage(`Failed to unban ${ban.username}.`, Error));
    }
  });
  data.FlushBans();
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
  if (message.channel !== app.verificationChannel)
    message_logger.Message(FormatMessage(message, `#${message.channel.name}`));

  if (message.content.startsWith(config.commandPrefix))
  {
    // If the message starts with more than one of the command prefix, don't do anything.
    // For example: "...well ok then."
    if (message.content[0] === message.content[1])
      return;
    const split_message = message.content.match(/([\w|.|@|#|<|>|:|/|(|)|-]+)|("[^"]+")/g);
    const entered_command = split_message[0].slice(config.commandPrefix.length).toLowerCase();
    var args = split_message.slice(1, split_message.length);
    // Strip any quotes, they're not needed any more.
    args.forEach((arg, index, array) =>
    {
      if (arg[0] === `"`)
        array[index] = arg.substring(1, arg.length - 1);
    });
    logger.Silly(`Command entered: ${entered_command} with args ${args}.`);

    // Get the index of the command in the list.
    const index = command_list.map(command => command.name.toLowerCase()).indexOf(entered_command);

    // The help command is handled differently. Consider it to be, like, a shell builtin like alias.
    if (entered_command === `help`)
    {
      message.channel.send(`${message.author} private messaging bot help to you.`);
      var command_name_list = ``;
      command_list.forEach(command =>
      {
        // Only add commands that the user can run to the list.
        if (command.IsExecutable(message))
          command_name_list += `\`${command.name}\`: ${command.description}\n`;
      });
      const help_embed = new discord.RichEmbed(
        {
          title: `Bold and Bash Help`,
          description: command_name_list
        });
      message.author.send(`Here's the help for this bot:`, {embed: help_embed}).then(() =>
        message.delete());
    }
    // Restrict verification channel to the verify command.
    else if (message.channel === app.verificationChannel && entered_command !== `verify`)
      message.delete();
    else if (index >= 0)
      command_list[index].Execute(message, args);
    else
      common.SendErrorMessage(`Command not found. See: \`.help\`.`, message);
  }
  // Clean up, for the verification channel.
  else if (message.channel === app.verificationChannel)
    message.delete();
});

// Load all command modules.
logger.Info(`Loading Command Modules.`);
command_list = [];
fs.readdirSync(`Source/Commands/`).forEach(function(file)
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

if (config.clientLoginToken)
{
  client.login(config.clientLoginToken);
  logger.Info(`Startup completed. Established connection to Discord.`);
}
else
{
  logger.Error(`Cannot establish connection to Discord. Client login token is not defined.`);
  throw (`MISSING_CLIENT_LOGIN_TOKEN`);
}
