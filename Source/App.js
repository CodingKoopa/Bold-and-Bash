'use strict';

/* Application State */
var Application = function()
{
  this.guild = null;
  this.log_channel = null;
  this.verification_channel = null;
  this.showcase_channel = null;
  this.warnings = [];
  this.bans = [];
  this.stats = {
    joins: 0,
    leaves: 0,
    warnings: 0
  };
};

module.exports = new Application();
