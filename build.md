BUILD CLIENT
Run script "npm run dist:client:build"

BUILD SERVER
Run script "npm run dist:server:build"

Download node ./node_modules/geoip-lite/scripts/updatedb.js license_key=YOUR_LICENSE_KEY
Copy the files just dowloaded from ./node_modules/geoip-lite/data into .cache/geoip-data

Aggiungere alle enviroment di render GEOTMPDIR=.cache/geoip-data perchè se no nun lo trova
Perchè ho cambiato la gestione inserisc un file in render

BUILD DB
Run script "node tools/migrations.js"
