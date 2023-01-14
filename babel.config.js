module.exports = {
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            modules: 'auto', // 需要babel来解析es module
            targets: {
              node: 'current' // 指定环境为当前node版本
            }
          }
        ]
      ]
    }
  },
  presets: [
    '@babel/preset-env',
    [
      '@babel/preset-typescript',
      {
        allExtensions: true
      }
    ]
  ],
  plugins: ['@vue/babel-plugin-jsx']
}
