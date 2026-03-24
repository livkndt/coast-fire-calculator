import path from 'path'
import { Configuration, DefinePlugin } from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { VueLoaderPlugin } from 'vue-loader'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import 'webpack-dev-server'

// CSP for the dev server — allows 'unsafe-inline' for styles because
// style-loader injects <style> tags during development.
const DEV_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join('; ')

export default (env: Record<string, unknown>, argv: { mode?: string }): Configuration => {
  const isProd = argv.mode === 'production'
  const analyse = Boolean(env?.analyse)

  return {
    // 'cheap-module-source-map' gives useful source maps without using eval,
    // keeping the dev CSP clean. Production ships no source maps.
    devtool: isProd ? false : 'cheap-module-source-map',
    entry: './src/main.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[contenthash].js',
      publicPath: '/',
      clean: true,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.vue', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
        },
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          options: {
            appendTsSuffixTo: [/\.vue$/],
            transpileOnly: true,
          },
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          // Production: extract to .css files so CSP can drop 'unsafe-inline'
          // Development: style-loader injects <style> tags for HMR
          use: [isProd ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        template: './public/index.html',
        title: 'Coast FIRE Calculator',
      }),
      new DefinePlugin({
        __VUE_OPTIONS_API__: JSON.stringify(false),
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
      }),
      ...(isProd
        ? [new MiniCssExtractPlugin({ filename: '[name].[contenthash].css' })]
        : []),
      ...(analyse ? [new BundleAnalyzerPlugin()] : []),
    ],
    devServer: {
      port: 3000,
      hot: true,
      historyApiFallback: true,
      headers: {
        'Content-Security-Policy': DEV_CSP,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Resource-Policy': 'same-origin',
      },
    },
    optimization: {
      minimize: isProd,
      minimizer: [
        '...', // preserves default TerserPlugin for JS
        new CssMinimizerPlugin(),
      ],
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          chartjs: {
            test: /[\\/]node_modules[\\/](chart\.js|vue-chartjs|@kurkle)[\\/]/,
            name: 'vendor-chart',
            chunks: 'all',
            priority: 20,
          },
          framework: {
            test: /[\\/]node_modules[\\/](vue|pinia|vue-router|@vue)[\\/]/,
            name: 'vendor-framework',
            chunks: 'all',
            priority: 10,
          },
        },
      },
    },
    performance: isProd
      ? {
          hints: 'error',
          maxAssetSize: 200_000,
          maxEntrypointSize: 300_000,
        }
      : false,
  }
}
