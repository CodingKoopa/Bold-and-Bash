'use strict';

const config = require(`config`);

const Command = require(`../Models/Command.js`);
const Argument = require(`../Models/Argument.js`);

const DESCRIPTION = `Points someone to a different channel, to keep discussion ontopic.`;
const args = [
  new Argument(`channel`, `The new channel to go to.`, true),
  new Argument(`user`, `A user to specifically redirect.`, false, true)
];
const callback = (message, args) =>
{
  const shared_str = `might be better for ${args[0]}`;
  if (args[1])
  {
    const user = message.mentions.users.first();
    message.channel.send(`${user} Hey there ${user.username}! This ${shared_str}. For more info, a \
reference for channel usage can be found in <#${config.welcome_channel}>.`);
  }
  else
  {
    message.channel.send(`This discussion ${shared_str}.`);
  }
};

module.exports.command = new Command(`redir`, DESCRIPTION, args, null, callback);
