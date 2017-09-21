function printArray(arr)
{
  let str = ``;
  arr.forEach((role, index, array) =>
  {
    if (index + 1 === array.length)
      str += `and \`${role}\``;
    else
      str += `\`${role}\`, `;
  });
  return str;
}

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

const staffRoles = [`Admins`, `Moderators`];

module.exports = {
  findArray,
  printArray,
  sendErrorMessage,
  staffRoles
};
