/**
 * render html with resource
 */
const { render, doDynamic } = require('../lib/html')
const { isHtml } = require('../lib/util')
const { existsSync } = require('fs')
const { join } = require('path')
const debug = require('debug')('hotpack/html')
const debugJson = require('debug')('hotpack-json/html')
module.exports = function (opts = {}) {
  return function (files, spack, done) {
    let { dep, runtime, logger, dynamic, getEntry } = spack
    const src = spack.source()
    logger.log('run plugin html')
    for (let file in files) {
      if (!isHtml(file)) {
        continue
      }
      //const renderFile = transformPageKey(file)
      const renderFile = file

      let entry = getEntry(file)
      if (!existsSync(join(src, entry))) {
        files[renderFile] = files[file]
        delete files[file]
        spack.logger.info(`entry ${entry} not exsit, render ${file} directly`)
        continue
      }
      let deps = dep.getByEntry(entry)
      let dynamicDeps = doDynamic(deps, dep, dynamic.get())

      //把 key 转为绝对路径
      for (const key in dynamicDeps) {
        dynamicDeps[key] = dynamicDeps[key].map(item => `/${item}`)
      }
      debugJson(`dynamicDeps are \n${JSON.stringify(dynamicDeps, null, 2)}`)

      deps = runtime.concat(deps)
      /*  if (dynamic.get().length > 0) {
         deps.push('runtime/import.js')
       }
  */
      debugJson(`deps are \n${JSON.stringify(deps, null, 2)}`)
      const renderData = deps.map(item => `/${item}`)
      let c = files[file].contents

      c = render(c, renderData)
      c = c.replace('</head>', `
       <script>
         window._dynamic_deps_=${JSON.stringify(dynamicDeps)};
         window._env_='development';
       </script>
       </head>
      `)
      c = c.replace('</body>',
        `<script>
          require('runtime/debug.js').run();
        </script>
        </body>`
      )
      if (opts.file) {
        file = opts.file
      }
      files[file].contents = c
      files[renderFile] = files[file]
      if (file !== renderFile) {
        delete files[file]
      }

      debug(`build ${file},www file is ${renderFile}`)

    }

    done()
  }
}
