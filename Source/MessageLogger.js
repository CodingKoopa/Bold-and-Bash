const winston = require(`winston`);
require(`winston-daily-rotate-file`);

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

module.exports = logger;
