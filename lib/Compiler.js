class Compiler {
  constructor(config) {
    this.config = config
    this.entry = config.entry
    this.root = process.cwd()
  }

  run() {}
}

module.exports = Compiler
