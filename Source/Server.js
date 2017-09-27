const fs = require(`fs`);
const path = require(`path`);

const discord = require(`discord.js`);
const config = require(`config`);
const schedule = require(`node-schedule`);

const common = require(`./Common.js`);
const logger = require(`./Logger.js`);
const messageLogger = require(`./MessageLogger.js`);
const app = require(`./App.js`);
const data = require(`./Data.js`);

logger.info(`KoopaBot Version ${require(`../package.json`).version} Starting.`);

var commandList = [];
var client = new discord.Client();

process.on(`unhandledRejection`, function onError(err)
{
  throw err;
});

process.on(`SIGINT`, () =>
{
  logger.info(`Shutting down.`);
  process.exit();
});

client.on(`ready`, () =>
{
  // Initalize app channels.
  app.logChannel = client.channels.get(config.logChannel);
  if (!app.logChannel)
  {
    logger.error(`Logging channel #${config.logChannel} not found.`);
    throw (`LOG_CHANNEL_NOT_FOUND`);
  }
  app.showcaseChannel = client.channels.get(config.showcaseChannel);
  if (!app.showcaseChannel)
  {
    logger.error(`Showcase channel #${config.showcaseChannel} not found.`);
    throw (`SHOWCASE_CHANNEL_NOT_FOUND`);
  }
  app.verificationChannel = client.channels.get(config.verificationChannel);
  if (!app.verificationChannel)
  {
    logger.error(`Verification channel #${config.verificationChannel} not found.`);
    throw (`VERIFICATION_CHANNEL_NOT_FOUND`);
  }
  app.guild = app.logChannel.guild;

  logger.info(`Bot is now online and connected to server.`);
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
  common.sendPrivateInfoMessage(`Here are today's stats for ${(new Date()).toLocaleDateString()}!
${app.stats.joins} users have joined, ${app.stats.leaves} users have left, ${app.stats.warnings}
warnings have been issued.`);

  // Clear the stats for the day.
  app.stats.joins = 0;
  app.stats.leaves = 0;
  app.stats.warnings = 0;

  const currentDate = new Date;
  const numSeconds = currentDate.getTime();
  app.bans.forEach((ban, index, array) =>
  {
    if (!ban.cleared && ban.unbanDate <= numSeconds)
    {
      common.sendPrivateInfoMessage(`Unbanning ${ban.username}.`);
      // Unban the user.
      app.guild.unban(ban.id, `Scheduled unbanning.`).then(() =>
      {
        client.users.get(ban.id).send(`You have been unbanned from the server
**${app.guild.name}**. Here's the invite link: ${config.inviteLink}.`).catch(error =>
          common.sendPrivateErrorMessage(`Failed to send unban message to ${ban.username}.`,
            error));
        array[index].cleared = true;
      }, error => common.sendPrivateErrorMessage(`Failed to unban ${ban.username}.`, error));
    }
  });
  data.flushBans();
});

function padString(string, number)
{
  return string.length < number ? string.padEnd(number) : string.slice(0, number);
}

function formatMessage(message, channel)
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
  // 1: The space separating the message info from the message itself.
  return `[${padString(channel, 12)}] ${padString(message.author.username, 12)} \
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
    messageLogger.silly(formatMessage(message, `DM`));
    return;
  }
  // Don't log messages in the verification channel, because we don't have permission to do so, yet.
  if (message.channel !== app.verificationChannel)
    messageLogger.silly(formatMessage(message, `#${message.channel.name}`));

  if (message.content.startsWith(config.commandPrefix))
  {
    // If the message starts with more than one of the command prefix, don't do anything.
    // For example: "...well ok then."
    if (message.content[0] === message.content[1])
      return;
    const splitMessage = message.content.match(/([\w|.|@|#|<|>|:|/|(|)|-]+)|("[^"]+")/g);
    const enteredCommand = splitMessage[0].slice(config.commandPrefix.length).toLowerCase();
    var args = splitMessage.slice(1, splitMessage.length);
    // Strip any quotes, they're not needed any more.
    args.forEach((arg, index, array) =>
    {
      if (arg[0] === `"`)
        array[index] = arg.substring(1, arg.length - 1);
    });
    logger.silly(`Command entered: ${enteredCommand} with args ${args}.`);

    // Get the index of the command in the list.
    const index = commandList.map(command => command.name.toLowerCase()).indexOf(enteredCommand);

    // The help command is handled differently. Consider it to be, like, a shell builtin like alias.
    if (enteredCommand === `help`)
    {
      message.channel.send(`${message.author} private messaging bot help to you.`);
      var commandNameList = ``;
      commandList.forEach(command =>
      {
        // Only add commands that the user can run to the list.
        if (command.isExecutable(message))
          commandNameList += `\`${command.name}\`: ${command.description}\n`;
      });
      const helpEmbed = new discord.RichEmbed(
        {
          title: `Bold and Bash Help`,
          description: commandNameList
        });
      message.author.send(`Here's the help for this bot:`, {embed: helpEmbed}).then(() =>
        message.delete());
    }
    // Restrict verification channel to the verify command.
    else if (message.channel === app.verificationChannel && enteredCommand !== `verify`)
      message.delete();
    else if (index >= 0)
      commandList[index].execute(message, args);
    else
      common.sendErrorMessage(`Command not found. See: \`.help\`.`, message);
  }
  // Clean up, for the verification channel.
  else if (message.channel === app.verificationChannel)
    message.delete();
});

// Load all command modules.
logger.info(`Loading Command Modules.`);
commandList = [];
fs.readdirSync(`Source/Commands/`).forEach(function(file)
{
  // Load the module if it's a script.
  if (path.extname(file) === `.js`)
  {
    if (file.includes(`.disabled`))
    {
      logger.debug(`Did not load disabled module: ${file}`);
    }
    else
    {
      logger.debug(`Loaded module: ${file}`);
      commandList.push(require(`./Commands/${file}`).command);
    }
  }
});

data.readWarnings();
data.readBans();

if (config.clientLoginToken)
{
  client.login(config.clientLoginToken);
  logger.info(`Startup completed. Established connection to Discord.`);
}
else
{
  logger.error(`Cannot establish connection to Discord. Client login token is not defined.`);
  throw (`MISSING_CLIENT_LOGIN_TOKEN`);
}
