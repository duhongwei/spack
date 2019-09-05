const buble = require('buble')
const { isHtml } = require('../lib/util')
const debug = require('debug')('hotpack/buble')
module.exports = function () {
  return function (files, { logger }) {
    logger.log('run plugin debug')
    for (let file in files) {
      if (!isHtml(file)) {
        continue
      }
      let c = files[file].contents
      c = c.replace('</body>',
        `<script>
          require('runtime/debug.js').run();
        </script>
        </body>`
      )
      files[file].contents = c
    }
  }
}