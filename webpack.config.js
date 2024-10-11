// webpack.config.js

const path = require('path');
const nodeExternals = require('webpack-node-externals');

const createConfig = (outputFormat) => ({
  mode: 'production', // Use 'development' for non-minified output and better debugging
  entry: './src/index.ts', // Adjust if your entry point is different
  target: 'web', // 'web' for client, 'node' for server
  externals: [nodeExternals()], // Exclude node_modules from the bundle for server builds
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: `index.${outputFormat}.js`,
    library: {
      type: outputFormat === 'esm' ? 'module' : 'commonjs2',
    },
    // For ES Modules, enable module output
    ...(outputFormat === 'esm' && { module: true }),
    clean: false, // Clean the output directory before emit
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/, // Matches .ts and .tsx files
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  devtool: 'source-map', // Generates source maps for easier debugging
  experiments: {
    outputModule: outputFormat === 'esm', // Enable module output for ESM
  },
  // Optional: Define environment-specific settings
  // You can customize further based on outputFormat or target
});

module.exports = [// CommonJS Build for Node.js
  createConfig('esm'), // ES Module Build for modern bundlers
];
