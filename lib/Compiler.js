const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const generator = require('@babel/generator').default
const types = require('@babel/types')
class Compiler {
  constructor(config) {
    this.config = config
    this.entry = config.entry
    this.entryId
    this.root = process.cwd()
    this.modules = {}
  }

  parseSource(source, parentPath) {
    const dependencies = []
    const ast = parser.parse(source)
    traverse(ast, {
      CallExpression(p) {
        const node = p.node
        if (node.callee.name === 'require') {
          node.callee.name = '__webpack_require__'
          let moduleName = node.arguments[0].value
          moduleName = moduleName + (path.extname(moduleName) ? '' : '.js')
          moduleName = './' + path.join(parentPath, moduleName)
          dependencies.push(moduleName)
          node.arguments = [types.stringLiteral(moduleName)]
        }
      }
    })
    const sourceCode = generator(ast).code
    console.log(sourceCode, 'sourceCode')
    return { sourceCode, dependencies }
  }

  getSource(modulePath) {
    return fs.readFileSync(modulePath, 'utf8')
  }

  buildModule(modulePath, isEntry) {
    const source = this.getSource(modulePath)
    const moduleName = './' + path.relative(this.root, modulePath)
    if (isEntry) {
      this.entryId = moduleName
    }
    const { sourceCode, dependencies = [] } = this.parseSource(source, path.dirname(moduleName))
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
