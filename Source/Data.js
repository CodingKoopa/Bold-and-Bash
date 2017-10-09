'use strict';

const fs = require(`fs`);

const logger = require(`./Logger.js`);
const app = require(`./App.js`);

function LoadJSON(path)
{
  return JSON.parse(fs.readFileSync(path, `utf8`));
}

function WriteJSON(path, json)
{
  fs.writeFileSync(path, json, `utf8`);
}

const WARNINGS_PATH = `./Data/Warnings.json`;

function ReadWarnings()
{
  logger.Info(`Reading warnings.`);
  const json = LoadJSON(WARNINGS_PATH);
  if (json)
    app.warnings = json;
}

function WriteWarnings()
{
  WriteJSON(WARNINGS_PATH, JSON.stringify(app.warnings, null, 2));
}

const BANS_PATH = `./Data/Bans.json`;

function ReadBans()
{
  logger.Info(`Reading bans.`);
  const json = LoadJSON(BANS_PATH);
  if (json)
    app.bans = json;
}

function WriteBans()
{
  WriteJSON(BANS_PATH, JSON.stringify(app.bans, null, 2));
}

const QUOTES_PATH = `./Data/Quotes.json`;

function ReadQuotes()
{
  logger.Info(`Reading quotes.`);
  const json = LoadJSON(QUOTES_PATH);
  if (json)
    app.quotes = json;
}

function WriteQuotes()
{
  WriteJSON(QUOTES_PATH, JSON.stringify(app.quotes, null, 2));
}

module.exports = {
  ReadWarnings: ReadWarnings,
  WriteWarnings: WriteWarnings,
  ReadBans: ReadBans,
  WriteBans: WriteBans,
  ReadQuotes: ReadQuotes,
  WriteQuotes: WriteQuotes
};
