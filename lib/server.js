const send = require('koa-send')
const Koa = require('koa')

function init({ port, app }) {
  const root = app.spack.destination()

  let webApp = new Koa()

  webApp.use(async (ctx, next) => {
    if (ctx.path === '/') {
      ctx.path = '/index.html'
    }
    await next()
  })
  webApp.use(async (ctx, next) => {

    if (/\.html$/.test(ctx.path)) {
      app.spack.logger.info(`----------- rebuild -------------`)
      await app.build()
    }
    await next()
  })

  webApp.use(async (ctx, next) => {
    if (/\.(html|js|css|png|jpg|gif|ico|svg|eot|ttf|woff|woff2|etf)$/.test(ctx.path)) {
      await send(ctx, ctx.path, {
        root
      })
    }
    else {
      await next()
    }
  })

  webApp.listen(port)
  app.spack.logger.log(`server run at ${port}`)
}

module.exports = {
  init
}