/**
 * render html with resource
 */
const { getEntry, render, doDynamic} = require('../lib/html')
const { isHtml } = require('../lib/util')
const { existsSync } = require('fs')
const { join } = require('path')
const debug = require('debug')('hotpack/html')
const debugJson = require('debug')('hotpack-json/html')
module.exports = function () {
  return function (files, spack, done) {
    let { dep, runtime, logger, dynamic } = spack
    const src = spack.source()
    logger.log('run plugin html')
    for (let file in files) {
      if (!isHtml(file)) {
        continue
      }
      debug(`build ${file}`)

      let entry = getEntry(file)
      if (!existsSync(join(src, entry))) {
        throw new Error(entry + ' not exist!')
      }
      let deps = dep.getByEntry(entry)
      let dynamicDeps = doDynamic(deps, dep, dynamic.get())
      debugJson(`dynamicDeps are \n${JSON.stringify(dynamicDeps, null, 2)}`)

      deps = runtime.concat(deps)
      if (dynamic.get().length > 0) {
        deps.push('runtime/import.js')
      }

      debugJson(`deps are \n${JSON.stringify(deps, null, 2)}`)
      const renderData = deps.map(item => `/${item}`)
      let c = files[file].contents

      c = render(c, renderData)
      c = c.replace('</head>', `
       <script>
         window._dynamic_deps_=${dynamicDeps};
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
      files[file].contents = c
    }
    done()
  }
}
