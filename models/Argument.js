class Argument {
  constructor(shortName, explanation, required, isMention = false) {
    this.shortName = shortName;
    this.explanation = explanation;
    this.required = required;
    this.isMention = isMention;
  }
}

module.exports = Argument;
