class UserBan
{
  constructor(id, username, warnedBy, warnedByUsername, priorWarnings)
  {
    this.id = id;
    this.username = username;
    this.date = new Date();
    this.warnedBy = warnedBy;
    this.warnedByUsername = warnedByUsername;
    this.priorWarnings = priorWarnings;
  }
}

module.exports = UserBan;