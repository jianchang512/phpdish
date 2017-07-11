var path = require('path');
var glob = require('glob');
var config = require('./config.admin.build');

var entryPath = path.resolve(config.projectPath, config.entryPathName);
var baseUrl = '/' + config.theme;

var commonModulePath = path.resolve('./assets/src/modules');
var commonPluginPath = path.resolve('./assets/src/plugins');
var isProduct = (process.env.NODE_ENV == 'production');//判断环境变量

/**
 * 获取公共入口
 * @returns {{}}
 */
function getEntry(entryPath) {
    var entry = {};
    var srcDirName = entryPath + '/**/*.js';
    glob.sync(srcDirName).forEach(function (filepath) {
        var name = filepath.slice(filepath.lastIndexOf(config.entryPathName) + config.entryPathName.length + 1, -3);
        entry[name] = filepath;
    });
    return entry;
}

var webpack = require('webpack');
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
var CleanPlugin = require('clean-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: getEntry(entryPath),
    output: {
        path: config.buildPath,
        publicPath: baseUrl + '/js/',
        // filename: '[name]-[hash].js'
        filename: '[name].js'
    },
    module: {
        perLoaders: [
            {
                test: /\.js$/,
                loader: "jshint",
                exclude: /node_modules/
            }
        ],
        loaders: [
            {
                test: /\.css$/,
                // loader: 'style!css'
                loader: ExtractTextPlugin.extract("style-loader", "css-loader!postcss-loader")
            },
            {
                test: /\.js$/,
                loader: "babel",
                exclude: /node_modules/
            },
            {
                test: /\.svg$/,
                loader: 'file'
            },
            { test: /\.(gif|jpg|png|woff|svg|eot|ttf)\??.*$/, loader: 'url-loader?limit=50000&name=[path][name].[ext]'}
        ]
    },
    noParse: [],
    resolve: {
        root: path.resolve(config.projectPath, './src/js'),
        extensions: ['', '.js', '.json', '.scss'],
        alias: {
            commonModule: commonModulePath,
            commonPlugin: commonPluginPath,
            module: path.resolve(config.modulePath),
            plugin: path.resolve(config.pluginPath),

            layer: 'commonPlugin/layer/layer.js',
            lazyload: 'commonPlugin/jquery.lazyload.min.js',
            cookie: 'commonPlugin/js.cookie.js',
            dmuploader:  'commonPlugin/uploader/src/dmuploader.min.js',
            tmpl:  'commonPlugin/wu.tmpl.js/wu.tmpl.js',
            prettySocial: 'commonPlugin/prettySocial/jquery.prettySocial.js',
            "jquery.rating": 'commonPlugin/jquery-star-rating/src/rating.js',
            "jquery.rating.css": 'commonPlugin/jquery-star-rating/src/rating.css',
            "jquery.validate": "jquery-validation",
        }
    },
    externals: {
        'jquery': 'window.$',
        'lodash': 'window._',
        'art-dialog': 'dialog'
    },
    plugins: [
        new CleanPlugin([''], {
            root: path.resolve(config.buildPath)
        }),
        new ExtractTextPlugin("css/[name].css", {allChunks: true}),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery",
            "_": "lodash",
            "artDialog": "art-dialog"
        }),
        new CommonsChunkPlugin({
            name: "common",
            filename: 'common.js',
            minChunks: 3
        })
    ]
};
//生产环境加载uglify
if (isProduct) {
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            comments: false,
        })
    ]);
}