var app = require('../app.js');
var data = require('../data.js');
var logger = require('../logging.js');

exports.roles = ['Admins', 'Moderators'];
exports.command = function(message) {
  message.mentions.users.map((user) => {
    var count = app.warnings.filter(x => x.id == user.id && !x.cleared);
    if (count != null && count.length > 0) {
      count.forEach(warning => warning.cleared = true);
      data.flushWarnings();
      message.channel.sendMessage(`${user}, your warnings have been cleared.`);
    } else {
      message.channel.sendMessage(`${user}, you have no warnings to clear.`);
    }

    logger.info(`${message.author.toString()} has cleared all warnings for ${user.toString()} [${count}].`);
    app.logChannel.sendMessage(`${message.author.toString()} has cleared all warnings for ${user.toString()} [${count}].`);
  });
};
