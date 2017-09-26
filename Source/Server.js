const fs = require(`fs`);
const path = require(`path`);

const discord = require(`discord.js`);
const config = require(`config`);
const schedule = require(`node-schedule`);

const common = require(`./Common.js`);
const logger = require(`./Logging.js`);
const app = require(`./App.js`);
const data = require(`./Data.js`);

logger.info(`KoopaBot Version ${require(`../package.json`).version} Starting.`);

var commandList = [];
var cachedTriggers = [];
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

// Output the stats for app.stats every 24 hours.
// Server is in UTC mode, 11:30 EST would be 03:30 UTC.
schedule.scheduleJob(
  {
    hour: 3,
    minute: 30
  }, function()
  {
    logger.info(
      `Here are today's stats for ${(new Date()).toLocaleDateString()}! ${app.stats.joins} users \
have joined, ${app.stats.leaves} users have left, ${app.stats.warnings} warnings have been issued.`
    );
    app.logChannel.send(
      `Here are today's stats for ${(new Date()).toLocaleDateString()}! ${app.stats.joins} users \
have joined, ${app.stats.leaves} users have left, ${app.stats.warnings} warnings have been issued.`
    );

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
        const logMessage = `Unbanning ${ban.username}.`;
        logger.info(logMessage);
        app.logChannel.send(logMessage);
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

client.on(`message`, message =>
{
  if (message.author.bot && !message.content.startsWith(`.ban`))
  {
    return;
  }

  if (!message.guild)
  {
    // We want to log PM attempts.
    logger.info(`${message.author.username} ${message.author} [PM]: ${message.content}`);
    app.logChannel.send(`${message.author} [PM]: ${message.content}`);
    message.reply(config.pmReply);
    return;
  }

  logger.verbose(
    `${message.author.username} ${message.author} [Channel: ${message.channel.name} \
${message.channel}]: ${message.content}`
  );

  if (message.content.startsWith(config.commandPrefix))
  {
    const splitMessage = message.content.match(/([\w|.|@|#|<|>|-]+)|("[^"]+")/g);
    const enteredCommand = splitMessage[0].slice(config.commandPrefix.length).toLowerCase();
    const args = splitMessage.slice(1, splitMessage.length);
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
      message.author.send(`Here's the help for this bot:`, { embed: helpEmbed}).then(() =>
      {
        message.delete();
      });
    }
    else if (index >= 0)
      commandList[index].execute(message, args);
    else
      common.sendErrorMessage(`Command not found. See: \`.help\`.`, message);
  }
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
      logger.info(`Did not load disabled module: ${file}`);
    }
    else
    {
      logger.info(`Loaded module: ${file}`);
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
