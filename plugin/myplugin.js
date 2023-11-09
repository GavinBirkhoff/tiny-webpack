class MyPlugin {
  apply(compiler) {
    console.log('apply start')
    // 注册订阅
    compiler.hooks.emit.tap('emit', () => {
      console.log('MyPlugin emit')
    })
    compiler.hooks.emit.tap('done', () => {
      console.log('MyPlugin done')
    })
    compiler.hooks.compile.tap('done', () => {
      console.log('MyPlugin compile')
    })
  }
}

module.exports = MyPlugin
