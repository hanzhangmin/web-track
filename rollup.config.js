import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import commonjs from 'rollup-plugin-commonjs'

export default [
  {
    input: 'src/index.js', // 打包入口
    output: {
      // 打包出口
      file: 'dist/index.mjs',
      format: 'es', // 打包成es模块
      name: 'myyshop-web-track', // cdn方式引入时挂载在window上面用的就是这个名字
    },
    plugins: [
      // 打包插件
      resolve(), // 查找和打包node_modules中的第三方模块
      commonjs(), // 将 CommonJS 转换成 ES2015 模块供 Rollup 处理
      babel({ babelHelpers: 'bundled' }), // babel配置,编译es6
    ],
  },
  {
    input: 'src/index.js', // 打包入口
    output: {
      // 打包出口
      file: 'dist/index.js',
      format: 'umd', // 通用模块定义规范，同时支持 amd，cjs 和 iife
      name: 'myyshop-web-track', // cdn方式引入时挂载在window上面用的就是这个名字
    },
    plugins: [
      // 打包插件
      resolve(), // 查找和打包node_modules中的第三方模块
      commonjs(), // 将 CommonJS 转换成 ES2015 模块供 Rollup 处理
      babel({ babelHelpers: 'bundled' }), // babel配置,编译es6
    ],
  },
]
