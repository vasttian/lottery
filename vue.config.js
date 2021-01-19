const path = require("path");

module.exports = {
  chainWebpack: config => {
    const resolve = dir => path.join(__dirname, dir);
    const svgRule = config.module.rule('svg');
    svgRule.uses.clear();

    svgRule
      .test(/\.(svg)(\?.*)?$/)
      .oneOf('name')
        .include
          .add(resolve('src/assets/sprite.svg'))
          .end()
        .use('file-loader')
          .loader('file-loader')
          .options({
            name: 'img/[name].[hash:8].[ext]'
          })
          .end()
        .end()
      .oneOf('normal')
        .exclude
          .add(resolve('src/assets/sprite'))
          .end()
        .use('file-loader')
          .loader('file-loader')
          .options({
            name: 'img/[name].[hash:8].[ext]'
          })
          .end()
        .end()
      .oneOf('sprite')
        .include
          .add(resolve('src/assets/sprite'))
          .end()
        .use('svg-sprite-loader')
          .loader('svg-sprite-loader')
          .options({
            symbolId: 'sprite-[name]'
          })
          .end()
        .use('svgo-loader')
          .loader('svgo-loader')
          .options({
            plugins: [
              {removeTitle: true},
              {convertColors: {shorthex: false}},
              {convertPathData: false}
            ]
          });
  },
};