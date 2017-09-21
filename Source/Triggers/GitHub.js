const request = require(`request`);

const regex = /[^<\\]#(\d+)/ig;

exports.trigger = function(message)
{
  return new RegExp(regex).test(message.content);
};

exports.execute = function(message)
{
  const matcher = new RegExp(regex);
  let match = matcher.exec(message.content);
  const matched = [];

  while (match !== null)
  {
    if (matched.indexOf(match[1]) === -1)
    {
      matched.push(match[1]);
    }
    else
    {
      match = matcher.exec(message.content);
      continue;
    }

    // We do not want to automatically match old issues / PRs.
    // This usually happens when someone messes up pining another person or
    // in general conversation.
    // ex: You're #1!
    if (match[1] <= 2000)
    {
      return;
    }

    const url = `https://github.com/citra-emu/citra/pull/${match[1]}`;
    /* jshint loopfunc: true */
    request(url, function(error, response)
    {
      if (!error && response.statusCode === 200)
      {
        message.channel.sendMessage(`Github Pull Request: ${url}`);
      }
    });

    match = matcher.exec(message.content);
  }
};
