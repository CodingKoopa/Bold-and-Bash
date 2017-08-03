var discord = require('discord.js');
var app = require('../app.js');
var data = require('../data.js');
var logger = require('../logging.js');
var UserWarning = require('../models/UserWarning.js');

exports.roles = ['Admins', 'Moderators'];
exports.command = function(message) {
  message.mentions.users.map((user) => {
    var count = app.warnings.filter(x => x.id == user.id && !x.cleared).length || 0;
    message.channel.sendMessage(`${user} You have been warned. Additional infractions may result in a ban.`);

    logger.info(`${message.author.username} ${message.author} has warned ${user.username} ${user} [${count} + 1].`);
    app.logChannel.sendMessage(`${message.author} has warned ${user} [${count} + 1].`);

    app.warnings.push(new UserWarning(user.id, user.username, message.author.id, message.author.username, count));
    data.flushWarnings();

    app.stats.warnings += 1;

    if (count + 1 >= 3) {
      app.logChannel.sendMessage(`.ban ${user}`);
    }

  });
};
