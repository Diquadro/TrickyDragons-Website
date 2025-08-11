// .kanelrc.js in CommonJS
const dotenv = require('dotenv')
dotenv.config({ path: ['/etc/secrets/.env', '.env'] })

const { generateZodSchemas } = require('kanel-zod')

module.exports = {
    connection: {
        connectionString: process.env.PG_URI,
        ssl: process.env.APP_ENV !== 'local',
    },

    preTransformCase: false,
    preDeleteOutputFolder: true,
    outputPath: './src/shared/schemas/database',

    preRenderHooks: [generateZodSchemas],
}
