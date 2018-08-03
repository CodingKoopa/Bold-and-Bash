'use strict';

const logger = require(`./Logger.js`);
const state = require(`./State.js`);

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
  state.log_channel.send(message_text);
}

function FormatErrorPrefix(user = null)
{
  if (user)
    return `:rotating_light: ${user} Error:`;
  else
    return `Error:`;
}

function FormatErrorMessageDetails(message_text)
{
  // Use CSS syntax highlighting because it has "key: value" pairs.
  return `Details:\`\`\`css\n${message_text}\`\`\``;
}

function SendErrorMessage(message, message_text, error_details)
{
  var message_reply_text = `${FormatErrorPrefix(message.author)} ${message_text}`;
  if (error_details)
    message_reply_text += ` ${FormatErrorMessageDetails(error_details)}`;

  message.channel.send(message_reply_text);
}

// Error is optional, it's meant for passing API Error details.
function SendPrivateErrorMessage(message_text, error_details)
{
  var winston_log_message_text = `${message_text}`;
  var discord_log_message_text = `${FormatErrorPrefix()} ${winston_log_message_text}`;
  if (error_details)
  {
    winston_log_message_text += ` Details: ${error_details}`;
    discord_log_message_text += ` ${FormatErrorMessageDetails(error_details)}`;
  }
  logger.Error(winston_log_message_text);
  state.log_channel.send(discord_log_message_text);
}

const STAFF_ROLES = [`Admins`, `Moderators`];

const PLAYING_STATUSES_PATH = `./Config/PlayingStatuses.json`;

const WARNINGS_PATH = `./Data/Warnings.json`;
const BANS_PATH = `./Data/Bans.json`;
const QUOTES_PATH = `./Data/Quotes.json`;

module.exports = {
  GetRandomNumber,
  FindArray,
  PrintArray,
  SendPrivateInfoMessage,
  SendErrorMessage,
  SendPrivateErrorMessage,
  STAFF_ROLES,
  PLAYING_STATUSES_PATH,
  WARNINGS_PATH,
  BANS_PATH,
  QUOTES_PATH
};
