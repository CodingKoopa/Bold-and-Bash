'use strict';

const common = require(`../Common.js`);
const app = require(`../App.js`);

const Command = require(`../Models/Command.js`);

const DESCRIPTION = `Prints a random quote from the list.`;
const callback = (message) =>
{
  const quote = app.quotes[common.GetRandomNumber(0, app.quotes.length - 1)];
  var quote_text;
  // If it doesn't have any spaces, don't include quote marks. Useful for URLs that have broken
  // previews when quoted.
  if (quote.quote_text.indexOf(` `) === -1)
    quote_text = quote.quote_text;
  else
    quote_text = `"${quote.quote_text}"`;
  message.reply(`${quote_text} - ${quote.username} (<@${quote.id}>)`);
};

module.exports.command = new Command(`RandomQuote`, DESCRIPTION, [], null, callback);
