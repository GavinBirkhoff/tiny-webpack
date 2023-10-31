const fs = require('fs')
const path = require('path')
class Compiler {
  constructor(config) {
    this.config = config
    this.entry = config.entry
    this.entryId
    this.root = process.cwd()
    this.modules = {}
  }

  parseSource(source, parentPath) {}

  getSource(modulePath) {
    return fs.readFileSync(modulePath, 'utf8')
  }

  buildModule(modulePath, isEntry) {
    const source = this.getSource(modulePath)
    const moduleName = './' + path.relative(this.root, modulePath)
    if (isEntry) {
      this.entryId = moduleName
    }
    const { sourceCode, dependencies } = this.parseSource(source, path.dirname(moduleName))
    // 保存解析的源代码
    this.modules[moduleName] = sourceCode
    // 递归
    dependencies.forEach((dep) => {
      this.buildModule(path.join(this.root, dep), false)
    })
  }

  run() {
    this.buildModule(path.resolve(this.root, this.entry), true)
  }
}

module.exports = Compiler
