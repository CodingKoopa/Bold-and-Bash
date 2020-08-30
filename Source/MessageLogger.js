'use strict';

const winston = require(`winston`);

const logger = winston.createLogger(
  {
    levels: {
      Message: 0
    },
    format: winston.format.combine(winston.format.printf(({message}) => message)),
    transports: [
      new winston.transports.DailyRotateFile(
        {level: `Message`, filename: `MessageLogs/%DATE%.Messages.log`})
    ]
  });

module.exports = logger;
