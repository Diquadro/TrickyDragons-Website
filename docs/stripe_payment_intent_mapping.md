# Mapping Completo PaymentIntent → Orders Table

## Analisi dei campi PaymentIntent

Basandoci sulla documentazione ufficiale di Stripe e sui webhook di esempio, ecco tutti i campi del PaymentIntent che dovremmo mappare:

### Campi già presenti nella tabella orders:

- ✅ `id` → `stripe_payment_intent_id`
- ✅ `amount` → `amount_total` (convertito da cents a major units)
- ✅ `currency` → `currency`
- ✅ `status` → `status` (mappato ai nostri enum)
- ✅ `client_secret` → NON NECESSARIO (sensibile, non deve essere persistito)

### Campi mancanti che dovremmo aggiungere:

#### Importi e dettagli finanziari:

- `amount_capturable` → `stripe_amount_capturable` (INTEGER)
- `amount_received` → `stripe_amount_received` (INTEGER)
- `amount_details` → `stripe_amount_details` (JSONB)
- `application_fee_amount` → `stripe_application_fee_amount` (INTEGER, nullable)

#### Metodi di pagamento:

- `automatic_payment_methods` → `stripe_automatic_payment_methods` (JSONB, nullable)
- `payment_method` → `stripe_payment_method_id` (TEXT, nullable)
- `payment_method_types` → `stripe_payment_method_types` (TEXT[])
- `payment_method_options` → `stripe_payment_method_options` (JSONB, nullable)
- `payment_method_configuration_details` → `stripe_payment_method_config_details` (JSONB, nullable)

#### Modalità di cattura e conferma:

- `capture_method` → `stripe_capture_method` (TEXT)
- `confirmation_method` → `stripe_confirmation_method` (TEXT)

#### Annullamenti e errori:

- `canceled_at` → `stripe_canceled_at` (TIMESTAMPTZ, nullable)
- `cancellation_reason` → `stripe_cancellation_reason` (TEXT, nullable)
- `last_payment_error` → `stripe_last_payment_error` (JSONB, nullable)

#### Collegamento a Charge:

- `latest_charge` → `stripe_latest_charge_id` (TEXT, nullable)

#### Informazioni di spedizione:

- `shipping` → `stripe_shipping_details` (JSONB, nullable)

#### Descrizione e ricevute:

- `description` → `stripe_description` (TEXT, nullable)
- `receipt_email` → `stripe_receipt_email` (TEXT, nullable)
- `statement_descriptor` → `stripe_statement_descriptor` (TEXT, nullable)
- `statement_descriptor_suffix` → `stripe_statement_descriptor_suffix` (TEXT, nullable)

#### Setup per futuri pagamenti:

- `setup_future_usage` → `stripe_setup_future_usage` (TEXT, nullable)

#### Collegamento a Customer:

- `customer` → `stripe_customer_id` (TEXT, nullable)

#### Transfer e Connect:

- `transfer_data` → `stripe_transfer_data` (JSONB, nullable)
- `transfer_group` → `stripe_transfer_group` (TEXT, nullable)
- `on_behalf_of` → `stripe_on_behalf_of` (TEXT, nullable)

#### Review e processing:

- `review` → `stripe_review_id` (TEXT, nullable)
- `processing` → `stripe_processing_details` (JSONB, nullable)

#### Azioni successive:

- `next_action` → `stripe_next_action` (JSONB, nullable)

#### Metadati:

- `metadata` → `stripe_metadata` (JSONB)

#### Timestamp Stripe:

- `created` (timestamp Unix) → `stripe_created_at` (TIMESTAMPTZ)

#### Modalità e configurazione:

- `livemode` → `stripe_livemode` (BOOLEAN)

### Campi dell'evento webhook che dobbiamo anche tracciare:

- `event.id` → `stripe_event_id` (TEXT) - per idempotenza
- `event.api_version` → `stripe_api_version` (TEXT)
- `event.type` → `stripe_event_type` (TEXT)

## Priorità di implementazione:

### FASE 1 - Campi essenziali per il tracking completo:

1. `stripe_amount_capturable` - importante per capture parziali
2. `stripe_amount_received` - tracciare quanto effettivamente ricevuto
3. `stripe_latest_charge_id` - collegamento al charge
4. `stripe_canceled_at` e `stripe_cancellation_reason` - per cancellazioni
5. `stripe_last_payment_error` - debugging errori
6. `stripe_customer_id` - collegamento al customer Stripe
7. `stripe_created_at` - timestamp originale Stripe
8. `stripe_event_id` - per idempotenza webhook
9. `stripe_metadata` - metadati custom

### FASE 2 - Campi per funzionalità avanzate:

1. `stripe_shipping_details` - informazioni spedizione
2. `stripe_payment_method_id` e `stripe_payment_method_types`
3. `stripe_capture_method` e `stripe_confirmation_method`
4. `stripe_receipt_email`
5. `stripe_description`

### FASE 3 - Campi per casi edge e Connect:

1. Tutti i campi Connect (`transfer_data`, `application_fee_amount`, etc.)
2. `stripe_review_id` - per review manuali
3. `stripe_next_action` - per azioni che richiedono intervento

### Campi Refund da aggiungere per gestire rimborsi:

- `refund_id` → `refund_id` (TEXT, nullable) - ID del rimborso Stripe
- `refund_amount` → `refund_amount` (INTEGER, nullable) - Importo rimborsato in cents
- `refund_currency` → `refund_currency` (TEXT, nullable) - Valuta del rimborso
- `refund_reason` → `refund_reason` (TEXT, nullable) - Motivo: duplicate, fraudulent, requested_by_customer, expired_uncaptured_charge
- `refund_status` → `refund_status` (TEXT, nullable) - Status: pending, requires_action, succeeded, failed, canceled
- `refund_created_at` → `refund_created_at` (TIMESTAMPTZ, nullable) - Timestamp creazione rimborso
- `refund_metadata` → `refund_metadata` (JSONB, nullable) - Metadati del rimborso
- `refund_description` → `refund_description` (TEXT, nullable) - Descrizione del rimborso
- `refund_failure_reason` → `refund_failure_reason` (TEXT, nullable) - Motivo del fallimento rimborso
- `refund_receipt_number` → `refund_receipt_number` (TEXT, nullable) - Numero ricevuta rimborso

## Raccomandazioni:

1. Iniziare con FASE 1 per avere tracking completo base
2. NON prefissare i campi con `stripe_` - usare nomi descrittivi come `billing_name`
3. Usare JSONB per oggetti complessi (metadata, shipping, error details)
4. Mantenere i timestamp sia Unix (originali Stripe) che TIMESTAMPTZ (nostri)
5. Aggiungere indici sui campi più usati per query (event_id, customer_id, charge_id)
6. Considerare anche i campi Refund per gestire i rimborsi completi
