const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HelloWorldPlugin = require('./plugin/plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

function resolve(dir) {
  return path.join(__dirname, dir)
}

const plugins = [
  new VueLoaderPlugin(),
  new HtmlWebpackPlugin({
    title: 'webpack5-cdn-plugin',
    template: './public/index.html'
  })
]

if (process.env.NODE_ENV === 'production') {
  plugins.push(
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css',
      chunkFilename: 'css/[name].[contenthash].css',
      ignoreOrder: true
    }),
    new HelloWorldPlugin()
  )
}

module.exports = {
  entry: './src/main.ts',
  mode: process.env.NODE_ENV,
  target: 'web',
  // devtool:
  //   process.env.NODE_ENV === 'development'
  //     ? 'eval-cheap-module-source-map'
  //     : 'nosources-source-map',
  output: {
    clean: true,
    publicPath: process.env.NODE_ENV === 'development' ? '/data/' : '',
    filename: 'js/[name].[contenthash].js'
  },
  devServer: {
    hot: true,
    historyApiFallback: true
  },
  module: {
    rules: [
      {
        test: /\.(t|j)s$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          reactivityTransform: true
        }
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          process.env.NODE_ENV === 'production'
            ? MiniCssExtractPlugin.loader
            : 'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [['postcss-preset-env']]
              }
            }
          },
          'sass-loader'
        ]
      },
      {
        test: /\.svg$/,
        include: [resolve('src/icons')],
        use: [
          {
            loader: 'svg-sprite-loader',
            options: {
              symbolId: 'icon-[name]'
            }
          },
          {
            loader: 'svgo-loader'
          }
        ]
      },
      {
        test: /\.(png|svg|jpe?g|gif)$/,
        exclude: [resolve('src/icons')],
        type: 'asset',
        generator: {
          filename: 'images/[name].[hash][ext]'
        }
      }
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    extensions: ['.js', '.ts', '.vue', '.json']
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 20,
          chunks: 'initial'
        },
        // 'element-plus': {
        //   test: /[\\/]node_modules[\\/]element-plus/,
        //   name: 'element-plus',
        //   priority: 20,
        //   chunks: 'initial'
        // },
        'element-plus-async': {
          test: /[\\/]node_modules[\\/]element-plus/,
          name: 'element-plus-async',
          priority: 10,
          chunks: 'async'
        },
        // vue: {
        //   // 分离vue全家桶
        //   name: 'vue',
        //   test: /[\\/]vue(.+?)[\\/]/,
        //   priority: 20,
        //   chunks: 'initial'
        // },
        // pinia: {
        //   // 分离vue全家桶
        //   name: 'pinia',
        //   test: /[\\/]pinia(.+?)[\\/]/,
        //   priority: 20,
        //   chunks: 'initial'
        // },
        cropperjs: {
          test: /[\\/]node_modules[\\/]cropperjs/,
          name: 'cropperjs',
          priority: 20,
          chunks: 'all'
        },
        gsap: {
          test: /[\\/]node_modules[\\/]gsap/,
          name: 'gsap',
          priority: 20,
          chunks: 'all'
        },
        common: {
          // 公共模块
          chunks: 'all',
          priority: 1,
          name: 'common',
          // minSize: 100, // 大小超过100个字节
          minChunks: 2 // 最少引入了3次
        }
      }
    }
  },
  plugins
  // devServer: {
  //   port: 8080,
  //   proxy: {
  //     '/': {
  //       target: 'https://testbcrmapi.nutcards.com',
  //       changeOrigin: true
  //     }
  //   }
  // },
}
