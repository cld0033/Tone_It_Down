const path = require("path");
const HTMLPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: {
        index: "./src/index.tsx",
        content: './src/content.js', // Entry point for your content script
    },
    mode: "production",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            compilerOptions: { noEmit: false },
                        },
                    },
                ],
                exclude: /node_modules/,
            },
            {
                exclude: /node_modules/,
                test: /\.css$/i,
                use: [
                    "style-loader",
                    "css-loader",
                ],
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg)$/, // Handle all image formats
                type: 'asset/resource', // Use asset/resource for Webpack 5
                generator: {
                    filename: 'images/[name][ext]', // Output directory in the dist folder
                },
            },
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "manifest.json", to: path.resolve(__dirname, "dist") }, 
                { from: "src/background.js", to: path.resolve(__dirname, "dist") },
                { from: "images", to: path.resolve(__dirname, "dist/images") },
            ],
        }),
        new HTMLPlugin({
            title: "React extension",
            filename: `index.html`, // Directly output to dist
            chunks: ["index"], // Ensure this matches your entry point
        }),
    ],
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js",
        clean: true,
    },
};