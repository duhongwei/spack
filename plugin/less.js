/** 
 * 参数参见 https://github.com/less/less.js
 *
 */

const { isLess } = require('../lib/util')
const less = require('less')

module.exports = function() {

    return function(files, spack, done) {
        const pList = []
        spack.logger.log('run plugin less')
        for (let file in files) {
            if (!isLess(file)) {
                continue
            }
            pList.push(
                less.render(files[file].contents, {
                   
                }, function(e, output) {
                    delete files[file]
                    // console.log(file.replace(/\.less$/,'.css'));
                    
                    files[file.replace(/\.less$/,'.css')]={
                        contents : output.css
                    }
                })
            )
        }
        Promise.all(pList).then(() => {
            done()
        })
    }
}