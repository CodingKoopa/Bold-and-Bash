'use strict';

const fs = require(`fs`);

const logger = require(`./Logger.js`);
const app = require(`./App.js`);

function LoadJSON(path)
{
  let json = null;
  fs.readFile(path, `utf8`, (err, data) =>
  {
    if (err)
    {
      // It's alright if the file wasn't found.
      if (err.code !== `ENOENT`)
        logger.Error(err);
    }
    else
    {
      json = JSON.parse(data);
    }
  });
  return json;
}

function WriteJSON(path, json)
{
  fs.writeFile(path, json, `utf8`, err =>
  {
    if (err)
      logger.Error(err);
  });
}

const WARNINGS_PATH = `./Data/Warnings.json`;

function ReadWarnings()
{
  logger.Info(`Reading warnings.`);
  const json = LoadJSON(WARNINGS_PATH);
  if (json)
    app.warnings = json;
}

const BANS_PATH = `./Data/Bans.json`;

function ReadBans()
{
  logger.Info(`Reading bans.`);
  const json = LoadJSON(BANS_PATH);
  if (json)
    app.bans = json;
}

function FlushWarnings()
{
  WriteJSON(WARNINGS_PATH, JSON.stringify(app.warnings, null, 2));
}

function FlushBans()
{
  WriteJSON(BANS_PATH, JSON.stringify(app.bans, null, 2));
}

module.exports = {
  ReadWarnings: ReadWarnings,
  ReadBans: ReadBans,
  FlushWarnings: FlushWarnings,
  FlushBans: FlushBans
};
