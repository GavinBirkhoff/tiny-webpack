#!/usr/bin/env node

const path = require('path')
const config = require(path.resolve('webpack.config.js'))

const webpack = require('../lib/webpack')
const compiler = webpack(config)

compiler.run()
