const fs = require(`fs`);

const logger = require(`./Logging.js`);
const app = require(`./App.js`);

function readWarnings()
{
  logger.info(`Reading warnings.`);
  // Load the warnings file into the bans variable.
  fs.readFile(`./Data/DiscordWarnings.json`, `utf8`, function(err, data)
  {
    if (err && err.code === `ENOENT`)
    {
      return;
    }
    if (err)
    {
      logger.error(err);
    }
    app.warnings = JSON.parse(data);
    logger.debug(`Loaded warnings file.`);
  });
}

function readBans()
{
  logger.info(`Reading bans.`);
  // Load the ban file into the bans variable.
  fs.readFile(`./Data/DiscordBans.json`, `utf8`, function(err, data)
  {
    if (err && err.code === `ENOENT`)
    {
      return;
    }
    if (err)
    {
      logger.error(err);
    }
    app.bans = JSON.parse(data);
    logger.debug(`Loaded bans file.`);
  });
}

function flushWarnings()
{
  var warningsJson = JSON.stringify(app.warnings, null, 4);
  if (!fs.existsSync(`./Data/`)) fs.mkdirSync(`./Data/`);
  fs.writeFile(`./Data/DiscordWarnings.json`, warningsJson, `utf8`, function(err)
  {
    if (err) logger.error(err);
  });
}

function flushBans()
{
  var bansJson = JSON.stringify(app.bans, null, 4);
  if (!fs.existsSync(`./Data/`)) fs.mkdirSync(`./Data/`);
  fs.writeFile(`./Data/DiscordBans.json`, bansJson, `utf8`, function(err)
  {
    if (err) logger.error(err);
  });
}

module.exports = {
  readWarnings: readWarnings,
  readBans: readBans,
  flushWarnings: flushWarnings,
  flushBans: flushBans
};
