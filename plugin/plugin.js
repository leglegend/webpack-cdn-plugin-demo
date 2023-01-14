const { uploadFile } = require('./upload')

// 返回文件的资源内容
function findStringValue(asset) {
  const source = asset._source || asset
  if (source._valueIsBuffer) {
    return source._valueAsBuffer
  }

  return asset._valueAsString || asset._source?._valueAsString
}
class HelloWorldPlugin {
  options

  constructor(options) {
    this.options = options
  }

  apply(compiler) {
    compiler.hooks.emit.tapPromise('Webpack5CDNPlugin', async (compilation) => {
      // 资源列表
      const _assets = compilation.assets

      console.log(_assets)

      // 资源列表的key值，就是每一个文件的文件名
      let list = []
      for (let key in _assets) list.push(key)

      // 只处理js css html 文件
      list = list.filter((key) => /\.(js|css|html|png)$/.test(key))
      console.log(list)

      // 找到入口文件，只考虑index.html的情况
      if (!_assets['index.html']) return

      // 保存已上传CDN文件的路径，防止同一个文件多次上传
      const already = new Map()

      await dfs('index.html', '|')

      // 深度查询该文件引用了哪些文件
      async function dfs(key, log) {
        console.log(log + key)
        // 文件资源的字符串
        let assetStringValue = findStringValue(_assets[key])

        // 是否需要重写内容，如果文件引用了其他文件，则需要修改文件内的引用地址
        let needReplace = false

        // 只有html js css需要替换内容
        if (/\.(js|css|html)$/.test(key)) {
          for (let key of list) {
            // 这里应该再过滤下，自己不检查自己
            if (assetStringValue?.includes(key)) {
              // 文件内容中包含别的文件，所以之后需要重写文件内容
              needReplace = true

              // 通过深度遍历查询被引用的文件是否还引用了其他文件
              // 这里需要一个Map解决循环引用的问题
              // 把已访问的文件放进Map中，在自身的深度遍历中如果再遇到
              // 则证明包含循环引用
              const newPath = already.get(key) || (await dfs(key, log + '-'))

              // 将文件内容中对其他文件的引用替换为上传CDN之后的地址
              assetStringValue = assetStringValue.replaceAll(key, newPath)
            }
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
        // 并将新路径放进Map中
        const newKey = await uploadFile(key, assetStringValue)
        already.set(key, newKey)

        console.log('将' + key + '替换为' + newKey)

        // 返回修改后的资源名称
        return newKey
      }

      return Promise.resolve()
    })
  }
}

module.exports = HelloWorldPlugin
