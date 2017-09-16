const config = require('config');
const winston = require('winston');
const logdna = require('logdna');
const ip = require('ip');
const os = require("os");
require('winston-daily-rotate-file');

// This is outside of the DailyRotateFile constructor because the log serialization only supports
// the timestamp being a function, and not the level.
function formatLevel(level) {
  // 7: The length of the longest level (verbose).
  return '[' + level + ']' + ' '.repeat(7 - level.length);
}

function padNumber(number) {
  return number < 10 ? '0' + number : number;
}

winston.emitErrs = true;
const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: 'silly',
      colorize: true
    }),
    new winston.transports.DailyRotateFile({
      formatter: function(options) {
        return formatLevel(options.level) + ' ' + options.timestamp() + ' ' +
          options.message;
      },
      timestamp: function() {
        const date = new Date();
        const hours = padNumber(date.getHours());
        const minutes = padNumber(date.getMinutes());
        const amPM = hours < 13 ? 'AM' : 'PM';
        const str = '[' + (hours % 12 || 12) + ':' + minutes + ' ' + amPM + ']';
        // 10: The length of the longest time ([AA:BB CC]).
        return str + ' '.repeat(10 - str.length);
      },
      json: false,
      level: 'debug',
      something: 'test',
      filename: 'logs/log',
      prepend: true
    })
  ],
  handleExceptions: true,
  humanReadableUnhandledException: true,
  exitOnError: false,
  meta: true,
});

module.exports = logger;
