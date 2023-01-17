const fs = require('fs')
const path = require('path')

function resolve(dir) {
  return path.resolve(process.cwd(), dir)
}

const filePath = resolve('js/app.dbcc3259.js')

let assetStringValue = fs.readFileSync(filePath, 'utf8')

console.log(assetStringValue.match(/"js\/".+"\.js"/)?.[0])
const fileName = 'js/app.dbcc3259.js'

console.log(
  fileName.slice(fileName.lastIndexOf('/') + 1, fileName.lastIndexOf('.'))
)
