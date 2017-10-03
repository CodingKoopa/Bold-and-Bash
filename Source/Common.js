const logger = require(`./Logger.js`);
const app = require(`./App.js`);

function PrintArray(arr)
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

function FindArray(haystack, arr)
{
  return arr.some(function(v)
  {
    return haystack.indexOf(v) >= 0;
  });
}

function SendPrivateInfoMessage(messageText)
{
  logger.Info(messageText);
  app.logChannel.send(messageText);
}

function SendErrorMessage(Error, message)
{
  message.channel.send(`${message.author} :rotating_light: Error: ${Error}`);
}

// Error is optional, it's meant for passing API Error details.
function SendPrivateErrorMessage(messageText, ErrorDetails)
{
  const Error_str = `Error: `;
  if (ErrorDetails)
  {
    logger.Error(`${messageText} ${Error_str}${ErrorDetails}`);
    // Use CSS syntax highlighting because it has "key: value" pairs.
    app.logChannel.send(`${messageText} ${Error_str}\`\`\`css\n${ErrorDetails}\`\`\``);
  }
  else
  {
    logger.Error(`${Error_str}${messageText}`);
    app.logChannel.send(`${Error_str}${messageText}`);
  }
}

const STAFF_ROLES = [`Admins`, `Moderators`];

module.exports = {
  FindArray,
  PrintArray,
  SendPrivateInfoMessage,
  SendErrorMessage,
  SendPrivateErrorMessage,
  STAFF_ROLES
};
