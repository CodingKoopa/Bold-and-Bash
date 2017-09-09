const config = require('config');
const winston = require('winston');
const logdna = require('logdna');
const ip = require('ip');
const os = require("os");
const schedule = require('node-schedule');

function padNumber(string) {
  return ('0' + string).slice(-2);
}

function generateFileTransport() {
  const date = new Date();
  return new winston.transports.File({
    filename: `logs/${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}.log`,
    level: 'debug'
  });
}

winston.emitErrs = true;
const logger = new winston.Logger({
  transports: [
    generateFileTransport()
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

// Run at midnight every day.
schedule.scheduleJob('00 00 00 * * *', function() {
  logger.info(`Winston logger daily scheduled job activated.`);
  logger.transports.file = generateFileTransport();
  logger.info(`Switched to new log file: ${logger.transports.file.filename}`);
});

module.exports = logger;
