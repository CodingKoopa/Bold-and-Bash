class UserBan
{
  constructor(id, username, reason, warnedBy, warnedByUsername, priorWarnings, unbanDate)
  {
    this.id = id;
    this.username = username;
    this.date = new Date();
    this.reason = reason;
    this.warnedBy = warnedBy;
    this.warnedByUsername = warnedByUsername;
    this.priorWarnings = priorWarnings;
    this.unbanDate = unbanDate;
  }
}

module.exports = UserBan;
