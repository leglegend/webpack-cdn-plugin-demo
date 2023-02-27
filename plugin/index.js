class HelloWorldPlugin {
  options

  constructor(options) {
    this.options = options
  }

  apply(compiler) {
    let chunkIds = []

    compiler.hooks.afterPlugins.tap(
      'Webpack5UploadPlugin',
      (compiler, entry) => {
        console.log(compiler.options.output.publicPath)
      }
    )
    compiler.hooks.compilation.tap('Webpack5UploadPlugin', (compilation) => {
      compilation.hooks.chunkAsset.tap(
        'Webpack5UploadPlugin',
        (chunk, filename) => {
          console.log('chunkAsset')
          chunkIds.push(chunk.id)
        }
      )
    })
    compiler.hooks.afterEmit.tapPromise(
      'Webpack5UploadPlugin',
      async (compilation) => {
        console.log(chunkIds)
        chunkIds = new Array(...new Set(chunkIds))
        console.log(chunkIds)
        console.log('afterEmit')

        const aaaa = eval(
          'e=>"js/"+{411:"member",535:"login"}[e]+"."+{411:"60e47c719eb9149c1887",535:"7e1aa5e449061c31ae9b"}[e]+".js"'
        )
        return Promise.resolve()
      }
    )
  }
}

module.exports = HelloWorldPlugin
