const send = require('koa-send')
const Koa = require('koa')
const { join } = require('path')
//send 引用了mz，所以package.json没有再引
const fs = require('mz/fs')
function init({ port, app }) {
  const root = app.spack.destination()
  let webApp = new Koa()
  //因为是静态服务器，所以访问的应该文件一定存在。
  webApp.use(async (ctx, next) => {
    let path = join(root, ctx.path)
    let stats = await fs.stat(path)
    if (stats.isFile()) {
      await next()
    }
    else if (stats.isDirectory()) {
      path = join(path, 'index.html')
      stats = await fs.stat(path)
      if (stats.isFile()) {
        ctx.path += ctx.path.endsWith('/') ? 'index.html' : "/index.html"
        await next()
      }
    }

  })
  webApp.use(async (ctx, next) => {

    if (/\.html$/.test(ctx.path)) {
      app.spack.logger.info(`----------- rebuild -------------`)
      await app.build()
    }
    await next()
  })

  webApp.use(async (ctx) => {
    //if (/\.(html|js|css|png|jpg|gif|ico|svg|eot|ttf|woff|woff2|etf)$/.test(ctx.path)) {
    await send(ctx, ctx.path, {
      root
    })
    //}
    //else {
    //await next()
    //}
  })

  webApp.listen(port)
  app.spack.logger.log(`server run at ${port}`)
}

module.exports = {
  init
}