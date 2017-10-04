'use strict';

const fs = require(`fs`);

const logger = require(`./Logger.js`);
const app = require(`./App.js`);

function ReadWarnings()
{
  logger.Info(`Reading warnings.`);
  // Load the warnings file into the bans variable.
  fs.readFile(`./Data/DiscordWarnings.json`, `utf8`, (err, data) =>
  {
    if (err && err.code === `ENOENT`)
    {
      return;
    }
    if (err)
    {
      logger.Error(err);
    }
    app.warnings = JSON.parse(data);
    logger.Debug(`Loaded warnings file.`);
  });
}

function ReadBans()
{
  logger.Info(`Reading bans.`);
  // Load the ban file into the bans variable.
  fs.readFile(`./Data/DiscordBans.json`, `utf8`, (err, data) =>
  {
    if (err && err.code === `ENOENT`)
    {
      return;
    }
    if (err)
    {
      logger.Error(err);
    }
    app.bans = JSON.parse(data);
    logger.Debug(`Loaded bans file.`);
  });
}

function FlushWarnings()
{
  const warnings_json = JSON.stringify(app.warnings, null, 4);
  if (!fs.existsSync(`./Data/`)) fs.mkdirSync(`./Data/`);
  fs.writeFile(`./Data/DiscordWarnings.json`, warnings_json, `utf8`, err =>
  {
    if (err) logger.Error(err);
  });
}

function FlushBans()
{
  const bans_json = JSON.stringify(app.bans, null, 4);
  if (!fs.existsSync(`./Data/`)) fs.mkdirSync(`./Data/`);
  fs.writeFile(`./Data/DiscordBans.json`, bans_json, `utf8`, function(err)
  {
    if (err) logger.Error(err);
  });
}

module.exports = {
  ReadWarnings: ReadWarnings,
  ReadBans: ReadBans,
  FlushWarnings: FlushWarnings,
  FlushBans: FlushBans
};
