/* eslint-disable prettier/prettier */
import { resolve as pathResolve } from 'path'

import postcss from 'rollup-plugin-postcss'
import { babel } from '@rollup/plugin-babel'
import { defineConfig, OutputOptions, RollupOptions } from 'rollup'
import { getTargets, createConfig } from './scripts'
import { existsSync, rmSync } from 'fs'

// const Global = `
// global.navigator = { userAgent: 'node.js', };
// `

const rollupOptions: RollupOptions[] = []
const sourcemap = true
const envTargets = process.env.TARGETS && process.env.TARGETS.split(',')
const targets = getTargets(envTargets as string[])
/**
 * * [书写配置文件可以使用ts写法](https://rollupjs.org/guide/en/#--configplugin-plugin)
 * * [rollup常用的插件]（https://blog.csdn.net/zz_jesse/article/details/124642247）
 */
targets.reverse().forEach((target) => {
  const resolve = (...args: string[]) => pathResolve('packages', target, ...args)
  if (existsSync(resolve('dist'))) rmSync(resolve('dist'), { recursive: true, force: true })

  const outputConfig: { global: OutputOptions, cjs: OutputOptions; esm: OutputOptions } = {
    global: {
      file: resolve('dist', `index.js`),
      format: 'iife',
      sourcemap
    },
    cjs: {
      file: resolve('lib', `index.js`),
      format: 'cjs',
      sourcemap
    },
    esm: {
      file: resolve('es', `index.js`),
      format: `es`,
      sourcemap
    }
  }

  const extraPlugins = []
  const pkg = require(resolve('package.json'))
  const { babel: needBabel, formats: buildFormats = [outputConfig.cjs] } = pkg?.buildOptions || {}

  if (needBabel) {
    extraPlugins.push(postcss(), babel({
      babelHelpers: 'bundled',
      // include: [resolve('src')],
      exclude: 'node_modules/**',
      // plugins: ['@babel/plugin-transform-runtime'],
      extensions: ['.tsx', '.ts']
    }))
  }
  const packageConfigs = createConfig({
    input: resolve('src', 'index.ts'),
    output: buildFormats.map((format: 'global' | 'cjs' | 'esm') => outputConfig[format]),
    pkg,
    plugins: extraPlugins,
    target
  })
  rollupOptions.push(packageConfigs)
})

export default defineConfig(rollupOptions)
