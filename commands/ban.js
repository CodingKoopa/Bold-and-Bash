var discord = require('discord.js');
var app = require('../app.js');
var data = require('../data.js');
var logger = require('../logging.js');
var UserBan = require('../models/UserBan.js');

exports.roles = ['Admins', 'Moderators', 'CitraBot'];
exports.command = function(message) {
  message.mentions.users.map((user) => {
    var count = app.warnings.filter(x => x.id == user.id && !x.cleared).length || 0;

    message.channel.sendMessage(`${user} ${user.username}, You will now be banned from this channel.`);
    logger.info(`${message.author.toString()} has banned ${user.toString()} ${user} ${user.username}.`);
    app.logChannel.sendMessage(`${message.author} has banned ${user} ${user.username} [${count}].`);

    app.bans.push(new UserBan(user.id, user.username, message.author.id, message.author.username, count));

    message.guild.member(user).ban().catch(function(error) {
      app.logChannel.sendMessage(`Error banning ${user} ${user.username}`);
      logger.error(`Error banning ${user.toString()} ${user} ${user.username}.`, error);
    });

    data.flushBans();
  });
};
