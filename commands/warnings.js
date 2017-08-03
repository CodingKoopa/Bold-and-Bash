var app = require('../app.js');
var logger = require('../logging.js');

exports.command = function(message) {
  message.mentions.users.map((user) => {
    var warnings = app.warnings.filter(x => x.id == user.id && !x.cleared);
    message.channel.sendMessage(`${user}, you have ${warnings.length} total warnings.`);
  });
};
