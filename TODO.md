LIST
[x] rimuovre file sensibili dallo storico
[x] Sistemare il layuot shift causato dal font
[X] Cambiare SERVER*PORT to PORT
[X] Rivedere le routes dell'api e valutare se usare una stategia RPC al posto di REST
[X] FIX - Subscription error handling in frontend
[X] Umami Events
[X] Umamni Events link clicks
[X] Meta API Conversion
[X] Appsmith
[] Schemalint -> https://github.com/kristiandupont/schemalint
[X] Better error handling
[] Configuration menagment with zod
[] BETTER Logging Services (EXTERNAL)
[X] Request Validation Middleware
[X] Better organization for the middlewares
[X] Mettere un autonumber sulle colonne è utile per il debuging
[] Utilizzare una cartella public per gli assets così da non copiarli (Emails, Imgs)
[X] Aggiunti gli indirizzi email al .env per migliore usabilità per più sviluppatori
[-] Vedere di mettere l'api sullo stesso dominio /api -> NO, perchè render non me lo fa fare
[X] Tracking UTM su umami
[-] Query caching - NOPE
[] // Remove null values to avoid database issues
const clean_event = Object.fromEntries(
Object.entries(analytics_event).filter(([*, value]) => value !== null && value !== undefined),
)
[X] Aggiungere il local time alla tabelle Action e Anylitcs Events
[] Togliere la gestione dell'url in BASE 64 e mettere i dati in chiaro ma hasharli
[X] Inviare gli short code per country e region a meta
[X] Miglioramento degli eventi di analytics

[X] SES_LINK branded link seslink.trickydragons.com
[] API on same origin

[] Per la gestione degli eventi di stripe verificare la data dell'evento... Perchè gli ordini possono fallire ma le persone posso ritentare e pagere

UTM TEST PARAMS -> ?utm_source=WEB_TEST&utm_medium=M_TEST&utm_campaign=C_TEST&utm_term=T_TEST&utm_content=CON_TEST&utm_id=ID_TEST

MAYBE

- SHORTLINK
- RINOMINARE CONTROLLER IN ADAPTER
- INSERIRE/GESTIRE TUTTE LE RISPOSTE AL FRONT END NELL'ADAPTER

CONFIGURATIONS MANAGMENT
// src/shared/config/index.ts
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config({ path: ['/etc/secrets/.env', '.env'] });

const configSchema = z.object({
nodeEnv: z.enum(['development', 'test', 'production']).default('development'),
port: z.coerce.number().default(3000),
pgUri: z.string(),
// Add other config values
});

const config = {
appEnv: process.env.APP_ENV,
port: process.env.PORT,
pgUri: process.env.PG_URI,
// Add other config values
};

export const validatedConfig = configSchema.parse(config);

REQUEST VALIDATION MIDDLEWARE
// src/server/middlewares/validation.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { HTTP_STATUS } from '@shared/constants/app.constants';

export function validateRequest(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
return (req: Request, res: Response, next: NextFunction) => {
const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'Validation failed',
        details: result.error.format()
      });
    }

    // Replace the request data with the validated (and transformed) data
    req[source] = result.data;
    next();

};
}

// Usage in routes
// app.post(
// API.ENDPOINTS.CONTACTS.SUBSCRIBE,
// validateRequest(subscribe_contacts_request_schema),
// Contacts_Controller.subscribe
// );
