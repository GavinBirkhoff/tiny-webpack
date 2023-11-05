const path = require('path')

module.exports = {
  mode: 'development',
  // mode: 'production',
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
}
