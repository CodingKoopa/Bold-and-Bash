const logger = require(`./Logging.js`);
const app = require(`./App.js`);

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

// Error is optional, it's meant for passing API error details.
function sendPrivateErrorMessage(messageText, errorDetails)
{
  const errorStr = `Error: `;
  if (errorDetails)
  {
    logger.error(`${messageText} ${errorStr}${errorDetails}`);
    // Use CSS syntax highlighting because it has "key: value" pairs.
    app.logChannel.send(`${messageText} ${errorStr}\`\`\`css\n${errorDetails}\`\`\``);
  }
  else
  {
    logger.error(`${errorStr}${messageText}`);
    app.logChannel.send(`${errorStr}${messageText}`);
  }
}

const staffRoles = [`Admins`, `Moderators`];

module.exports = {
  findArray,
  printArray,
  sendErrorMessage,
  sendPrivateErrorMessage,
  staffRoles
};
