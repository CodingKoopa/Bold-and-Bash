'use strict';

// Verify that the needed environment variables are set.
require(`checkenv`).check();

const fs = require(`fs`);
const path = require(`path`);

const discord = require(`discord.js`);
const schedule = require(`node-schedule`);

const common = require(`./Common.js`);
const logger = require(`./Logger.js`);
const message_logger = require(`./MessageLogger.js`);
const state = require(`./State.js`);
const data = require(`./Data.js`);

function SetPlayingStatus()
{
  client.user.setActivity(state.playing_statuses[common.GetRandomNumber(0,
    state.playing_statuses.length - 1)]);
}

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

logger.Info(`Bold and Bash Version ${require(`../package.json`).version} starting.`);


// Handle process events.
logger.Info(`Setting up process event handlers.`);

process.on(`unhandledRejection`, err =>
{
  throw err;
});

process.on(`SIGINT`, () =>
{
  logger.Info(`Shutting down.`);
  process.exit();
});

logger.Info(`Making sure data and log directories exist.`);
if (!fs.existsSync(`./Data/`))
  fs.mkdirSync(`./Data/`);
if (!fs.existsSync(`./MessageLogs/`))
  fs.mkdirSync(`./MessageLogs/`);

logger.Info(`Reading data.`);
data.ReadWarnings();
data.ReadBans();
data.ReadQuotes();
if (process.env.BAB_CUSTOM_PLAYING_STATUSES_ENABLED === `true`)
  data.ReadPlayingStatuses();


// Load all command modules.
logger.Info(`Loading command modules.`);
let command_list = [];
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


// Handle Discord events.
logger.Info(`Setting up Discord event handlers.`);
const client = new discord.Client();

client.on(`ready`, () =>
{
  state.log_channel = client.channels.cache.get(process.env.BAB_LOG_CHANNEL_ID);
  if (!state.log_channel)
  {
    logger.Error(`Logging channel #${process.env.BAB_LOG_CHANNEL_ID} not found.`);
    throw (`LOG_CHANNEL_NOT_FOUND`);
  }
  state.showcase_channel = client.channels.cache.get(process.env.BAB_SHOWCASE_CHANNEL_ID);
  if (!state.showcase_channel)
  {
    logger.Error(`Showcase channel #${process.env.BAB_SHOWCASE_CHANNEL_ID} not found.`);
    throw (`SHOWCASE_CHANNEL_NOT_FOUND`);
  }
  state.verification_channel = client.channels.cache.get(process.env.BAB_VERIFICATION_CHANNEL_ID);
  if (!state.verification_channel)
  {
    logger.Error(`Verification channel #${process.env.BAB_VERIFICATION_CHANNEL_ID} not found.`);
    throw (`VERIFICATION_CHANNEL_NOT_FOUND`);
  }
  state.guild = state.log_channel.guild;

  logger.Info(`Bot is now online and connected to server.`);

  if (process.env.BAB_CUSTOM_PLAYING_STATUSES_ENABLED === `true`)
    SetPlayingStatus();
});

client.on(`message`, message =>
{
  // Ignore bot messages.
  if (message.author.bot)
    return;

  // Handle DM messages.
  if (!message.guild)
  {
    // We want to log DM attempts / modmail.
    message_logger.Message(FormatMessage(message, `DM`));
    state.log_channel.send(`DM from ${message.author} (${message.author.id}): \
"${message.content}".`);
    return;
  }

  // Don't log messages in the verification channel, because we don't have permission to do so, yet.
  if (message.channel !== state.verification_channel)
    message_logger.Message(FormatMessage(message, `#${message.channel.name}`));

  // Handle commands.
  if (message.content.startsWith(process.env.BAB_PREFIX))
  {
    // If the message starts with more than one of the command prefix, don't do anything.
    // For example: "...well ok then."
    if (message.content[0] === message.content[1])
      return;
    let commands = [];
    // If in the verification channel, only check the first statement.
    if (message.channel === state.verification_channel)
      commands = message.content.split(/&&/g, 1);
    else
      commands = message.content.split(/&&/g);
    let ret = 0;
    try
    {
      commands.forEach((command, command_index, command_array) =>
      {
        const split_message = command.match(/([\w|!|.|@|#|<|>|:|/|(|)|-]+)|("[^"]+")/g);

        const entered_command = split_message[0].slice(process.env.BAB_PREFIX.length).toLowerCase();
        let args = split_message.slice(1, split_message.length);
        // Strip any quotes, they're not needed any more.
        args.forEach((arg, arg_index, arg_array) =>
        {
          if (arg[0] === `"`)
            arg_array[arg_index] = arg.substring(1, arg.length - 1);
        });
        logger.Silly(`Command entered: ${entered_command} with arguments ${args}.`);

        // Get the index of the command in the list.
        const index = command_list.map(command =>
          command.name.toLowerCase()).indexOf(entered_command);

        // Restrict verification channel to the verify command.
        if (message.channel === state.verification_channel && entered_command !== `verify`)
        {
          message.delete();
        }
        // The help command is handled differently. Consider it to be, like, a shell builtin, like
        // alias.
        else if (entered_command === `help`)
        {
          message.reply(`private messaging bot help to you.`);
          let command_name_list = ``;
          command_list.forEach(command =>
          {
            // Only add commands that the user can run to the list.
            if (command.IsExecutable(message))
              command_name_list += `\`${command.name}\`: ${command.description}\n`;
          });
          const help_embed = new discord.MessageEmbed({
            title: `Bold and Bash Help`,
            description: command_name_list
          });
          message.author.send(`Here's the help for this bot:`, {embed: help_embed}).then(() =>
            message.delete());
        }
        // IF the command could be found.
        else if (index >= 0)
        {
          // Only delete the message if it's the last one in the array.
          ret = command_list[index].Execute(message, args,
            command_index + 1 === command_array.length ? true : false);
        }
        // If the command couldn't be found.
        else
        {
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
  else if (message.channel === state.verification_channel)
    message.delete();
});

client.on(`guildMemberAdd`, () => state.stats.joins += 1 );

client.on(`guildMemberRemove`, () => state.stats.leaves += 1 );

// Schedule events.
logger.Info(`Scheduling daily events.`);
// Output the stats for state.stats every 24 hours, and unban where necessary.
schedule.scheduleJob({
  hour: 23,
  minute: 59
}, () =>
{
  common.SendPrivateInfoMessage(`Here are today's stats for ${(new Date()).toLocaleDateString()}! \
${state.stats.joins} users have joined, ${state.stats.leaves} users have left, \
${state.stats.warnings} warnings have been issued.`);

  // Clear the stats for the day.
  state.stats.joins = 0;
  state.stats.leaves = 0;
  state.stats.warnings = 0;

  if (process.env.BAB_CUSTOM_PLAYING_STATUSES_ENABLED === `true`)
    SetPlayingStatus();

  const current_date = new Date;
  const num_seconds = current_date.getTime();
  state.bans.forEach((ban, index, array) =>
  {
    if (ban.unban_date !== null && !ban.cleared && ban.unban_date <= num_seconds)
    {
      common.SendPrivateInfoMessage(`Unbanning ${ban.username}.`);
      // Unban the user.
      state.guild.members.unban(ban.id, `Scheduled unbanning.`).then(() =>
      {
        let unban_message = `You have been unbanned from the server**${state.guild.name}**.`;
        if (process.env.BAB_INVITE_LINK)
          unban_message += ` Here's the invite link: ${process.env.BAB_INVITE_LINK}.`;
        client.users.cache.get(ban.id).send(unban_message).catch(error =>
          common.SendPrivateErrorMessage(`Failed to send unban message to ${ban.username}.`,
            error));
        array[index].cleared = true;
      }, error => common.SendPrivateErrorMessage(`Failed to unban ${ban.username}.`, error));
    }
  });
  data.WriteBans();
});
// Post a JSON backup every week.
schedule.scheduleJob({
  hour: 23,
  minute: 59,
  dayOfWeek: 6
}, () =>
{
  state.log_channel.send(`Here are the JSON backups for this week:`).then(message =>
  {
    state.log_channel.send(`:hammer: Bans :hammer: `, new discord.Attachment(common.BANS_PATH))
      .catch(error => common.SendErrorMessage(message, `Failed to fetch bans file.`, error));
    state.log_channel.send(`:warning: Warnings :warning: `,
      new discord.Attachment(common.WARNINGS_PATH))
      .catch(error => common.SendErrorMessage(message, `Failed to fetch warnings file.`, error));
    state.log_channel.send(`:speech_balloon: Quotes :speech_balloon: `,
      new discord.Attachment(common.QUOTES_PATH))
      .catch(error => common.SendErrorMessage(message, `Failed to fetch quotes file.`, error));
  });
});

// Log into Discord.
logger.Info(`Logging into Discord.`);
client.login(process.env.BAB_TOKEN);
logger.Info(`Startup completed. Established connection to Discord.`);
