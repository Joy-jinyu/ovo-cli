// jest 默认是支持直接使用 ts 来写 config
// 安装依赖 yarn add -D jest ts-jest @types/jest
import type { Config } from 'jest'
import { defaults } from 'jest-config'
const supportFile = ['ts', 'tsx', 'less']

// https://kulshekhar.github.io/ts-jest/docs/next/guides/esm-support/
const config: Config = {
  testEnvironment: 'jsdom',
  preset: 'ts-jest',
  setupFilesAfterEnv: ['./scripts/setupJestEnv.ts'],
  globals: {
    __DEV__: true,
    __TEST__: true,
    __VERSION__: require('./package.json').version,
    __BROWSER__: false,
    __GLOBAL__: false,
    __ESM_BUNDLER__: true,
    __ESM_BROWSER__: false,
    __NODE_JS__: true,
    __SSR__: true,
    __FEATURE_OPTIONS_API__: true,
    __FEATURE_SUSPENSE__: true,
    __FEATURE_PROD_DEVTOOLS__: false,
    __COMPAT__: true
  },
  // 使jest支持esm
  extensionsToTreatAsEsm: [...supportFile.map((extension) => `.${extension}`)],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  // 需要研究一下
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest', // added this line
    '\\.(less|css)$': 'jest-less-loader' // 支持less
  },
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'lcov', 'text'],
  collectCoverageFrom: ['packages/*/src/**/*.ts', 'packages/*/src/**/*.tsx'],
  watchPathIgnorePatterns: ['/node_modules/', '/dist/', '/.git/'],
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'js'],
  rootDir: __dirname,
  testMatch: ['<rootDir>/packages/*/__tests__/**/*spec.[jt]s?(x)']
}

export default config
