const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');

const path = require('path');
const packageFile = require('./package.json');

const libraryName = 'enhanced-github';
const libVersion = packageFile.version;
const license = packageFile.license;
const destination = path.resolve(__dirname, 'dist');

let deps = '';
Object.keys(packageFile.dependencies).map((key, index) => {
  deps += `\n ${index + 1}. ${key} - ${packageFile.dependencies[key]}`;
});

const libraryHeaderComment = `${libraryName} - v${libVersion}\n
URL - https://github.com/softvar/ehanced-github\n
${license} License, Copyright Varun Malhotra

Dependencies used - ${deps}`;

function addPlugins(argv) {
  const plugins = [];

  plugins.push(
    new webpack.BannerPlugin({
      banner: libraryHeaderComment,
      entryOnly: true
    })
  );
  plugins.push(
    new CleanWebpackPlugin({
      default: [destination, path.resolve(__dirname, 'enhanced-github'), path.resolve(__dirname, 'enhanced-github.zip')]
    })
  );
  plugins.push(
    new CopyPlugin({
      patterns: [
        { from: 'options.js', to: destination, },
        { from: 'popup.js', to: destination, },
        { from: '*html', to: destination, },
        { from: 'manifest.json', to: destination,},
        { from: 'icons/*.png', to: destination, },
        { from: 'src/background.js', to: destination, },
        { from: 'LICENSE', to: destination , }
      ]
    })
  );

  if (argv.mode === 'production') {
    plugins.push(
      new ZipPlugin({
        path: path.resolve(__dirname, 'dist'),
        filename: path.resolve(__dirname, 'enhanced-github.zip')
      })
    );
  }

  return plugins;
}

module.exports = function(_env, argv) {
  return {
    entry: {
      [libraryName]: './src/inject.js'
    },
    devtool: 'source-map',
    mode: argv.mode,
    output: {
      path: destination,
      filename: 'src/inject.js',
      library: libraryName,
      libraryTarget: 'global'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules|dist/,
          use: {
            loader: 'babel-loader'
          }
        }
      ]
    },
    plugins: addPlugins(argv),
    watchOptions: {
      poll: true,
      ignored: /node_modules/
    }
  };
};
