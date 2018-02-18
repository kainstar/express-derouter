import babel from 'rollup-plugin-babel'
import eslint from 'rollup-plugin-eslint'
import replace from 'rollup-plugin-replace'

import pkg from './package.json'

const plugins = [
  // eslint检查
  eslint({
    throwOnError: true,
    throwOnWarning: true,
    include: ['src/**'],
    exclude: ['node_modules/**']
  }),
  // 替换源文件内容
  replace({
    exclude: 'node_modules/**',
    delimiters: ['{{', '}}'],
    VERSION: pkg.version
  }),
  // 解析babel语法
  babel({
    exclude: 'node_modules/**'
  })
]

const entryFile = './src/index.js'
const destFile = 'dist.js'

export default {
  input: entryFile,
  output: {
    file: destFile,
    format: 'cjs'
  },
  external: ['fs', 'path', 'debug', 'express'],
  plugins: plugins
}
