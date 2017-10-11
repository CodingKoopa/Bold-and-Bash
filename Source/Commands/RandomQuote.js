'use strict';

const common = require(`../Common.js`);
const app = require(`../App.js`);

const Command = require(`../Models/Command.js`);

const DESCRIPTION = `Prints a random quote from the list.`;
const callback = (message) =>
{
  const quote = app.quotes[common.GetRandomNumber(0, app.quotes.length - 1)];
  if (quote)
  {
    var quote_text;
    // If it doesn't have any spaces, don't include quote marks. Useful for URLs that have broken
    // previews when quoted.
    if (quote.quote_text.indexOf(` `) === -1)
      quote_text = quote.quote_text;
    else
      quote_text = `"${quote.quote_text}"`;
    message.channel.send(`:microphone2: ${message.author}, ${quote_text} :speech_left: \
${quote.username} (<@${quote.id}>)`);
  }
  else
  {
    common.SendErrorMessage(message, `No quotes found. To add quotes, use the \`AddQuote\` \
command.`);
  }
};

module.exports.command = new Command(`RandomQuote`, DESCRIPTION, [], null, callback);
