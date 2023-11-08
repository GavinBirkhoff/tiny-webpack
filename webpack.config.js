const path = require('path')

module.exports = {
  mode: 'development',
  // mode: 'production',
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.less$/i,
        use: [
          path.resolve(__dirname, 'loader', 'style-loader'),
          path.resolve(__dirname, 'loader', 'less-loader')
          // 'style-loader',
          // 'css-loader',
          // 'less-loader'
        ]
      }
    ]
  }
}
