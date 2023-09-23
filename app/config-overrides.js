const webpack = require('webpack');
module.exports = function override(config, env) {
  //do stuff with the webpack config...

  config.resolve.fallback = {
    url: require.resolve('url'),
    assert: require.resolve('assert'),
    crypto: require.resolve('crypto-browserify'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    os: false,//require.resolve('os-browserify/browser'),
    buffer: require.resolve('buffer'),
    stream: require.resolve('stream-browserify'),
    //url: require.resolve('url/'), // require.resolve("url") can be polyfilled here if needed
    zlib: require.resolve("browserify-zlib") , // require.resolve("browserify-zlib") can be polyfilled here if needed
    'process/browser': require.resolve('process/browser')
  };
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  );
  config.module.rules.push({
        test: /\.(png|jpg|gif)$/,
        loader: require.resolve("file-loader"),
    },{
        test: /\.m?[jt]sx?$/,
        enforce: 'pre',
        use: ['source-map-loader'],
    },
    {
        test: /\.m?[jt]sx?$/,
        resolve: {
            fullySpecified: false,
        },
    },);
    
  return config;
};
