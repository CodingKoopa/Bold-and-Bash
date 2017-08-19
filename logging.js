const config = require('config');
const winston = require('winston');
require('winston-daily-rotate-file');
const logdna = require('logdna');
const ip = require('ip');
const os = require("os");

winston.emitErrs = true;
const logger = new winston.Logger({
  transports: [
    new winston.transports.DailyRotateFile({
      level: 'debug',
      filename: 'logs/log',
      prepend: true
    })
  ],
  handleExceptions: true,
  humanReadableUnhandledException: true,
  exitOnError: false,
  meta: true,
});

if (config.enableLogdnaLogging === true && config.logdnaKey) {
  // Setup logging for LogDNA cloud logging.
  logger.add(winston.transports.Logdna, {
    level: 'info',
    index_meta: true,
    key: config.logdnaKey,
    ip: ip.address(),
    hostname: os.hostname(),
    app: 'services-services'
  });
  logger.debug('[logging] Started LogDNA winston transport.');
} else if (config.enableLogdna === true) {
  throw "Attempted to enable LogDNA transport without a key!";
}

if (config.enableConsoleLogging === true) {
  logger.add(winston.transports.Console, {
    level: 'silly',
    colorize: true
  });
}

module.exports = logger;
