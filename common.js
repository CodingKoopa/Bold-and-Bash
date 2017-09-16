function findArray(haystack, arr)
{
  return arr.some(function(v)
  {
    return haystack.indexOf(v) >= 0;
  });
}

function sendErrorMessage(error, message)
{
  message.channel.send(`${message.author} :rotating_light: Error: ${error}`);
}

const staffRoles = ['Admins', 'Moderators'];

module.exports = {
  findArray,
  sendErrorMessage,
  staffRoles
};