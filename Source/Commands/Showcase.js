const common = require(`../Common.js`);
const app = require(`../App.js`);

const RichEmbed = require(`discord.js`).RichEmbed;

const Command = require(`../Models/Command.js`);
const Argument = require(`../Models/Argument.js`);

const DESCRIPTION = `Posts a mod in the #mod-showcase channel.`;
const ARGUMENTS = [
  new Argument(`name`, `The name of the mod.`, true),
  new Argument(`description`, `The description of the mod.`, true),
  new Argument(`picture`, `The URL of a picture of the mod.`, true),
  new Argument(`url`, `The URL of the download, or wiki page.`, false)
];
function RandomColor()
{
  const min = 0;
  const max = 255;
  // From:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const callback = function(args, message)
{
  const mod_embed = new RichEmbed(
    {
      title: args[0],
      description: args[1],
      url: args[3]
    }
  );
  mod_embed.setColor([RandomColor(), RandomColor(), RandomColor()]);
  mod_embed.setImage(args[2]);
  // An error can occur if the URL is broken.
  app.showcaseChannel.send(`New mod update by ${message.author}:`, {embed: mod_embed})
    .catch(error => common.SendErrorMessage(`\`\`\`css\n${error}\`\`\``, message));
};

module.exports.command = new Command(`showcase`, DESCRIPTION, ARGUMENTS, null, callback);
