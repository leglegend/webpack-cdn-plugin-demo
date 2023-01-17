const { uploadFile } = require('./qupload')
const path = require('path')
const fs = require('fs')

function resolve(dir) {
  return path.resolve(process.cwd(), 'dist', dir)
}

// 返回文件的资源内容
function findStringValue(asset) {
  if (asset._cachedSource) return asset._cachedSource

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
    compiler.hooks.afterEmit.tapPromise(
      'Webpack5CDNPlugin',
      async (compilation) => {
        // 资源列表
        const _assets = compilation.assets

        console.log(_assets)

        // 资源列表的key值，就是每一个文件的文件名
        let list = []
        for (let key in _assets) list.push(key)

        // 只处理js css html 文件
        list = list.filter((key) => /\.(js|html|css|png)$/.test(key))
        console.log(list)

        // 找到入口文件，只考虑index.html的情况
        if (!_assets['index.html']) return

        // 保存已上传CDN文件的路径，防止同一个文件多次上传
        const already = new Map()

        await dfs('index.html', '|')

        // 深度查询该文件引用了哪些文件
        async function dfs(key, log, map = new Map()) {
          // 拦截循环引用元素，直接返回元素的相对路径
          // TODO 此处需要做公共路径的处理
          if (map.get(key) === 2) return key

          // 一个哈希表，存储当前分支所有元素的信息
          // value代表该元素是否出现循环引用
          // 1:正常 2:存在循环引用
          map.set(key, 1)
          console.log(log + key)

          // 文件的路径
          const path = resolve(key)
          console.log(path)

          // 只有html js css需要替换内容
          if (/\.(js|css|html)$/.test(key)) {
            // 文件资源的字符串
            // let assetStringValue = findStringValue(_assets[key])
            let assetStringValue = fs.readFileSync(path, 'utf8')

            // 是否需要重写内容，如果文件引用了其他文件，则需要修改文件内的引用地址
            let needReplace = false

            for (let fileName of list) {
              // 当文件内容包含其他文件名称时
              if (assetStringValue?.includes(fileName) && key !== fileName) {
                // 文件内容中包含别的文件，所以之后需要重写文件内容
                needReplace = true

                // 哈希表中存在该文件的引用，证明出现循环引用
                // TODO 这里需要做公共路径的适配
                if (map.get(fileName)) map.set(fileName, 2)

                // 通过深度遍历查询被引用的文件是否还引用了其他文件
                // 这里需要一个Map解决循环引用的问题
                // 把已访问的文件放进Map中，在自身的深度遍历中如果再遇到
                // 则证明包含循环引用
                const newPath =
                  already.get(fileName) || (await dfs(fileName, log + '-', map))

                // 将文件内容中对其他文件的引用替换为上传CDN之后的地址
                assetStringValue = assetStringValue.replaceAll(
                  fileName,
                  newPath
                )
              }
            }

            // 将文件资源替换成修改后的
            if (needReplace) {
              fs.writeFileSync(path, assetStringValue)
              // _assets[key] = {
              //   source() {
              //     return assetStringValue
              //   },
              //   size() {
              //     return assetStringValue.length
              //   }
              // }
            }
          }

          let newKey

          // 出现循环引用，这里对出现循环引用的元素做特殊处理
          if (map.get(key) === 2 || key === 'index.html') {
            // 由于当前元素出现循环引用，并且我们已将其后代元素上传CDN
            // 所以这里还采用源地址，这样即使后代元素保存的是相对路径
            // 也能够访问到
            // TODO 这里需要做公共路径的适配
            newKey = key
          } else {
            // 在这里进行上传操作，并获取到上传后的新路径
            // newKey = await uploadFile(key, assetStringValue)
            newKey = await uploadFile(key, path)
          }

          // 并将新路径放进Map中
          already.set(key, newKey)

          // 当前元素已处理完成，从哈希表中删除
          map.delete(key)

          console.log('将' + key + '替换为' + newKey)

          // 返回修改后的资源名称
          return newKey
        }

        return Promise.resolve()
      }
    )
  }
}

module.exports = HelloWorldPlugin
