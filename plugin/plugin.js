function findStringValue(asset) {
  return asset._valueAsString || asset._source?._valueAsString
}

class HelloWorldPlugin {
  options

  constructor(options) {
    this.options = options
  }

  apply(compiler) {
    compiler.hooks.emit.tap('Webpack5CDNPlugin', (compilation) => {
      // 资源列表
      const _assets = compilation.assets

      // 资源列表的key值，就是每一个文件的文件名
      const list = []
      for (let key in _assets) list.push(key)
      console.log(list)

      // 找到入口文件，只考虑index.html的情况
      if (!_assets['index.html']) return

      dfs('index.html', '|')

      // 深度查询该文件引用了哪些文件
      function dfs(key, log) {
        console.log(log + key)
        // 文件资源的字符串
        let assetStringValue = findStringValue(_assets[key])

        let needReplace = false
        for (let key of list) {
          if (assetStringValue?.includes(key)) {
            needReplace = true
            const newPath = dfs(key, log + '-')

            assetStringValue = assetStringValue.replaceAll(key, newPath)
          }
        }

        // 将文件资源替换成修改后的
        if (needReplace) {
          _assets[key] = {
            source() {
              return assetStringValue
            },
            size() {
              return assetStringValue.length
            }
          }
        }

        // 在这里进行上传操作，并获取到上传后的新路径

        // 返回修改后的资源名称
        return '修改后的' + key
      }
    })
  }
}

module.exports = HelloWorldPlugin
