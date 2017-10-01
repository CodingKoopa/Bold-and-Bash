const logger = require(`./Logger.js`);
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

function sendPrivateInfoMessage(messageText)
{
  logger.info(messageText);
  app.logChannel.send(messageText);
}

function sendErrorMessage(error, message)
{
  message.channel.send(`${message.author} :rotating_light: Error: ${error}`);
}

// Error is optional, it's meant for passing API error details.
function sendPrivateErrorMessage(messageText, errorDetails)
{
  const error_str = `Error: `;
  if (errorDetails)
  {
    logger.error(`${messageText} ${error_str}${errorDetails}`);
    // Use CSS syntax highlighting because it has "key: value" pairs.
    app.logChannel.send(`${messageText} ${error_str}\`\`\`css\n${errorDetails}\`\`\``);
  }
  else
  {
    logger.error(`${error_str}${messageText}`);
    app.logChannel.send(`${error_str}${messageText}`);
  }
}

const STAFF_ROLES = [`Admins`, `Moderators`];

module.exports = {
  findArray,
  printArray,
  sendPrivateInfoMessage,
  sendErrorMessage,
  sendPrivateErrorMessage,
  STAFF_ROLES
};
