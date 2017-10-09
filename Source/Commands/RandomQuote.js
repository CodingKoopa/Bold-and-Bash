'use strict';

const common = require(`../Common.js`);
const app = require(`../App.js`);

const Command = require(`../Models/Command.js`);

const DESCRIPTION = `Prints a random quote from the list.`;
const callback = (message) =>
{
  const quote = app.quotes[common.GetRandomNumber(0, app.quotes.length - 1)];
  message.reply(`"${quote.quote_text}" - ${quote.username} (<@${quote.id}>)`);
};

module.exports.command = new Command(`randomQuote`, DESCRIPTION, [], null, callback);
