// const { Compiler } = require("webpack");
const Compiler = require('./Compiler')

function webpack(config) {
  // 在实例化 compiler 之前我们需要将用户配置和shell命令参数合并
  const shellOptions = process.argv.slice(2).reduce((config, arg) => {
    let [key, value] = arg.split('=')
    config[key.slice(2)] = value
    return config
  }, {})
  const finalOptions = { ...config, ...shellOptions }
  // console.log(finalOptions)
  const compiler = new Compiler(finalOptions)

  // 创建完 compiler 之后挂载插件
  finalOptions?.plugins.forEach((plugin) => {
    plugin.apply(compiler)
  })
  return compiler
}

module.exports = webpack
