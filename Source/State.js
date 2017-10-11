'use strict';

/* Application State */
var State = function()
{
  this.guild = null;
  this.log_channel = null;
  this.verification_channel = null;
  this.showcase_channel = null;
  this.warnings = [];
  this.bans = [];
  this.quotes = [];
  this.stats = {
    joins: 0,
    leaves: 0,
    warnings: 0
  };
};

module.exports = new State();
