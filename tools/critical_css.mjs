// tools/critical_css.js

// Load environment variables from one of the possible .env locations
import dotenv from 'dotenv'
dotenv.config({ path: ['/etc/secrets/.env', '.env'] })

import Beasties from 'beasties'
import fg from 'fast-glob'
import fs from 'fs/promises'
import path from 'path'

const isProduction = (process.env.APP_ENV || process.env.NODE_ENV) === 'production'
const CLIENT_DIR = isProduction ? 'prod/client' : 'dev/client'

const NONCE = 'beasties-critical-css-001'

async function run() {
    const htmlFiles = await fg(`${CLIENT_DIR}/**/*.html`, { dot: true })

    const beasties = new Beasties({
        path: CLIENT_DIR,
        publicPath: '',
        preload: 'js',
    })

    for (const file of htmlFiles) {
        const html = await fs.readFile(file, 'utf-8')
        let processed = await beasties.process(html)

        processed = processed.replace(/<style[^>]*>/g, (tag) => {
            // Se contiene già un nonce, non modifichiamo nulla
            if (tag.includes('nonce=')) return tag

            // Aggiungiamo il nonce prima della chiusura del tag
            return tag.replace(/>$/, ` nonce="${NONCE}">`)
        })

        processed = processed.replace(/<script[^>]+>/g, (match) => {
            // Only apply nonce if:
            // 1. It has a data-href attribute (Beastie script)
            // 2. It does NOT already have a nonce
            // 3. It does NOT have a src attribute (must be inline)
            if (match.includes('data-href=') && !match.includes('nonce=') && !match.includes('src=')) {
                return match.replace(/>$/, ` nonce="beasties-critical-css-001">`)
            }
            return match
        })

        // Ricrea il path relativo all'interno dell'output
        const relativePath = path.relative(CLIENT_DIR, file)
        const outputPath = path.join(CLIENT_DIR, relativePath)

        // Assicura che la cartella esista
        await fs.mkdir(path.dirname(outputPath), { recursive: true })

        // Scrive il file HTML trasformato
        await fs.writeFile(outputPath, processed, 'utf-8')
    }
}

run().catch((err) => {
    console.error('❌ Failed to extract critical CSS:', err)
    process.exit(1)
})
