const less = require('less')

function loader(sourceLess) {
  console.log('less-loader')
  let css = ''
  less.render(sourceLess, (err, res) => {
    css = res.css
  })
  css = css.replace(/\n/g, '\\n')
  return css
}

module.exports = loader
