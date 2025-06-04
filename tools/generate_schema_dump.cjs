const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const { promisify } = require('util')
require('dotenv').config()

const execAsync = promisify(exec)

async function create_dbml_schema_dump() {
    try {
        // Check if PG_URI exists in environment
        const connection_string = process.env.PG_URI
        if (!connection_string) {
            console.error('Error: PG_URI not found in environment variables')
            process.exit(1)
        }

        // Create docs/pg_schema_dumps directory if it doesn't exist
        const dump_dir = path.join('docs', 'pg_schema_dumps')
        if (!fs.existsSync(dump_dir)) {
            fs.mkdirSync(dump_dir, { recursive: true })
            console.log(`Created directory: ${dump_dir}`)
        }

        // Get today's date in YYYY-MM-DD format
        const today = new Date()
        const date_string = today.toISOString().split('T')[0]

        // Find the next version number
        const existing_files = fs.readdirSync(dump_dir)
        const today_files = existing_files.filter(
            (file) => file.startsWith(date_string) && file.endsWith('.dbml'),
        )

        let version_number = 1
        if (today_files.length > 0) {
            const version_numbers = today_files.map((file) => {
                const match = file.match(/-(\d{4})\.dbml$/)
                return match ? parseInt(match[1]) : 0
            })
            version_number = Math.max(...version_numbers) + 1
        }

        const version_string = version_number.toString().padStart(4, '0')

        // Create filename
        const filename = `${date_string}-pg_schema_dump-${version_string}.dbml`
        const file_path = path.join(dump_dir, filename)

        console.log(`Generating DBML schema dump: ${filename}`)
        console.log('Connecting to database...')

        // Execute db2dbml command
        const db2dbml_command = `db2dbml postgres "${connection_string}" -o "${file_path}"`
        await execAsync(db2dbml_command)

        // Verify file was created
        if (!fs.existsSync(file_path)) {
            throw new Error('DBML file was not created successfully')
        }

        // Read the generated DBML file and add metadata header
        const dbml_content = fs.readFileSync(file_path, 'utf8')

        // Parse connection string for metadata
        const url = new URL(connection_string)
        const db_name = url.pathname.slice(1) // Remove leading '/'
        const host_info = `${url.hostname}:${url.port || 5432}`

        // Add header with metadata
        const header = `
            // PostgreSQL to DBML Schema Dump
            // Generated on: ${new Date().toISOString()}
            // Database: ${db_name}
            // Host: ${host_info}
            // Version: ${version_string}
            // 
            // Generated using db2dbml tool
            // This DBML file includes all tables, relationships, and constraints
            // Compatible with dbdiagram.io and other DBML tools
            //
        `

        const final_dbml = header + dbml_content
        fs.writeFileSync(file_path, final_dbml)

        console.log(`✅ DBML schema dump created successfully: ${file_path}`)
        console.log(`📊 File size: ${(fs.statSync(file_path).size / 1024).toFixed(2)} KB`)
        console.log(`🔗 View online: Upload to https://dbdiagram.io/`)
    } catch (error) {
        console.error('❌ Error creating DBML schema dump:', error.message)

        // Provide helpful suggestions
        if (error.message.includes('db2dbml')) {
            console.error('\n💡 Suggestion: Install db2dbml globally:')
            console.error('   npm install -g @dbml/cli')
        }

        if (error.message.includes('connection') || error.message.includes('database')) {
            console.error('\n💡 Check your PG_URI in .env file')
            console.error('   Format: postgresql://user:password@host:port/database')
        }

        process.exit(1)
    }
}

// Run the script
if (require.main === module) {
    create_dbml_schema_dump()
}

module.exports = { create_dbml_schema_dump }
