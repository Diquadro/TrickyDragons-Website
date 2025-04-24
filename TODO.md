LIST
[x] rimuovre file sensibili dallo storico
[x] Sistemare il layuot shift causato dal font
[X] Cambiare SERVER_PORT to PORT
[X] Rivedere le routes dell'api e valutare se usare una stategia RPC al posto di REST
[X] FIX - Subscription error handling in frontend
[X] Umami Events
[X] Umamni Events link clicks
[] Meta API Conversion
[WORKING] Budibase
[] Schemalint -> https://github.com/kristiandupont/schemalint
[] Better error handling
[] Configuration menagment with zod
[] BETTER Logging Services (EXTERNAL)
[] Request Validation Middleware
[] Better organization for the middlewares
[] Mettere un autonumber sulle colonne è utile per il debuging
[] Utilizzare una cartella public
[X] Aggiunti gli indirizzi email al .env per migliore usabilità per più sviluppatori

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
nodeEnv: process.env.NODE_ENV,
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
