var qiniu = require('qiniu')

var accessKey = 'fltIkWyvX3JvWfWamktT4j244TjSXrgJrI-vRUrJ'
var secretKey = 'HSf5WPX95T_UslLsxOAHezQua4Sg57R6bNHsnHIj'
var mac = new qiniu.auth.digest.Mac(accessKey, secretKey)


var putPolicy = new qiniu.rs.PutPolicy({
  scope: 'nite'
})
var uploadToken = putPolicy.uploadToken(mac)

var config = new qiniu.conf.Config()
// 空间对应的机房
config.zone = qiniu.zone.Zone_z1

var baseUrl = 'http://rogy0w6f6.hb-bkt.clouddn.com/'

var formUploader = new qiniu.form_up.FormUploader(config)

module.exports = {
  uploadFile(key, file) {
    var putExtra = new qiniu.form_up.PutExtra({
      // 通过文件名后缀判断文件格式
      mimeType: key.substring(key.lastIndexOf('.') + 1)
    })

    return new Promise((resolve, reject) => {
      formUploader.put(
        uploadToken,
        key,
        file,
        putExtra,
        function (respErr, respBody, respInfo) {
          if (respErr) {
            return reject(respErr)
          }
          if (respInfo.statusCode == 200) {
            resolve(baseUrl + key)
          } else {
            console.log(respInfo.statusCode)
            console.log(respBody)
          }
        }
      )
    })
  }
}
