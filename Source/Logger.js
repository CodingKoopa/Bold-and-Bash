'use strict';

// const os = require(`os`);

// const ip = require(`ip`);
const winston = require(`winston`);
require(`winston-daily-rotate-file`);
require(`logdna`);

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
