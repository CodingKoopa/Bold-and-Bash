'use strict';

const fs = require(`fs`);

const common = require(`./Common.js`);
const logger = require(`./Logger.js`);
const state = require(`./State.js`);

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
    state.warnings = json;
}

function WriteWarnings()
{
  WriteJSON(common.WARNINGS_PATH, JSON.stringify(state.warnings, null, 2));
}

function ReadBans()
{
  logger.Info(`Reading bans.`);
  const json = LoadJSON(common.BANS_PATH);
  if (json)
    state.bans = json;
}

function WriteBans()
{
  WriteJSON(common.BANS_PATH, JSON.stringify(state.bans, null, 2));
}

function ReadQuotes()
{
  logger.Info(`Reading quotes.`);
  const json = LoadJSON(common.QUOTES_PATH);
  if (json)
    state.quotes = json;
}

function WriteQuotes()
{
  WriteJSON(common.QUOTES_PATH, JSON.stringify(state.quotes, null, 2));
}

module.exports = {
  ReadWarnings,
  WriteWarnings,
  ReadBans,
  WriteBans,
  ReadQuotes,
  WriteQuotes
};
