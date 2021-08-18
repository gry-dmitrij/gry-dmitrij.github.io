const path = require('path');
const fs = require('fs');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
//const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const inputDir = 'src';      // входная директория
const outputDir = 'dist';    // выходная директория

// генерирует конфигурации для html-webpack-pugin,
// проходя по всем html файлам в директории
function generateHTMLPlugins(inject = true) {
    let templateFiles = fs.readdirSync(path.resolve(__dirname, inputDir));
    return  templateFiles.filter(item => /\.(html)/i.test(path.extname(item)))
        .map(item => {
            return new HtmlPlugin({
                template: item,
                filename: item,
                inject: inject,
            })
        });
}

module.exports = (env, options) => {
    const devMode = options.mode === 'development';
    return {
        context: path.resolve(__dirname, inputDir),
        entry: './index.js',
        output: {
            path: path.join(__dirname, outputDir),
            filename: 'js/[name].js'
        },
        module: {
            rules: [
				{
					test: /\.m?js$/,
					exclude: /node_modules/,
					use: {
						loader: "babel-loader",
						options: {
							presets: ['@babel/preset-env']
						}
					}
				},
                {
                    test: /\.(s[ac]|c)ss$/i,
                    use: [
                        devMode ? 'style-loader' :
                            {
                                loader: MiniCssExtractPlugin.loader,
                                options: {
                                    publicPath: '../',
                                }
                            },
                        'css-loader',
                        'sass-loader'
                    ]
                },
                {
                    test: /\.(mp3|wav|aac)/i,
                    type: 'asset/resource',
                    generator: {
                        filename: 'sound/[hash][ext]'
                    }
                }
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: 'css/style.css',

            }),
            new CleanWebpackPlugin(),
            //new BundleAnalyzerPlugin()
        ].concat(generateHTMLPlugins())
    }
}
