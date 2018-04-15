'use strict';

const state = require(`../State.js`);
const data = require(`../Data.js`);

const Command = require(`../Models/Command.js`);
const Argument = require(`../Models/Argument.js`);
const Quote = require(`../Models/Quote.js`);

const DESCRIPTION = `Adds a quote from a user to the list.`;
const args = [
  new Argument(`quote`, `The quote to add.`, true),
  new Argument(`user`, `The user the quote is from.`, true, true)
];
const roles = require(`../Common.js`).STAFF_ROLES;
const callback = (message, args) =>
{
  const quote_text = args[0];
  message.channel.send(`:ok_hand: ${message.author}, adding quote "${quote_text}".`);

  const user = message.mentions.users.first();
  state.quotes.push(new Quote(quote_text, user.id, user.username));
  data.WriteQuotes();

  return 0;
};

module.exports.command = new Command(`addquote`, DESCRIPTION, args, roles, callback);
