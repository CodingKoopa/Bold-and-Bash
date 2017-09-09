class UserWarning {
  constructor(id, username, reason, warnedBy, warnedByUsername) {
    this.id = id;
    this.username = username;
    this.date = new Date();
    this.reason = reason;
    this.warnedBy = warnedBy;
    this.warnedByUsername = warnedByUsername;
  }
}

module.exports = UserWarning;
