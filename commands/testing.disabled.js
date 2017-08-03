var app = require('../app.js');
var logger = require('../logging.js');

exports.command = function(message) {
  var role = '254036987508424714';
  var alreadyJoined = app.guild.roles.get(role).members.find(member => member.id == message.member.id);

  if (alreadyJoined != null) {
    message.member.removeRole(role);
    message.reply('You are no longer part of the testing group.');
  } else {
    message.member.addRole(role);
    message.reply('You are now part of the testing group.');
  }
};
