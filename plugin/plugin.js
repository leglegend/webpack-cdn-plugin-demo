/* eslint-disable */
const { initOption, uploadFile } = require('./qupload')
const path = require('path')
const fs = require('fs')

function resolve(dir) {
  return path.resolve(process.cwd(), dir)
}

// 修改字符串
function replaceGroupToAlone(assetStringValue, chunkIds, prefix, ext) {
  const regExp = new RegExp(`e=>"${prefix.slice(0, -1)}\\/".+"\\.${ext}"`)
  const regExp2 = new RegExp(
    `function\\(e\\){return"${prefix.slice(0, -1)}\\/".+"\\.${ext}"}`
  )
  const aimString =
    assetStringValue.match(regExp)?.[0] ||
    assetStringValue.match(regExp2)?.[0] ||
    ''

  if (!aimString) return assetStringValue

  const fileList = []

  let getFile

  eval('getFile=' + aimString)

  chunkIds.forEach((id) => {
    if (
      !getFile(id).includes('undefined') &&
      !fileList.includes(`${id}:"${getFile(id)}"`)
    ) {
      fileList.push(`${id}:"${getFile(id)}"`)
    }
  })

  return assetStringValue.replace(aimString, `e=>""+{${fileList.join(',')}}[e]`)
}

// 将js文件中引用方式改为引用完整路径
function changeFileResolvePath(assetStringValue, chunkIds, fileList) {
  // 获取所有文件前缀，去重
  const filePrefixs = new Array(...new Set(fileList.map((file) => file.prefix)))

  if (filePrefixs.length) {
    for (let prefix of filePrefixs) {
      if (!prefix) continue
      assetStringValue = replaceGroupToAlone(
        assetStringValue,
        chunkIds,
        prefix,
        'js'
      )
      assetStringValue = replaceGroupToAlone(
        assetStringValue,
        chunkIds,
        prefix,
        'css'
      )
    }
  }
  return assetStringValue
}

// 去掉js文件中的公共路径
function removePublicPath(publicPath, assetStringValue) {
  if (!publicPath) return assetStringValue
  return assetStringValue.replace(`.p="${publicPath}"`, '.p=""')
}

// 判断是文件还是文件夹
function isFile(dir) {
  return fs.lstatSync(dir).isFile()
}

// 递归查找输出目录的所有文件
function deepReaddir(dir, prefix) {
  return fs.readdirSync(dir).flatMap((fileName) => {
    const completePath = path.join(dir, fileName)

    if (isFile(completePath)) {
      if (/\.(txt|map)$/.test(fileName)) return []
      return {
        fileName: fileName,
        prefix,
        fullPath: completePath
      }
    } else return deepReaddir(completePath, prefix + fileName + '/')
  })
}

/**
 * 不用正则的方式替换所有值
 * @param text 被替换的字符串
 * @param checker  替换前的内容
 * @param replacer 替换后的内容
 * @returns {String} 替换后的字符串
 */
function replaceAll(text, checker, replacer) {
  let lastText = text
  text = text.replace(checker, replacer)
  if (lastText !== text) {
    return replaceAll(text, checker, replacer)
  }
  return text
}

class Webpack5UploadPlugin {
  constructor(options) {
    initOption(options)
  }

  apply(compiler) {
    let publicPath = compiler.options.output.publicPath || '/'
    // 如果公共路径不是以’/‘结尾，则在后面加上’/‘
    if (!/\/$/.test(publicPath)) publicPath += '/'

    // 文件输出路径
    const outputDir = compiler.options.output.path || resolve('dist')

    // 保存已上传文件的路径
    const uploadedFiles = []

    // 块id
    let chunkIds = []

    compiler.hooks.compilation.tap('Webpack5UploadPlugin', (compilation) => {
      compilation.hooks.chunkAsset.tap('Webpack5UploadPlugin', (chunk) => {
        chunkIds.push(chunk.id)
      })
    })

    compiler.hooks.afterEmit.tapPromise(
      'Webpack5UploadPlugin',
      async (compilation) => {
        // 计算文件列表
        const fileList = deepReaddir(outputDir, '')

        // 找到入口文件
        const enters = fileList.filter((file) => /\.html$/.test(file.fileName))

        // 保存已上传CDN文件的路径，防止同一个文件多次上传
        const already = new Map()

        // 深度查询该文件引用了哪些文件
        async function dfs(current) {
          // 只有html js css需要替换内容
          if (/\.(js|html|css)$/.test(current.fileName)) {
            // 文件资源的字符串
            let assetStringValue = fs.readFileSync(current.fullPath, 'utf8')

            // 是否需要重写内容，如果文件引用了其他文件，则需要修改文件内的引用地址
            let needReplace = false

            // js文件有特殊匹配规则
            if (/\.js$/.test(current.fileName)) {
              needReplace = true

              // js文件需要去掉公共路径，不然引用会有问题
              assetStringValue = removePublicPath(publicPath, assetStringValue)

              // 将js文件中分段式的路径拼接改为完整路径
              assetStringValue = changeFileResolvePath(
                assetStringValue,
                chunkIds,
                fileList
              )
            }

            for (let file of fileList) {
              // 过滤当前文件
              if (current.fileName === file.fileName) continue

              // 当文件内容包含其他文件名称时
              if (assetStringValue?.includes(file.fileName)) {
                // 文件内容中包含别的文件，所以之后需要重写文件内容
                needReplace = true

                // 通过深度遍历查询被引用的文件是否还引用了其他文件
                const newPath = already.get(file.fileName) || (await dfs(file))

                // html和css中的引用使用publickPath+文件路径的方式
                if (/\.(html|css)$/.test(current.fileName)) {
                  assetStringValue = replaceAll(
                    assetStringValue,
                    publicPath + file.prefix + file.fileName,
                    newPath
                  )
                }

                if (/\.js$/.test(current.fileName)) {
                  assetStringValue = replaceAll(
                    assetStringValue,
                    file.prefix + file.fileName,
                    newPath
                  )
                }

                if (/\.css$/.test(current.fileName)) {
                  assetStringValue = replaceAll(
                    assetStringValue,
                    '../' + file.fileName,
                    newPath
                  )
                }
              }
            }

            // 将文件资源替换成修改后的
            if (needReplace) {
              fs.writeFileSync(current.fullPath, assetStringValue)
            }
          }

          // html不用上传 直接返回
          if (/\.html$/.test(current.fileName)) return current.fileName

          // 在这里进行上传操作，并获取到上传后的新路径
          const newPath = await uploadFile(current.fullPath)

          // 上传完成后保存源文件路径，打包结束后删除
          uploadedFiles.push(current.fullPath)

          // 并将新路径放进Map中
          already.set(current.fileName, newPath)

          // 返回修改后的资源名称
          return newPath
        }

        for (const file of enters) {
          await dfs(file)
        }

        return Promise.resolve()
      }
    )
    compiler.hooks.done.tap('Webpack5UploadPlugin', () => {
      // 完成后删除已上传的文件
      // 因为打包后webpack会把文件信息列出来，直接删除会报错
      // 这里给一个延迟，等他列完再删
      setTimeout(() => {
        uploadedFiles.forEach((path) => fs.unlinkSync(path))
      }, 500)
    })
  }
}

module.exports = Webpack5UploadPlugin
