const discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('config');
const schedule = require('node-schedule');

const logger = require('./logging.js');
const app = require('./app.js');
const data = require('./data.js');

var cachedModules = [];
var cachedTriggers = [];
var client = new discord.Client();

function findArray(haystack, arr) {
  return arr.some(function(v) {
    return haystack.indexOf(v) >= 0;
  });
}

process.on('unhandledRejection', function onError(err) {
  throw err;
});

client.on('ready', () => {
  // Initalize app channels.
  app.logChannel = client.channels.get(config.logChannel);
  app.guild = app.logChannel.guild;

  logger.info('Bot is now online and connected to server.');
});

client.on("guildMemberAdd", (member) => {
  app.stats.joins += 1;
});

client.on("guildMemberRemove", (member) => {
  app.stats.leaves += 1;
});

// Output the stats for app.stats every 24 hours.
// Server is in UTC mode, 11:30 EST would be 03:30 UTC.
schedule.scheduleJob({
  hour: 3,
  minute: 30
}, function() {
  logger.info(`Here are today's stats for ${(new Date()).toLocaleDateString()}! ${app.stats.joins} users have joined, ${app.stats.leaves} users have left, ${app.stats.warnings} warnings have been issued.`);
  app.logChannel.sendMessage(`Here are today's stats for ${(new Date()).toLocaleDateString()}! ${app.stats.joins} users have joined, ${app.stats.leaves} users have left, ${app.stats.warnings} warnings have been issued.`);

  // Clear the stats for the day.
  app.stats.joins = 0;
  app.stats.leaves = 0;
  app.stats.warnings = 0;
});

client.on('message', message => {
  if (message.author.bot && message.content.startsWith('.ban') == false) {
    return;
  }

  if (message.guild == null) {
    // We want to log PM attempts.
    logger.info(`${message.author.username} ${message.author} [PM]: ${message.content}`);
    app.logChannel.sendMessage(`${message.author} [PM]: ${message.content}`);
    message.reply(config.pmReply);
    return;
  }

  logger.verbose(`${message.author.username} ${message.author} [Channel: ${message.channel.name} ${message.channel}]: ${message.content}`);

  if (message.content.startsWith(config.commandPrefix)) {
    let cmd = message.content.split(' ')[0].slice(1);

    // Check by the name of the command.
    let cachedModule = cachedModules[`${cmd}.js`];
    let cachedModuleType = 'Command';
    // Check by the quotes in the configuration.
    if (cachedModule == null) {
      cachedModule = config.quotes[cmd];
      cachedModuleType = 'Quote';
    }

    if (cachedModule) {
      // Check access permissions.
      if (cachedModule.roles != undefined && findArray(message.member.roles.map(function(x) {
          return x.name;
        }), cachedModule.roles) == false) {
        app.logChannel.sendMessage(`${message.author} attempted to use admin command: ${message.content}`);
        logger.info(`${message.author.username} ${message.author} attempted to use admin command: ${message.content}`);
        return false;
      }

      logger.info(`${message.author.username} ${message.author} [Channel: ${message.channel}] executed command: ${message.content}`);
      message.delete();

      try {
        if (cachedModuleType == 'Command') {
          cachedModule.command(message);
        } else if (cachedModuleType == 'Quote') {
          cachedModules['quote.js'].command(message, cachedModule.reply);
        }
      } catch (err) {
        logger.error(err);
      }

      // Warn after running command?
      try {
        // Check if the command requires a warning.
        if (cmd != 'warn' && cachedModule.warn == true) {
          // Access check to see if the user has privilages to warn.
          let warnCommand = cachedModules['warn.js'];
          if (findArray(message.member.roles.map(function(x) {
              return x.name;
            }), warnCommand.roles)) {
            // They are allowed to warn because they are in warn's roles.
            warnCommand.command(message);
          }
        }
      } catch (err) {
        logger.error(err);
      }

    } else {
      // Not a valid command.
    }
  } else if (message.author.bot == false) {
    // This is a normal channel message.
    cachedTriggers.forEach(function(trigger) {
      if (trigger.roles == undefined || findArray(message.member.roles.map(function(x) {
          return x.name;
        }), trigger.roles)) {
        if (trigger.trigger(message) == true) {
          logger.debug(`${message.author.username} ${message.author} [Channel: ${message.channel}] triggered: ${message.content}`);
          try {
            trigger.execute(message);
          } catch (err) {
            logger.error(err);
          }
        }
      }
    });
  }
});

// Cache all command modules.
cachedModules = [];
require("fs").readdirSync('./commands/').forEach(function(file) {
  // Load the module if it's a script.
  if (path.extname(file) == '.js') {
    if (file.includes('.disabled')) {
      logger.info(`Did not load disabled module: ${file}`);
    } else {
      logger.info(`Loaded module: ${file}`);
      cachedModules[file] = require(`./commands/${file}`);
    }
  }
});

// Cache all triggers.
cachedTriggers = [];
require("fs").readdirSync('./triggers/').forEach(function(file) {
  // Load the trigger if it's a script.
  if (path.extname(file) == '.js') {
    if (file.includes('.disabled')) {
      logger.info(`Did not load disabled trigger: ${file}`);
    } else {
      logger.info(`Loaded trigger: ${file}`);
      cachedTriggers.push(require(`./triggers/${file}`));
    }
  }
});

data.readWarnings();
data.readBans();

if (config.clientLoginToken) {
  client.login(config.clientLoginToken);
  logger.info('Startup completed. Established connection to Discord.');
} else {
  logger.error('Cannot establish connection to Discord. Client login token is not defined.');
  throw ('MISSING_CLIENT_LOGIN_TOKEN');
}
