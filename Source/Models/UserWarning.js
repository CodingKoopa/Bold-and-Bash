class UserWarning
{
  constructor(id, username, reason, warned_by, warned_by_username)
  {
    this.id = id;
    this.username = username;
    this.date = new Date();
    this.reason = reason;
    this.warned_by = warned_by;
    this.warned_by_username = warned_by_username;
  }
}

module.exports = UserWarning;
