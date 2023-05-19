const path = require('path')
const webpack = require('webpack')
const fs = require('fs')

/**
 * Folder to place packed files in
 */
const outFolder = path.resolve(
    __dirname,
    'src/FileCabinet/SuiteApps/com.netsuite.wtznssuiteqlreporter/SuiteScripts/'
)

/**
 * Add All Entry point scripts here, the key will be used for output filename.
 */
const entries = {
    'models/customrecord_wtz_suiteql_report/userevent/wtz-ue-suiteql-report-hooks':
        './src/TypeScript/models/customrecord_wtz_suiteql_report/userevent/wtz-ue-suiteql-report-hooks.ts',
    'scripts/wtz-suiteql-reporter-api':
        './src/TypeScript/scripts/wtz-sl-suiteql-reporter-api.ts',
}

/**
 * Add Aliases below and in tsconfig.json paths. Ensure to use absolute path or path.resolve(__dirname,<RELATIVE PATH>)
 */
const aliases = {
    helpers: path.resolve(__dirname, 'src/TypeScript/helpers'),
    definitions: path.resolve(__dirname, 'src/TypeScript/definitions'),
    services: path.resolve(__dirname, 'src/TypeScript/services'),
}

/**
 * This reads the deploy.xml and gets all the .js files that we want to deploy
 * and then filters the entries-list above to only build the relevant .js-files
 */
const lineArray = fs.readFileSync('./src/deploy.xml').toString().split("\n");
const jsFilesToDeploy = lineArray.filter(lineText => lineText.includes('.js')).map(lineText => (/\/SuiteScripts\/(.*)[.]js/).exec(lineText)[1])
console.log('JS-files in the deploy.xml', jsFilesToDeploy)
const entriesToDeploy = Object.entries(entries).reduce((filteredList, entry) => {
  if(jsFilesToDeploy.includes(entry[0])) {
    filteredList[entry[0]] = entry[1]
  }
  return filteredList
},{})
console.log('Matching entries in Webpack.config.js', entriesToDeploy)


/**
 * Main Webpack Configuration, change with care
 */
module.exports = {
    entry: entries,
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: '/node_modules/',
            },
        ],
    },
    optimization: {
        minimize: false,
        moduleIds: 'named',
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: aliases,
    },
    plugins: [
        // Copy the SuiteScript JSDoc to the top of the script
        new webpack.BannerPlugin({
            banner: (data) => {
                const filename = data.chunk.entryModule.resource
                const contents = fs.readFileSync(filename, 'UTF-8')
                const comments = contents.match(/\/\*[\s\S]*?\*\//)
                return (comments && comments.length) ? comments[0] : ''
            },
            raw: true,
        }),
    ],
    output: {
        path: outFolder,
        filename: '[name].js',
        libraryTarget: 'amd',
    },
    externals: [/^N\//],
}
