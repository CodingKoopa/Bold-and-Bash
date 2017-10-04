'use strict';

const logger = require(`./Logger.js`);
const app = require(`./App.js`);

function GetRandomNumber(min, max)
{
  // From:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function PrintArray(arr)
{
  let str = ``;
  arr.forEach((element, index, array) =>
  {
    if (index + 1 === array.length)
      str += `and \`${element}\``;
    else
      str += `\`${element}\`, `;
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

function SendErrorMessage(message, error)
{
  message.channel.send(`${message.author} :rotating_light: Error: ${error}`);
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
  GetRandomNumber,
  FindArray,
  PrintArray,
  SendPrivateInfoMessage,
  SendErrorMessage,
  SendPrivateErrorMessage,
  STAFF_ROLES
};
