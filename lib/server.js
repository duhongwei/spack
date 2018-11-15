const staticServer = require('koa-static')
const koa = require('koa')
const { join, sep, extname } = require('path')
const { existsSync, readFileSync } = require('fs')
const { run } = require('./app')
const Logger = require('./logger')
const { matchPath } = require('react-router-dom')

function shouldPassthrough(path) {
  let ext = extname(path)
  let shouldPass = true

  //没指明后缀，不能过虑，因为这种一般是api或是页面请求
  if (!ext) {
    shouldPass = false
  }
  //html不能忽略
  if (ext == '.html') {
    shouldPass = false
  }
  return shouldPass
}
function init({ port, webroot }) {
  const logger = new Logger()
  const app = new koa()

  app.use(async (ctx, next) => {
    await next()
    if (ctx.response.status !== 404) {
      return
    }
    if (shouldPassthrough(ctx.path)) {
      return;
    }
    let d = new Date()
    logger.log(`request ${ctx.path} arrived at ${d.getHours()}:${d.getMinutes()} ${d.getSeconds()}`, 1)
    let path = ctx.path

    logger.log(`${path} not found, try to build`, 1)
    //去掉 最开始的 /
    let p = path.substr(1)
    //去掉后缀名
    p = p.split('.')
    p.pop()
    p = p.join('.')
    //读取路由
    //简单处理：通过 path匹配唯一current Route，然后服务端渲染后交由客户端。客户端的路由设置需要手动和服务端的config相匹配
    //服务端的配置 tplFile,renderFile。每个服务端的renderFile都有一个客户端的renderFile相对应。
    let routerConfig = require(join(process.cwd(), 'router'))
    const activeRoute = routerConfig.find((route) => matchPath(ctx.path, route))
    if (!activeRoute) {
      logger.log(`can not resolve path "${ctx.path}"`)
      return
    }
    //读模板，render
    const tplFile = join(webroot, activeRoute.tplFile)
    const renderFile = join(webroot, activeRoute.renderFile)
    if (!existsSync(tplFile) || !existsSync(renderFile)) {
      logger.log(`${tplFile} or ${renderFile} not exist`)
      return
    }
    const render = require(renderFile)['default']
    const tpl = readFileSync(tplFile, 'utf8')

    ctx.response.body = await render(ctx.path, activeRoute.fetchData || Promise.resolve({}))
      .then(result => {
        let content = tpl.replace("'_reactData_'", JSON.stringify(result.data))
        content = content.replace('<!--serverString-->', result.renderString)
        return content
      })
    ctx.response.status = 200
    logger.log('build success')
  })
  app.use(staticServer(webroot, { defer: true }))
  app.use(async (ctx) => {
    /* if (ctx.path === '/') {
      ctx.status = 301
      ctx.redirect('/entry/index')
      return
    } */
    if (shouldPassthrough(ctx.path)) {
      return
    }
    logger.log('===== check file change ====', 1)
    await run({ noCache: false })
  })
  return app.listen(port)
}
module.exports = {
  init
}