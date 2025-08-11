// build_server.js
// Load environment variables from one of the possible .env locations
import dotenv from 'dotenv'
dotenv.config({ path: ['/etc/secrets/.env', '.env'] })

import { build } from 'esbuild'
import { fileURLToPath } from 'url'
import { dirname, resolve, join } from 'path'
import { nodeExternalsPlugin } from 'esbuild-node-externals'
import { clean } from 'esbuild-plugin-clean'
import copy from 'esbuild-plugin-copy'

// Equivalent of __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const isProduction = (process.env.APP_ENV || process.env.NODE_ENV) === 'production'
const outDir = isProduction ? 'prod/server' : 'dev/server'
const outDirPath = resolve(__dirname, '..', outDir)

// Define alias used across the project (matching tsconfig paths)
const aliases = {
    '@shared': resolve(__dirname, '..', 'src/shared'),
    '@client': resolve(__dirname, '..', 'src/client'),
    '@server': resolve(__dirname, '..', 'src/server'),
    '@database': resolve(__dirname, '..', 'src/database'),
    '@public': resolve(__dirname, '..', 'public'),
}

// Start logging build mode
console.log(`Starting ${isProduction ? 'production' : 'development'} build...`)

// Build the server bundle with esbuild
build({
    entryPoints: ['src/server/server.ts'],
    bundle: true,
    platform: 'node',
    target: 'es2020',
    outfile: join(outDirPath, 'server.cjs'),
    minify: isProduction,
    sourcemap: !isProduction,
    format: 'cjs',
    banner: {
        // Prepend dotenv.config call at the top of the bundle
        js: `
            const dotenv = require('dotenv');
            dotenv.config({ path: ['/etc/secrets/.env', '.env'] });
        `,
    },
    alias: aliases,
    plugins: [
        clean({
            // Clean previous output files before building
            patterns: [`${outDirPath}/**/*`],
            verbose: true,
        }),
        nodeExternalsPlugin(), // Exclude node_modules from the bundle (keeps bundle small)
        copy({
            assets: [
                {
                    from: 'src/shared/templates/emails/**/*',
                    to: '../shared/templates/emails',
                    keepStructure: true,
                },
                {
                    from: '.cache/geoip-data/**/*',
                    to: resolve(__dirname, '..', 'node_modules/geoip-lite/data'),
                    keepStructure: false,
                },
            ],
            verbose: true,
        }),
    ],
    tsconfig: resolve(__dirname, '..', '.configs/.tsconfig/tsconfig.server.json'),
})
    .then(() => {
        console.log(`Build completed successfully: ${join(outDirPath, 'server.cjs')}`)
    })
    .catch((error) => {
        console.error('Build failed:', error)
        process.exit(1)
    })
