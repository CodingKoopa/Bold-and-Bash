'use strict';

// const os = require(`os`);

// const ip = require(`ip`);
const winston = require(`winston`);
require(`winston-daily-rotate-file`);
require(`logdna`);

// This is outside of the DailyRotateFile constructor because the log serialization only supports
// the timestamp being a function, and not the level.
function FormatLevel(level)
{
  // 7: The length of the longest level (verbose).
  return `[` + level + `]` + ` `.repeat(7 - level.length);
}

function PadNumber(number)
{
  return number < 10 ? `0` + number : number;
}

winston.emitErrs = true;
const logger = new winston.Logger(
  {
    levels: {
      Error: 0,
      Warn: 1,
      Info: 2,
      Verbose: 3,
      Debug: 4,
      Silly: 5
    },
    colors: {
      Error: `red`,
      Warn: `yellow`,
      Info: `green`,
      Verbose: `cyan`,
      Debug: `blue`,
      Silly: `magenta`
    },
    transports: [
      new winston.transports.Console(
        {
          level: `Silly`,
          colorize: true
        }),
      new winston.transports.DailyRotateFile(
        {
          formatter: function(options)
          {
            return FormatLevel(options.level) + ` ` + options.timestamp() + ` ` + options.message;
          },
          timestamp: function()
          {
            const date = new Date();
            const hours = PadNumber(date.getHours());
            const minutes = PadNumber(date.getMinutes());
            const am_pm = hours < 13 ? `AM` : `PM`;
            const str = `[${hours % 12 || 12}:${minutes} ${am_pm}]`;
            // 10: The length of the longest time ([AA:BB CC]).
            return str + ` `.repeat(10 - str.length);
          },
          json: false,
          level: `Debug`,
          something: `test`,
          filename: `Logs/log`,
          prepend: true
        })
    ],
    handleExceptions: true,
    humanReadableUnhandledException: true,
    exitOnError: false,
    meta: true,
  });

// if (config.enable_logdna_logging && config.logdna_key)
// {
//   // Setup logging for LogDNA cloud logging.
//   logger.Add(winston.transports.Logdna, {
//     key: config.logdna_key,
//     level: `Info`,
//     ip: ip.address(),
//     hostname: os.hostname(),
//     app: `discord-bot`
//   });
//   logger.Info(`Started LogDNA winston transport.`);
// }
// else if (config.enableLogdna === true)
// {
//   throw `Attempted to enable LogDNA transport without a key!`;
// }

module.exports = logger;
