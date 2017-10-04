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

function SendPrivateInfoMessage(message_text)
{
  logger.Info(message_text);
  app.log_channel.send(message_text);
}

function SendErrorMessage(Error, message)
{
  message.channel.send(`${message.author} :rotating_light: Error: ${Error}`);
}

// Error is optional, it's meant for passing API Error details.
function SendPrivateErrorMessage(message_text, error_details)
{
  const error_str = `Error: `;
  if (error_details)
  {
    logger.Error(`${message_text} ${error_str}${error_details}`);
    // Use CSS syntax highlighting because it has "key: value" pairs.
    app.log_channel.send(`${message_text} ${error_str}\`\`\`css\n${error_details}\`\`\``);
  }
  else
  {
    logger.Error(`${error_str}${message_text}`);
    app.log_channel.send(`${error_str}${message_text}`);
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
