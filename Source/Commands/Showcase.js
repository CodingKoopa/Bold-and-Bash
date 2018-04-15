'use strict';

const valid_url = require(`valid-url`);

const common = require(`../Common.js`);
const state = require(`../State.js`);

const RichEmbed = require(`discord.js`).RichEmbed;

const Command = require(`../Models/Command.js`);
const Argument = require(`../Models/Argument.js`);

const DESCRIPTION = `Posts a mod in the #mod-showcase channel.`;
const args = [
  new Argument(`name`, `The name of the mod.`, true),
  new Argument(`description`, `The description of the mod.`, true),
  new Argument(`picture`, `The URL of a picture of the mod.`, true),
  new Argument(`url`, `The URL of the download, or wiki page.`, false)
];

const callback = (message, args) =>
{
  // Run some checks to make sure the parameters are right.
  const shared_err_str = `This probably isn't what you want, make sure your arguments are correct.`;
  if (valid_url.isWebUri(args[0]))
  {
    common.SendErrorMessage(message, `Title looks like an HTTP/HTTPS URL. ${shared_err_str}`);
    return 1;
  }
  if (valid_url.isWebUri(args[1]))
  {
    common.SendErrorMessage(message, `Description looks like a HTTP/HTTPS URL. ${shared_err_str}`);
    return 1;
  }
  if (!valid_url.isWebUri(args[2]))
  {
    common.SendErrorMessage(message, `Picture doesn't look like a HTTP/HTTPS URL. \
${shared_err_str}`);
    return 1;
  }
  const images = [`png`, `jpg`, `jpeg`];
  if (images.indexOf(args[2].split(`.`).pop().split(/#|\?/)[0]) === -1)
  {
    common.SendErrorMessage(message, `Picture doesn't look like a direct PNG/JPEG URL. If you are \
using Imgur, this probably means that you're using the album link instead of the direct image \
link. To get the right link, in your browser, right click the iamge and then click Copy Image \
Location.`);
    return 1;
  }
  if (!valid_url.isWebUri(args[3]))
  {
    common.SendErrorMessage(message, `Download/wiki doesn't look like a HTTP/HTTPS URL. \
${shared_err_str}`);
    return 1;
  }

  const mod_embed = new RichEmbed(
    {
      title: args[0],
      description: args[1],
      url: args[3]
    }
  );
  mod_embed.setImage(args[2]);
  const min = 0;
  const max = 255;
  mod_embed.setColor([
    common.GetRandomNumber(min, max),
    common.GetRandomNumber(min, max),
    common.GetRandomNumber(min, max)
  ]);

  // An error can occur if the URL is broken.
  state.showcase_channel.send(`New mod update by ${message.author}:`, {embed: mod_embed})
    .catch(error => common.SendErrorMessage(message, `\`\`\`css\n${error}\`\`\``));
  return 0;
};

module.exports.command = new Command(`showcase`, DESCRIPTION, args, null, callback);
