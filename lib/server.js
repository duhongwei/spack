const send = require('koa-send')
const Koa = require('koa')
const { join, normalize } = require('path')
const fs = require('mz/fs')

function init({ port, app }) {
  const root = app.spack.destination()

  let webApp = new Koa()
  webApp.use(async (ctx, next) => {
    //忽略 map文件
    if (/\.map$/.test(ctx.path)) {
      ctx.response.type = 'text';
      ctx.response.body = 'no map';
    }
    //防止路径攻击
    else if (ctx.path.indexOf('..') > -1) {
      ctx.response.type = 'text';
      ctx.response.body = 'invalid path';
      app.spack.fatal('has .. in path!')
    }
    else {
      const path = join(root, ctx.path.substr(1))
      try {
        ctx.fileStats = await fs.stat(path)
        //如果是目录，跳到index.html
        if (ctx.fileStats.isDirectory()) {
          let newUrl = ctx.path
          if (newUrl.endsWith('/')) {
            newUrl = `${ctx.path}index.html`
          }
          else {
            newUrl = `${ctx.path}/index.html`
          }
          await fs.stat(join(root, newUrl.substr(1)))
          ctx.path = newUrl
        }
      }
      catch (e) {
        const notfound = ['ENOENT', 'ENAMETOOLONG', 'ENOTDIR']
        if (notfound.includes(e.code)) {
          ctx.path = '/index.html'
        }
        else {
          ctx.path = '/error.html'
        }
      }
      await next()
    }
  })
  //304 本地开发不需要304
 /*  webApp.use(async (ctx, next) => {
    const ifModifiedSince = ctx.request.headers['if-modified-since'];
    const lastModified = ctx.fileStats.mtime.toGMTString();
    if (ifModifiedSince === lastModified) {
      ctx.response.status = 304;
    } else {
      await next();
    }
  }) */
  webApp.use(async (ctx, next) => {
    if (/\.html$/.test(ctx.path)) {
      app.spack.logger.info(`----------- rebuild -------------`)
      await app.build()
    }
    await next()
  })

  webApp.use(async (ctx) => {
    await send(ctx, ctx.path, {
      root
    })
  })
  webApp.listen(port)
  app.spack.logger.log(`server run at ${port}`)
}

module.exports = {
  init
}