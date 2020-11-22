const path = require("path");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const { SourceMapDevToolPlugin } = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const pkg = require("./package.json");
const { WatchIgnorePlugin } = require("webpack");
const WebpackNotifierPlugin = require("webpack-notifier");
const BUILD_DIR = abs("build");
const HtmlWebpackPlugin = require("html-webpack-plugin");

function abs(...args) {
  return path.resolve(__dirname, ...args);
}

module.exports = (env = {}, argv = {}) => {
  const cssLoaders = [MiniCssExtractPlugin.loader, "css-loader"];

  console.log("argv", argv);

  if (argv.mode === "production") {
    cssLoaders.push({
      loader: "postcss-loader",
      options: {
        plugins: [require("autoprefixer")()],
      },
    });
  }

  return {
    entry: {
      bundle: [
        abs("lib", "App", "index.js"),
        abs("src", "App", "style.styl"),
        abs("src", "App", "styles.less"),
      ],
    },
    stats: {
      // Шумодав для ExtractTextPlugin
      children: false,
    },
    output: {
      filename: "[name].js",
      path: BUILD_DIR,
      publicPath: BUILD_DIR,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: ["source-map-loader"],
          enforce: "pre",
        },
        {
          test: /\.css$/,
          use: cssLoaders,
        },
        {
          test: /\.styl$/,
          use: [
            ...cssLoaders,
            {
              loader: "stylus-loader",
              options: {
                preferPathResolver: "webpack",
              },
            },
          ],
        },
        {
          test: /\.less$/,
          use: [
            ...cssLoaders,
            {
              loader: "less-loader",
              options: {
                javascriptEnabled: true,
              },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: [".js", ".jsx", ".css", ".styl"],
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendor",
            chunks: "initial",
          },
        },
      },
    },
    watchOptions: {
      aggregateTimeout: 600,
    },
    devtool: false,
    devServer: {
      contentBase: BUILD_DIR,
      compress: true,
      port: 9000,
      hot: true,
      open: true,
      writeToDisk: true,
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: "react-redux-saga",
        template: "./index.html",
      }),
      new CleanWebpackPlugin({
        cleanStaleWebpackAssets: false,
      }),
      new SourceMapDevToolPlugin({
        filename: "[file].map",
        test: /\.js$/,
        include: "bundle.js",
        noSources: argv.mode === "production",
      }),
      new MiniCssExtractPlugin({
        filename: "[name].css",
      }),
      new WebpackNotifierPlugin({
        title: pkg.name,
        alwaysNotify: true,
        contentImage: abs("..", "shared", "img", "webpack.png"),
      }),
      new WatchIgnorePlugin([/[\\/]node_modules[\\/]/, BUILD_DIR, /\.d\.ts$/]),
    ],
  };
};
