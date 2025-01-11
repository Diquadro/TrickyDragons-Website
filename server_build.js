import fs from 'fs-extra'
import path from 'path'

// run script
run()

async function clone_folder(source_dir, target_dir) {
    try {
        // Step 1: Delete target dir if exist
        if (await fs.pathExists(target_dir)) {
            console.log(`Deleting folder: ${target_dir}`)
            await fs.remove(target_dir)
            console.log(`Folder deleted: ${target_dir}`)
        }

        // Step 2: Clone soruce into target
        console.log(`Cloning folder from ${source_dir} to ${target_dir}`)
        await fs.copy(source_dir, target_dir)
        console.log(`Folder cloned to: ${target_dir}`)
    } catch (error) {
        console.error('Error during folder cloning:', error)
    }
}

async function run() {
    try {
        // Clone server in dist
        const server_source_dir = path.resolve('./src/server')
        const server_target_dir = path.resolve('./dist/server')

        await clone_folder(server_source_dir, server_target_dir)

        // Clone geoip-data into ./node_modules/geoip-lite/data
        const geoip_source_dir = path.resolve('./.cache/geoip-data')
        const geoip_target_dir = path.resolve('./node_modules/geoip-lite/data')

        await clone_folder(geoip_source_dir, geoip_target_dir)
    } catch (error) {
        console.log('server_build error : ', error.error)
    }
}
