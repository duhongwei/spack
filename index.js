const lib = require("./lib")


module.exports = {
  util: lib.util,
  ToAmd: lib.parser.ToAmd.ToAmd,
  ToCmd:lib.parser.ToCmd,
  pathToKey: lib.parser.ToAmd.pathToKey
}