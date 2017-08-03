var fs = require('fs');
var app = require('./app.js');
var logger = require('./logging.js');

function readWarnings() {
  logger.info('Reading warnings.');
  // Load the warnings file into the bans variable.
  fs.readFile('./data/discordWarnings.json', 'utf8', function(err, data) {
    if (err && err.code === 'ENOENT') {
      return;
    }
    if (err) {
      logger.error(err);
    }
    app.warnings = JSON.parse(data);
    logger.debug('Loaded warnings file.');
  });
}

function readBans() {
  logger.info('Reading bans.');
  // Load the ban file into the bans variable.
  fs.readFile('./data/discordBans.json', 'utf8', function(err, data) {
    if (err && err.code === 'ENOENT') {
      return;
    }
    if (err) {
      logger.error(err);
    }
    app.bans = JSON.parse(data);
    logger.debug('Loaded bans file.');
  });
}

function flushWarnings() {
  var warningsJson = JSON.stringify(app.warnings, null, 4);
  if (!fs.existsSync('./data/')) fs.mkdirSync('./data/');
  fs.writeFile('./data/discordWarnings.json', warningsJson, 'utf8', function(err) {
    if (err) return console.log(err);
  });
}

function flushBans() {
  var bansJson = JSON.stringify(app.bans, null, 4);
  if (!fs.existsSync('./data/')) fs.mkdirSync('./data/');
  fs.writeFile('./data/discordBans.json', bansJson, 'utf8', function(err) {
    if (err) return console.log(err);
  });
}

module.exports = {
  readWarnings: readWarnings,
  readBans: readBans,
  flushWarnings: flushWarnings,
  flushBans: flushBans
};
