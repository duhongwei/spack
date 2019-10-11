
const { isHtml } = require('../lib/util')

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