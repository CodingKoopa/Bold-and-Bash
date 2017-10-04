class UserBan
{
  constructor(id, username, reason, warned_by, warned_by_username, prior_warnings, unban_date)
  {
    this.id = id;
    this.username = username;
    this.date = new Date();
    this.reason = reason;
    this.warned_by = warned_by;
    this.warned_by_username = warned_by_username;
    this.prior_warnings = prior_warnings;
    this.unban_date = unban_date;
  }
}

module.exports = UserBan;
