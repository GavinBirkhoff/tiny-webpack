const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const generator = require('@babel/generator').default
const types = require('@babel/types')
const ejs = require('ejs')
const { SyncHook } = require('tapable') // 发布订阅 观察者
class Compiler {
  constructor(config) {
    this.config = config
    this.entry = config.entry
    this.entryId
    this.root = process.cwd()
    this.modules = {}
    this.hooks = {
      entryOption: new SyncHook(), // start
      compile: new SyncHook(), // compile
      afterCompile: new SyncHook(), // end
      run: new SyncHook(),
      emit: new SyncHook(),
      done: new SyncHook()
    }
    const plugins = this.config.plugins
    if (Array.isArray(plugins)) {
      for (let plugin of plugins) {
        plugin.apply(this)
      }
    }
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
    // console.log(sourceCode, 'sourceCode')
    return { sourceCode, dependencies }
  }

  getSource(modulePath) {
    // return fs.readFileSync(modulePath, 'utf8')
    // loader
    const rules = this.config?.module.rules ?? []
    let content = fs.readFileSync(modulePath, 'utf8')
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i]
      const { test, use } = rule
      let tail = use.length - 1
      if (test.test(modulePath)) {
        function autoLoader() {
          const loader = require(use[tail--])
          content = loader(content)
          if (tail > -1) {
            autoLoader()
          }
        }

        autoLoader()
      }
    }
    return content
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

  emitFile() {
    const main = path.join(this.config.output.path, this.config.output.filename)
    const templateStr = this.getSource(path.join(__dirname, 'bundle.ejs'))
    const result = ejs.render(templateStr, { entryId: this.entryId, modules: this.modules })
    this.assets = {}
    this.assets[main] = result
    fs.writeFileSync(main, this.assets[main])
  }

  run() {
    this.hooks.run.call()
    this.hooks.compile.call()
    this.buildModule(path.resolve(this.root, this.entry), true)
    this.hooks.afterCompile.call()
    this.hooks.emit.call()
    this.emitFile()
    this.hooks.done.call()
  }
}

module.exports = Compiler
