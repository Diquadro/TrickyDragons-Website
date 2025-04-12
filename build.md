DEV

BUILD CLIENT
Build Filters "src/client/\*\*"
Build Command run script "npm run dev:client:build"
Publish Directory "./dev/client"

BUILD SERVER
Run script "npm run dev:server:build"

Download node ./node_modules/geoip-lite/scripts/updatedb.js license_key=YOUR_LICENSE_KEY
Copy the files just dowloaded from ./node_modules/geoip-lite/data into .cache/geoip-data

Aggiungere alle enviroment di render GEOTMPDIR=.cache/geoip-data perchè se no nun lo trova
Perchè ho cambiato la gestione inserisc un file in render

Build Filters "src/server/\*\*" "src/database/\*\*"
Build Command run script "npm install && npm run database:migrate && npm run dev:server:build"
Start Command "yarn run dist:server:start"

BUILD DB
Run script "database:migrate"
