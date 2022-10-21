import fs from 'fs'
import path from 'path'
import glob from 'glob'
import axios from 'axios';
import Koa from 'koa'
import koaBody from 'koa-body';
import koaConnect from 'koa-connect'
import { createServer as createViteServer, ViteDevServer } from 'vite'
import colors from 'colors'
import child_process from 'child_process'
import Router from 'koa-router'
import cors from '@koa/cors'

const is_files_mock = true;
// @ts-ignore
let axiosIns = axios.create({
  timeout: 10000
})
// "dev": "NODE_ENV=local nodemon --watch server.ts --exec ts-node server.ts",
// "server": "yarn build && cross-env NODE_ENV=production ts-node server.ts",
const API_HOST = {
  'local': 'http://192.168.1.93:8080',
  'uat': 'http://192.168.0.198:8080',
  'prod': 'http://192.168.1.93:8080',
};
//-----------------------------------------------------------------------------------------
const router = new Router()
//------------------------------------------------------------------------------------------

const SERVER_PORT = 8888
const SERVER_HTML_ERROR = 'server_html_error'

const IS_LOCAL: boolean = process.env.NODE_ENV === 'local';

async function createAppServer() {
  const resolve = (p: string) => path.resolve(__dirname, p)

  const app = new Koa()
  app.use(cors())
  app.use(koaBody({
    multipart: true
  }))
  let vite: ViteDevServer
  //启动服务
  if (IS_LOCAL) {
    vite = await createViteServer({
      server: { middlewareMode: 'ssr' },
    })
    app.use(koaConnect(vite.middlewares))
  } else {
    app.use((await import('koa-compress')).default())

    app.use(
      (await import('koa-static')).default(resolve('dist/client'), {
        index: false,
      })
    )
  }
  // 注册路由
  glob.sync(path.resolve('./mock', '**/*.json')).forEach((item, i) => {
    const apiJsonPath = item && item.split('/mock')[1]
    const apiPath = apiJsonPath.replace('.json', '')
    router.all('/api' + apiPath, async (ctx, next) => {
      try {
        if (IS_LOCAL && is_files_mock) {
          const jsonStr = fs.readFileSync(item).toString();
          ctx.body = jsonStr;
        } else {
          const method = ctx.request.method.toLowerCase();
          const params = ctx.request.body
          // @ts-ignore
          const data = await axiosIns[method](`${API_HOST[process.env.NODE_ENV]}${apiPath}`, params, {}).then(function (res) {
            let result = (res?.data || null), error;
            if (res && res.status === 200) {
              if (!result) {
                res.data = {};
              }
              for (const key in res.headers) {
                ctx.set(key, res.headers[key]);
              }
              return res.data;
            } else {
              error = new Error()
              error.message = result?.message || '';
              // @ts-ignore
              error.data = res?.data
              // @ts-ignore
              error.code = res?.status;
              throw error;
            };
          }).catch((e: any) => { console.log('123123', e); return e });
          ctx.body = data;
        }
      } catch (err) {
        ctx.body = {
          status: 404,
          type: 'false',
        }
        ctx.throw('服务器错误: ', 500)
      }
    })
  })

  router.get('(.*)', async (ctx, next) => {
    const { req } = ctx
    const { url } = req
    if (!url || !/^\/api/.test(url || '')) {
      await next();
    }
    try {
      let template: string, render

      if (IS_LOCAL) {
        template = fs.readFileSync(
          path.resolve(__dirname, 'index.html'),
          'utf-8'
        )
        template = await vite.transformIndexHtml(url || '', template)
        render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render
      } else {
        template = fs.readFileSync(resolve('dist/client/index.html'), 'utf-8')

        render = (await import(resolve('dist/server/entry-server.js'))).render
      }
      const context: { preloadedState?: string } = {}
      const appHtml = await render(url, context)
      let html = template

      if (context.preloadedState) {
        html = html.replace(
          `//--script-paclcehoder--//`,
          `window.PRE_LOADED_STATE = ${JSON.stringify(
            context.preloadedState
          )};window.LOCAL_ENV='${process.env.NODE_ENV}'`
        )
      }

      html = html.replace(`<!--ssr-->`, appHtml)
      // 6. 返回渲染后的 HTML。
      ctx.body = html
      ctx.status = 200
    } catch (e: any) {
      console.log('走到这里了吗');
      console.log(e);
      if (IS_LOCAL) {
        vite.ssrFixStacktrace(e)
      }
      ctx.app.emit('error', new Error(SERVER_HTML_ERROR), ctx, e)
    }
  });
  app.on('error', (err, ctx, e) => {
    if (err.message === SERVER_HTML_ERROR) {
      //打印错误
      const msg = `[返回HTML页面异常]: ${e.stack}`
      console.error(colors.red(msg))
      ctx.status = 500
      ctx.body = msg
    } else {
      const msg = `[服务器异常]: ${e}`
      console.error(colors.red(msg))
      ctx.status = 500
      ctx.body = msg
    }
  })



  app.use(router.routes())

  app.listen(SERVER_PORT, () => {
    const url = `http://localhost:${SERVER_PORT}`
    console.log(
      colors.green('[React SSR]启动成功, 地址为:'),
      colors.green.underline(url)
    )
    child_process.exec(`open ${url}`)
  })
}

createAppServer()
