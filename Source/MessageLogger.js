const os = require(`os`);

const ip = require(`ip`);
const winston = require(`winston`);
const config = require(`config`);
require(`winston-daily-rotate-file`);
require(`logdna`);

winston.emitErrs = true;
const logger = new winston.Logger(
  {
    levels: {Message: 0},
    transports: [
      new winston.transports.DailyRotateFile(
        {
          formatter: function(options)
          {
            return options.message;
          },
          json: false,
          level: `Message`,
          filename: `Logs/Messages.log`,
          prepend: true
        })
    ],
    handleExceptions: true,
    humanReadableUnhandledException: true,
    exitOnError: false,
    meta: true,
  });

if (config.enable_logdna_logging && config.logdna_key)
{
  // Setup logging for LogDNA cloud logging.
  logger.Add(winston.transports.Logdna, {
    key: config.logdna_key,
    level: `silly`,
    ip: ip.address(),
    hostname: os.hostname(),
    app: `discord-bot`
  });
  logger.Info(`Started LogDNA winston transport.`);
}
else if (config.enableLogdna === true)
{
  throw `Attempted to enable LogDNA transport without a key!`;
}

module.exports = logger;
