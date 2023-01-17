const qcdn = require('@q/qcdn')

const opts = {
  image: {
    https: false,
    domains: ['p1.ssl.qhimg.com', 'p2.ssl.qhimg.com']
  },
  static: {
    domains: [
      's0.ssl.qhimg.com',
      's1.ssl.qhimg.com',
      's2.ssl.qhimg.com',
      's3.ssl.qhimg.com'
    ]
  }
}

module.exports = {
  uploadFile(key, file) {
    return new Promise((resolve, reject) => {
      // qcdn.content(file, key.substring(key.lastIndexOf('.') + 1), opts).then(res => {
      //   resolve(res)
      // })
      qcdn.upload(file, opts).then((res) => {
        console.log(res)
        resolve(res[file])
      })
    })
  }
}
