const path = require('path');
const fs = require('fs');
// const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const { extendDefaultPlugins } = require('svgo');
//const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const inputDir = 'src';      // входная директория
const outputDir = 'dist';    // выходная директория

// генерирует конфигурации для html-webpack-pugin,
// проходя по всем html файлам в директории
// если inject = true, то автоматически вставляет
// ссылку на js-код в html-документ
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
	// определение режима сборки
    const devMode = options.mode === 'development';
    return {
        context: path.resolve(__dirname, inputDir),
        entry: './index.js',
        output: {
            path: path.join(__dirname, outputDir),
            filename: 'js/[name].js',
			assetModuleFilename: "[name]_[hash][ext]",
			clean: true,
        },
        module: {
            rules: [
				{
					test: /\.m?js$/,
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env']
						}
					}
				},
                {
                    test: /\.(s[ac]|c)ss$/i,
                    use: [
                    	// для production используем MiniCssExtractPlugin
						// для development используем style-loader
                        devMode ? 'style-loader' :
                            {
                                loader: MiniCssExtractPlugin.loader,
                                options: {
                                    publicPath: '../',
                                }
                            },
                        'css-loader',
                        'sass-loader',
						'sass-bulk-import-loader'
                    ]
                },
                {
                    test: /\.(mp3|wav|aac)$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: 'sound/[hash][ext]'
                    }
                },
				{
					test: /\.(woff2?|ttf)$/i,
					type: 'asset/resource',
					generator: {
						filename: 'font/[name][ext]'
					}
				},
				{
					test: /\.(jpe?g|png|gif|svg)$/i,
					include: [
						//берем файлы только в следующих папках
						path.resolve(__dirname, inputDir, 'img/')
					],
					type: 'asset/resource',
					generator: {
						filename: 'img/[hash][ext]'
					}
				},
				{
					test: /\.(html)$/i,
					use: ['html-loader']
				}
            ]
        },
		optimization: {
			realContentHash: options.mode === 'development',
		},
        plugins: [
            new MiniCssExtractPlugin({
                filename: 'css/style.[hash].css',
            }),
			new ImageMinimizerPlugin({
				minimizerOptions: {
					plugins: [
						['gifsicle', { interlaced: true }],
						['jpegtran', { progressive: true }],
						['optipng', { optimizationLevel: 5 }],
						[
							'svgo',
							{
								plugins: extendDefaultPlugins([
									{
										name: 'removeViewBox',
										active: false
									},
									{
										name: 'addAttributesToSVGElement',
										params: {
											attributes: [{ xmlns: 'http://www.w3.org/2000/svg' }],
										}
									}
								])
							}
						]
					]
				}
			}),
            // new CleanWebpackPlugin(),
            //new BundleAnalyzerPlugin()
        ].concat(generateHTMLPlugins(true))
    }
}
