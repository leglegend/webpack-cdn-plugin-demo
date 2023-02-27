const qcdn = require('@q/qcdn')

let opts = {
  https: true,
  image: {
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
  initOption(options) {
    opts = options
  },
  uploadFile(file) {
    return new Promise((resolve, reject) => {
      qcdn.upload(file, opts).then((res) => {
        resolve(res[file])
      })
    })
  }
}
