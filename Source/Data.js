'use strict';

const fs = require(`fs`);

const common = require(`./Common.js`);
const logger = require(`./Logger.js`);
const app = require(`./App.js`);

function LoadJSON(path)
{
  let json;
  try
  {
    json = fs.readFileSync(path, `utf8`);
    return JSON.parse(json);
  }
  catch (error)
  {
    if (error.code !== `ENOENT`)
      logger.Error(error);
    return null;
  }
}

function WriteJSON(path, json)
{
  fs.writeFileSync(path, json, `utf8`);
}

function ReadWarnings()
{
  logger.Info(`Reading warnings.`);
  const json = LoadJSON(common.WARNINGS_PATH);
  if (json)
    app.warnings = json;
}

function WriteWarnings()
{
  WriteJSON(common.WARNINGS_PATH, JSON.stringify(app.warnings, null, 2));
}

function ReadBans()
{
  logger.Info(`Reading bans.`);
  const json = LoadJSON(common.BANS_PATH);
  if (json)
    app.bans = json;
}

function WriteBans()
{
  WriteJSON(common.BANS_PATH, JSON.stringify(app.bans, null, 2));
}

function ReadQuotes()
{
  logger.Info(`Reading quotes.`);
  const json = LoadJSON(common.QUOTES_PATH);
  if (json)
    app.quotes = json;
}

function WriteQuotes()
{
  WriteJSON(common.QUOTES_PATH, JSON.stringify(app.quotes, null, 2));
}

module.exports = {
  ReadWarnings,
  WriteWarnings,
  ReadBans,
  WriteBans,
  ReadQuotes,
  WriteQuotes
};
