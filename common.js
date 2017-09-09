function findArray(haystack, arr) {
  return arr.some(function(v) {
    return haystack.indexOf(v) >= 0;
  });
}

function sendErrorMessage(error, message) {
  const errorMessage = `${message.author} :rotating_light: Error: ${error}`;
  message.channel.send(errorMessage);
}

const staffRoles = ['Admins', 'Moderators'];

module.exports = {
  findArray,
  sendErrorMessage,
  staffRoles
};
