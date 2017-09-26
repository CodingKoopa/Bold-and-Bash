const os = require(`os`);

const ip = require(`ip`);
const winston = require(`winston`);
require(`winston-daily-rotate-file`);
require(`logdna`);

const config = require(`config`);

winston.emitErrs = true;
const logger = new winston.Logger(
  {
    transports: [
      new winston.transports.DailyRotateFile(
        {
          formatter: function(options)
          {
            return options.message;
          },
          json: false,
          level: `silly`,
          filename: `Logs/Messages.log`,
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
    level: `silly`,
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
