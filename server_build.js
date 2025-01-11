import fs from 'fs-extra'
import path from 'path'

async function cloneFolder(sourceDir, targetDir) {
    try {
        // Step 1: Elimina la cartella di destinazione (se esiste)
        if (await fs.pathExists(targetDir)) {
            console.log(`Deleting folder: ${targetDir}`)
            await fs.remove(targetDir)
            console.log(`Folder deleted: ${targetDir}`)
        }

        // Step 2: Clona la cartella sorgente nella destinazione
        console.log(`Cloning folder from ${sourceDir} to ${targetDir}`)
        await fs.copy(sourceDir, targetDir)
        console.log(`Folder cloned to: ${targetDir}`)
    } catch (error) {
        console.error('Error during folder cloning:', error)
    }
}

// Esempio: Specifica la cartella sorgente e la destinazione
const sourceDir = path.resolve('./src/server') // Cambia il path
const targetDir = path.resolve('./dist/server') // Cambia il path

cloneFolder(sourceDir, targetDir)
