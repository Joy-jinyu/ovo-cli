import express, { Express } from 'express'
import { ViteDevServer } from 'vite'
import { getMockData } from '@ovometajs/utils'
import { createProxyMiddleware } from 'http-proxy-middleware'

interface MockData {
  apiPath: string;
  jsonStr: string;
}

export async function createServer(
  {
    apiTarget = 'https://www.zhihu.com/api',
    staticTarget = 'https://www.zhihu.com/static',
    root = process.cwd(),
  } = {}
): Promise<{
  app: Express
  vite: ViteDevServer | undefined
}> {
  const app = express()

  // 配置代理中间件
  const apiProxy = createProxyMiddleware({
    target: apiTarget, // 目标服务器地址
    changeOrigin: true, // 改变请求源头，对于跨域请求很有用
    // pathRewrite: { '^/api': '' }, // 重写请求路径，去掉 '/api' 前缀
  });

    // 如果需要代理静态资源，比如图片、CSS等，也可以类似配置
  const staticProxy = createProxyMiddleware({
    target: staticTarget, // 静态资源服务器地址
    changeOrigin: true,
  });

  /**
   * @type {import('vite').ViteDevServer}
   */
  const vite: ViteDevServer = await (
    await import('vite')
  ).createServer({
    base: '/mock/',
    root,
    logLevel: 'info',
    server: {
      middlewareMode: true,
      watch: {
        // During tests we edit the files too fast and sometimes chokidar
        // misses change events, so enforce polling for consistency
        usePolling: true,
        interval: 100
      },
      hmr: {
        // port: hmrPort
      }
    },
    appType: 'custom'
  })
  // use vite's connect instance as middleware
  app.use(vite.middlewares)

  app.use('*', async (req, res, next) => {
    try {
      const url = req.originalUrl


      if (url && /^\/api/.test(url || '')) {
        next()
        return
      }
      res.status(200).set({ 'Content-Type': 'text/html' }).end('Hello World!')
    } catch (e: unknown) {
      if (e instanceof Error) {
        vite && vite.ssrFixStacktrace(e)
        res.status(500).end(e.stack)
      }
    }
  })

  const mockData = getMockData('mock')

  mockData.forEach((data: MockData) => {
    app.use(`/api${data.apiPath}`, (req, res) => {
      res.status(200).send(
        JSON.parse(data.jsonStr)
      )
    })
  })
  // 使用中间件
  app.use('/api', apiProxy);
  app.use('/static', staticProxy);


  return { app, vite }
}
