// build_server.js
import { build } from 'esbuild'
import { fileURLToPath } from 'url'
import { dirname, resolve, join } from 'path'
import { nodeExternalsPlugin } from 'esbuild-node-externals'
import { clean } from 'esbuild-plugin-clean'
import fs from 'fs'

// Load environment variables from one of the possible .env locations
import dotenv from 'dotenv'
dotenv.config({ path: ['/etc/secrets/.env', '.env'] })

// Equivalent of __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const isProduction = process.env.NODE_ENV === 'prod'
const outDir = isProduction ? 'prod/server' : 'dev/server'
const outDirPath = resolve(__dirname, '..', outDir)

// Define alias used across the project (matching tsconfig paths)
const aliases = {
    '@client_components': resolve(__dirname, '..', 'src/client/components'),
    '@client_imgs': resolve(__dirname, '..', 'src/client/imgs'),
    '@client_layouts': resolve(__dirname, '..', 'src/client/layouts'),
    '@client_pages': resolve(__dirname, '..', 'src/client/pages'),
    '@client_ts': resolve(__dirname, '..', 'src/client/ts'),
    '@server_controllers': resolve(__dirname, '..', 'src/server/controllers'),
    '@server_emails': resolve(__dirname, '..', 'src/server/emails'),
    '@server_middlewares': resolve(__dirname, '..', 'src/server/middlewares'),
    '@server_models': resolve(__dirname, '..', 'src/server/models'),
    '@server_routes': resolve(__dirname, '..', 'src/server/routes'),
    '@server_services': resolve(__dirname, '..', 'src/server/services'),
    '@server_utils': resolve(__dirname, '..', 'src/server/utils'),
    '@shared': resolve(__dirname, '..', 'src/shared'),
}

// Start logging build mode
console.log(`Starting ${isProduction ? 'production' : 'development'} build...`)

// Build the server bundle with esbuild
build({
    entryPoints: ['src/server/server.ts'],
    bundle: true,
    platform: 'node',
    target: 'es2020',
    outfile: join(outDirPath, 'server.js'),
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
    ],
    tsconfig: './.configs/.tsconfig/tsconfig.server.common.json',
})
    .then(() => {
        console.log(`Build completed successfully: ${join(outDirPath, 'server.js')}`)
    })
    .catch((error) => {
        console.error('Build failed:', error)
        process.exit(1)
    })

// Copy geoip-lite data files into the node_modules folder before runtime
function copyGeoipFiles() {
    const sourceDir = resolve(__dirname, '..', '.cache/geoip-data')
    const targetDir = resolve(__dirname, '..', 'node_modules/geoip-lite/data')

    if (!fs.existsSync(sourceDir)) {
        console.log(`Source geoip directory not found: ${sourceDir}`)
        return
    }

    if (!fs.existsSync(targetDir)) {
        console.log(`Creating target directory: ${targetDir}`)
        fs.mkdirSync(targetDir, { recursive: true })
    }

    const files = fs.readdirSync(sourceDir).filter((file) => fs.statSync(join(sourceDir, file)).isFile())

    if (files.length === 0) {
        console.log('No geoip data files found to copy')
        return
    }

    console.log(`Copying ${files.length} geoip data files...`)
    files.forEach((file) => {
        fs.copyFileSync(join(sourceDir, file), join(targetDir, file))
    })
    console.log('GeoIP data files copied successfully')
}

copyGeoipFiles()
