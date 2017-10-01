const os = require(`os`);

const ip = require(`ip`);
const winston = require(`winston`);
require(`winston-daily-rotate-file`);
require(`logdna`);

const config = require(`config`);

// This is outside of the DailyRotateFile constructor because the log serialization only supports
// the timestamp being a function, and not the level.
function formatLevel(level)
{
  // 7: The length of the longest level (verbose).
  return `[` + level + `]` + ` `.repeat(7 - level.length);
}

function padNumber(number)
{
  return number < 10 ? `0` + number : number;
}

winston.emitErrs = true;
const logger = new winston.Logger(
  {
    transports: [
      new winston.transports.Console(
        {
          level: `silly`,
          colorize: true
        }),
      new winston.transports.DailyRotateFile(
        {
          formatter: function(options)
          {
            return formatLevel(options.level) + ` ` + options.timestamp() + ` ` + options.message;
          },
          timestamp: function()
          {
            const date = new Date();
            const hours = padNumber(date.getHours());
            const minutes = padNumber(date.getMinutes());
            const am_pm = hours < 13 ? `AM` : `PM`;
            const str = `[${hours % 12 || 12}:${minutes} ${am_pm}]`;
            // 10: The length of the longest time ([AA:BB CC]).
            return str + ` `.repeat(10 - str.length);
          },
          json: false,
          level: `debug`,
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

if (config.enableLogdnaLogging && config.logdnaKey)
{
  // Setup logging for LogDNA cloud logging.
  logger.add(winston.transports.Logdna, {
    key: config.logdnaKey,
    level: `info`,
    ip: ip.address(),
    hostname: os.hostname(),
    app: `discord-bot`
  });
  logger.info(`Started LogDNA winston transport.`);
}
else if (config.enableLogdna === true)
{
  throw `Attempted to enable LogDNA transport without a key!`;
}

module.exports = logger;
