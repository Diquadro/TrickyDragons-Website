// tools/critical_css.js

// Load environment variables from one of the possible .env locations
import dotenv from 'dotenv'
dotenv.config({ path: ['/etc/secrets/.env', '.env'] })

import Beasties from 'beasties'
import fg from 'fast-glob'
import fs from 'fs/promises'
import path from 'path'

const isProduction = process.env.NODE_ENV === 'prod'
const CLIENT_DIR = isProduction ? 'prod/client' : 'dev/client'

const NONCE = 'critical-css-001'

async function run() {
    const htmlFiles = await fg(`${CLIENT_DIR}/**/*.html`, { dot: true })

    const beasties = new Beasties({
        path: CLIENT_DIR,
        publicPath: '', // oppure '/assets/css' se servito da lì in produzione
        pruneSource: true,
        preload: 'swap',
        compress: true,
        logLevel: 'info',
        transform(style) {
            // Applichiamo il nonce manualmente al tag <style>
            return style.replace('<style>', `<style nonce="${NONCE}">`)
        },
    })

    for (const file of htmlFiles) {
        const html = await fs.readFile(file, 'utf-8')
        const processed = await beasties.process(html)

        // Ricrea il path relativo all'interno dell'output
        const relativePath = path.relative(CLIENT_DIR, file)
        const outputPath = path.join(CLIENT_DIR, relativePath)

        // Assicura che la cartella esista
        await fs.mkdir(path.dirname(outputPath), { recursive: true })

        // Scrive il file HTML trasformato
        await fs.writeFile(outputPath, processed, 'utf-8')

        console.log(`✔ Critical CSS inlined: ${outputPath}`)
    }
}

run().catch((err) => {
    console.error('❌ Failed to extract critical CSS:', err)
    process.exit(1)
})
