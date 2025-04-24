# TrickyDragons Website Project Handbook

## Project Overview

TrickyDragons Website is a modern web application that serves as the official website for Tricky Dragons. The project consists of both a client-side website and a server-side API. The website allows visitors to subscribe to a newsletter, navigate through different pages, and interact with various features. The server handles contact management, email dispatching, and event tracking.

## Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: custom SQL using postgres.js
- **Type Generation**: kanel + zod (for PostgreSQL schema to TypeScript)
- **Email**: Nodemailer
- **Validation**: Zod
- **Geo Location**: geoip-lite

### Frontend

- **HTML**: Pug templates
- **CSS**: SASS/SCSS
- **JavaScript**: TypeScript
- **Build Tool**: Webpack
- **Analytics**: Umami
- **Cookie Management**: vanilla-cookieconsent

### Development & Build Tools

- **TypeScript**: For type safety
- **ESBuild**: For server-side code bundling
- **Webpack**: For client-side code bundling
- **Prettier**: For code formatting
- **Concurrently**: For running multiple processes

## Project Structure

The project follows a feature-based architecture with clear separation of concerns:

```
TrickyDragons-Website/
├── .configs/               # Configuration files for build tools
│   ├── .tsconfig/          # TypeScript configurations
│   └── .webpack/           # Webpack configurations
├── .vscode/                # VS Code specific settings
├── docs/                   # Documentation files
├── node_modules/           # Node.js dependencies
├── src/                    # Source code
│   ├── client/             # Client-side code
│   │   ├── components/     # Reusable UI components
│   │   ├── fonts/          # Font files
│   │   ├── imgs/           # Image assets
│   │   ├── layouts/        # Page layout templates
│   │   ├── pages/          # Individual page templates
│   │   ├── robots/         # SEO-related files
│   │   ├── ts/             # TypeScript files for client-side
│   │   ├── site.webmanifest # Progressive Web App manifest
│   │   └── sitemap.xml     # SEO sitemap
│   ├── database/           # Database-related code
│   │   ├── migrations/     # SQL migration files
│   │   └── superuser/      # Database superuser operations
│   ├── server/             # Server-side code
│   │   ├── controllers/    # Request handlers
│   │   ├── middlewares/    # Express middlewares
│   │   ├── models/         # Database access layer
│   │   │   └── operations/ # Reusable database operations
│   │   ├── services/       # Business logic layer
│   │   ├── routes.ts       # API route definitions
│   │   └── server.ts       # Main server entry point
│   └── shared/             # Code shared between client & server
│       ├── constants/      # Shared constants
│       ├── schemas/        # Database schema definitions
│       ├── templates/      # Email templates
│       ├── types/          # TypeScript type definitions
│       ├── utils/          # Utility functions
│       └── validations/    # Request/response validations
├── tools/                  # Build and utility scripts
├── .env                    # Environment configuration
├── .gitignore              # Git ignore rules
├── .kanelrc.js             # Kanel configuration
├── .prettierrc             # Prettier configuration
├── package.json            # NPM dependencies & scripts
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project overview
```

## Installation & Setup

Follow these steps to set up the project locally:

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd TrickyDragons-Website
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following environment variables:

    ```
    # Environment
    NODE_ENV=local

    # Database
    PG_URI=postgres://postgres:your_password@localhost:5432/your_database_name

    # Server
    SERVER_PORT=5000

    # URLs
    CLIENT_URL=http://localhost:5500
    API_URL=http://localhost:5000

    # Email configuration
    # For local development (using Ethereal)
    ETHEREAL_TEST_LOCAL_EMAIL_PASS=your_ethereal_password

    # For development environment
    ZOHO_TEST_DEV_EMAIL_PASS=your_dev_email_password

    # For production
    ZOHO_NO_REPLY_EMAIL_PASS=your_production_email_password

    # GeoIP configuration (only needed for updating GeoIP database)
    # MAXMIND_API_KEY=your_maxmind_api_key
    ```

4. **Set up GeoIP database**

    The application uses MaxMind's GeoIP database for IP geolocation. You need to download the GeoIP data files:

    a. Create a free account at [MaxMind](https://www.maxmind.com/en/geolite2/signup)

    b. Obtain your license key

    c. Create the directory structure:

    ```bash
    mkdir -p .cache/geoip-data
    ```

    d. Download GeoIP data files manually from MaxMind and place them in the `.cache/geoip-data` directory:

    - GeoLite2-City.mmdb (rename to geoip-city.dat)
    - GeoLite2-City-IPv6.mmdb (rename to geoip-city6.dat)
    - GeoLite2-Country.mmdb (rename to geoip-country.dat)
    - GeoLite2-Country-IPv6.mmdb (rename to geoip-country6.dat)

    e. Alternatively, set your MAXMIND_API_KEY in the .env file and use the [geoip-lite](https://github.com/geoip-lite/node-geoip) update script:

    ```bash
    # Uncomment the MAXMIND_API_KEY line in your .env
    # Then run:
    cd node_modules/geoip-lite
    npm run-script updatedb license_key=MAXMIND_API_KEY
    # After download, copy the files to your .cache directory
    cp -r data/* ../../.cache/geoip-data/
    ```

    **Note**: These GeoIP data files need to be updated periodically (approximately once a month) as IP allocations change.

5. **Set up the database**

    - Install PostgreSQL if not already installed
    - Create a new database
    - Run the migrations:
        ```bash
        npm run database:migrate
        ```

6. **Start the development server**

    ```bash
    # Start both client and server concurrently
    npm run watch:local

    # Or start them separately
    # Client (webpack-dev-server)
    npm run watch:local:client
    # Server (with tsx watch)
    npm run watch:local:server
    ```

    The client will be available at http://localhost:5500 and the API server at http://localhost:5000.

## Environment Configuration

The application uses the following environment variables:

- `NODE_ENV`: The environment mode ('local', 'development', 'production')
- `PG_URI`: PostgreSQL connection string
- `SERVER_PORT`: Port for the Express server (default: 5000)
- `CLIENT_URL`: URL for the client application (default: http://localhost:5500)
- `API_URL`: URL for the API server (default: http://localhost:5000)
- `ZOHO_NO_REPLY_EMAIL_PASS`: Password for production email sending
- `ZOHO_TEST_DEV_EMAIL_PASS`: Password for development email sending
- `ETHEREAL_TEST_LOCAL_EMAIL_PASS`: Password for local email testing
- `MAXMIND_API_KEY`: API key for updating GeoIP database (optional)

## Core Concepts and Logic

### Architecture Overview

The application follows a layered architecture:

1. **Client Layer**: Built with Pug, SCSS, and TypeScript, compiled with Webpack.
2. **Server Layer**: Built with Express.js and TypeScript, using a model-service-controller pattern.
3. **Database Layer**: PostgreSQL with migration-based schema management.

### Key Components:

#### Server-side:

- **Controllers**: Handle HTTP requests and responses (e.g., `Subscribe_Contact_Controller`)
- **Services**: Implement business logic (e.g., `Contacts_Service`)
- **Models**: Manage database access (e.g., `postgres_client.ts`)
- **Middlewares**: Handle cross-cutting concerns like authentication, logging, etc.

#### Client-side:

- **Pages**: Pug templates for each page
- **Components**: Reusable UI components
- **RPC Client**: Manages API communication with the server

### Data Flow

1. **Client Request**: The client sends a request to the server (e.g., subscribe to newsletter)
2. **Server Processing**:
    - Request is validated using Zod schemas
    - Controller delegates to appropriate service
    - Service performs business logic and database operations
    - Events are logged for tracking
    - Response is formatted and returned
3. **Client Response**: Client processes the response and updates UI accordingly

### Event Tracking

The application uses a comprehensive event tracking system:

- Each significant action generates an event
- Events are stored in the database
- Events include information about the user, location (if available), action type, and result

### Email System

The application includes an email system for:

- Sending welcome emails to new subscribers
- Future newsletter distribution
- Email templates are stored in the shared/templates directory

The system uses different email providers based on the environment:

- Local: Ethereal (fake SMTP service for testing)
- Development: Zoho test account
- Production: Zoho production account

### GeoIP System

The application uses MaxMind's GeoIP database to identify users' geographical location based on their IP address:

1. **How it works**:

    - The `geo_info_middleware` extracts IP addresses from incoming requests
    - It uses geoip-lite to look up geographical information
    - The data is added to the request object as `req.geo_infos`
    - This information is used for address creation and event tracking

2. **Data structure**:

    - `country`: The country name
    - `region`: State or region name
    - `city`: City name
    - `timezone`: Timezone

3. **Maintenance**:
    - GeoIP data needs to be manually updated periodically (monthly recommended)
    - Data files are stored in `.cache/geoip-data/`
    - During the build process, these files are copied to the appropriate location

## Middlewares

The application uses several middlewares to handle cross-cutting concerns:

1. **Morgan**:

    - Provides HTTP request logging
    - Configured in `morgan.ts`

2. **CORS**:

    - Manages Cross-Origin Resource Sharing
    - Configured in `cors.ts`

3. **Rate Limiting**:

    - Protects against abuse by limiting request frequency
    - Configured in `rate_limiter.ts`
    - Default: 100 requests per 15 minutes per IP

4. **Bot Detection**:

    - Blocks known bot user agents
    - Configured in `block_bots.ts`
    - Uses 'isbot' package to identify bots

5. **GeoIP**:

    - Provides geographical information based on IP
    - Configured in `geo_infos.ts`
    - Stores location data in request.geo_infos

6. **Request IP**:

    - Extracts and normalizes client IP addresses
    - Configured in `request_ip.ts`

7. **Error Handler**:
    - Catches and formats errors
    - Configured in `error_handler.ts`
    - Returns standardized error responses

The order of middleware application is important and defined in `middlewares.ts`:

1. Logging (Morgan) - first to log all requests
2. Security (Block bots, Rate limiting, CORS) - early in the chain
3. Request parsing (Express JSON)
4. Request enrichment (IP extraction, GeoIP)
5. Error handling - last to catch all errors

## Client-Side Structure

### Pages Configuration

The client-side pages are configured in `.configs/.webpack/pages.config.mjs`. This file defines:

1. **Page Routes**:

    - Each page entry maps to a URL route
    - The landing page (index.html)
    - Utility pages (privacy policy, terms, etc.)
    - Error pages (404)

2. **Metadata**:

    - Page title
    - SEO description
    - Keywords
    - Robots directives

3. **Template Source**:
    - Each page uses a specific Pug template
    - Templates are located in `src/client/pages/[page_name]/`

When adding a new page, you need to define its configuration in this file to make it available in the application.

### Component Categories

The client components are organized by functionality:

1. **Layout Components**:

    - `headers_common`: Common header elements
    - `headers_dynamic`: Dynamic header elements
    - `footer`: Page footer

2. **Content Components**:

    - `hero`: Main banner sections
    - `feature_x1`: Single column feature blocks
    - `feature_x2`: Two column feature blocks
    - `cta`: Call to action elements

3. **Interactive Components**:

    - `cta_modal`: Modal dialogs for calls to action
    - `spinner`: Loading indicators
    - `error_toast`: Error notification displays
    - `send_email`: Email form components
    - `redirect_link`: Link tracking components

4. **Third-party Integrations**:
    - `umami`: Analytics integration
    - `cookie_consent`: Cookie consent management
    - `cookie_meta_pixel`: Meta Pixel integration

### RPC Communication

The client communicates with the server through a simple RPC-style interface defined in `src/client/ts/rpc.ts`. This provides:

1. **Type-safe API calls**: All requests and responses are validated against Zod schemas
2. **Unified error handling**: Consistent approach to handling API errors
3. **Environment awareness**: Adapts endpoint URLs based on the environment

Example usage:

```typescript
import { RPC } from '@client/ts/rpc'

// In an event handler
async function handleSubscribe(email) {
    try {
        const response = await RPC.subscribe_contacts({
            email,
            subscription: 'newsletter',
        })
        // Handle successful response
    } catch (error) {
        // Handle error
    }
}
```

## Build System

The application uses a sophisticated build system with separate configurations for development and production:

### Client Build

1. **Development**:

    ```bash
    npm run dev:client:build
    ```

    Uses `.configs/.webpack/webpack.dev.mjs` with:

    - Source maps enabled
    - Minimal optimization
    - Hot module replacement

2. **Production**:
    ```bash
    npm run prod:client:build
    ```
    Uses `.configs/.webpack/webpack.prod.mjs` with:
    - Full optimization and minification
    - Cache busting via content hashing
    - Critical CSS extraction

### Server Build

1. **Development**:

    ```bash
    npm run dev:server:build
    ```

    Uses `tools/build_server.mjs` with:

    - Source maps enabled
    - Development configuration
    - Minimal optimization

2. **Production**:
    ```bash
    npm run prod:server:build
    ```
    Uses the same script with:
    - Full optimization
    - Production configuration
    - No source maps

### Build Process Internals

The build process includes several key steps:

1. **Clean**: Remove previous build artifacts
2. **Compile**: Process TypeScript, SASS, and Pug files
3. **Bundle**: Combine files and dependencies
4. **Optimize**: Minify and compress for production
5. **Copy Assets**: Transfer static files
6. **Copy GeoIP data**: Transfer GeoIP database files from `.cache/geoip-data/` to the server bundle

### Watch Mode

During development, you can use watch mode to automatically rebuild on changes:

```bash
npm run watch:local
```

This runs both client and server in watch mode concurrently.

### Critical CSS

The build process includes an optimization step that extracts critical CSS:

```bash
node tools/critical_css.mjs
```

This identifies and inlines the CSS required for above-the-fold content, improving initial page load performance.

## Database Structure

The database consists of several key tables:

### 1. Contacts

Stores information about users and leads:

- `uuid`: Primary key
- `email`: User's email address
- `status`: Status in the sales funnel ('lead', 'prospect', 'customer')
- `subscriptions`: Array of subscription types
- `sent_emails`: List of emails sent to the contact
- Audit fields: `created_by`, `created_date`, `updated_by`, `updated_date`, `deleted_by`, `deleted_date`

### 2. Addresses

Stores geographical information derived from IP addresses:

- `uuid`: Primary key
- `city`, `region`, `country`: Location information
- Audit fields: `created_by`, `created_date`, `updated_by`, `updated_date`, `deleted_by`, `deleted_date`

### 3. Events

Tracks all system events for analytics and debugging:

- `uuid`: Primary key
- `contact_uuid`: Reference to contacts table (nullable for anonymous events)
- `address_uuid`: Reference to addresses table
- `origin`: Where the event originated
- `action`: What action was performed
- `outcome`: Result of the action ('success' or 'failure')
- `details`: Additional event information
- `occurred_at`: When the event occurred
- Audit fields: `created_by`, `created_date`, `updated_by`, `updated_date`, `deleted_by`, `deleted_date`

### Database Migrations

The database schema is managed through migrations in the `src/database/migrations` directory. Each migration is numbered sequentially and applied in order. Migrations are run using:

```bash
npm run database:migrate
```

## Database Migrations System

The project uses a custom migration system built on top of postgres.js to manage database schema changes. This ensures that:

1. All database changes are tracked in version control
2. Changes are applied consistently across all environments
3. Developers can roll back changes if needed

### Migration File Structure

Each migration file is stored in the `src/database/migrations` directory with a naming convention of:

```
00001_descriptive_name.sql
```

Where:

- `00001` is a sequential number (with leading zeros)
- `descriptive_name` is a brief description of what the migration does

### Creating a New Migration

To create a new migration:

1. Create a new SQL file in the `src/database/migrations` directory
2. Name it with the next sequential number and a descriptive name
3. Write SQL statements for the schema changes

Example migration file:

```sql
-- 00012_add_new_column_to_contacts.sql

ALTER TABLE contacts
ADD COLUMN new_column TEXT;

COMMENT ON COLUMN contacts.new_column IS 'Description of the new column';
```

### Running Migrations

Migrations are automatically tracked in a `migrations` table in the database. To run migrations:

```bash
npm run database:migrate
```

This will:

1. Check which migrations have already been applied
2. Run any new migrations in sequential order
3. Update the migrations table with newly applied migrations

### Best Practices for Migrations

1. Never modify an existing migration that has been committed
2. Always create a new migration for schema changes
3. Include both the change and any necessary data transformations
4. Add comments to tables and columns for better documentation
5. Consider backward compatibility when making changes

## How to Add Features

### Adding a New API Endpoint

1. **Create Validation Schemas**: Define request/response validation schemas in `src/shared/validations/`
2. **Create a Controller**: Add a new controller in `src/server/controllers/`
3. **Create a Service**: Implement business logic in `src/server/services/`
4. **Update Routes**: Add the new endpoint to `src/server/routes.ts`
5. **Add Client Integration**: Implement client-side code in `src/client/ts/rpc.ts`

### Adding a New Page

1. **Create Page Template**: Add a new Pug template in `src/client/pages/`
2. **Update Webpack Config**: Add the new page to `.configs/.webpack/pages.config.mjs`
3. **Add Components**: Create or reuse components for the page in `src/client/components/`
4. **Add Styles**: Create SCSS files for the new page
5. **Update Sitemap**: Add the new page to `src/client/sitemap.xml`

### Best Practices

1. **Type Safety**: Always define TypeScript types for all data structures
2. **Validation**: Always validate input/output data using Zod schemas
3. **Error Handling**: Use the `try_catch` utility for consistent error handling
4. **Event Logging**: Log important events for analytics and debugging
5. **Code Organization**: Follow the existing patterns and directory structure

## Deployment

The application is deployed on Render.com.

### Local Development Deployment

1. Build the client:

    ```bash
    npm run dev:client:build
    ```

2. Build the server:

    ```bash
    npm run dev:server:build
    ```

3. Start the server:
    ```bash
    npm run dev:server:start
    ```

### Production Deployment

1. Build the client:

    ```bash
    npm run prod:client:build
    ```

2. Build the server:

    ```bash
    npm run prod:server:build
    ```

3. Start the server:
    ```bash
    npm run prod:server:start
    ```

## Testing

Currently, the project does not have formal testing infrastructure. This is an area for future improvement.

### Manual Testing

Manual testing is essential before each deployment. Here's a comprehensive testing checklist:

1. **User Experience Testing**:

    - Test responsive layout on multiple device sizes (mobile, tablet, desktop)
    - Ensure all navigation links work correctly
    - Verify that all interactive elements respond appropriately
    - Test accessibility features (keyboard navigation, screen reader compatibility)

2. **Newsletter Subscription Flow**:

    - Submit the newsletter form with valid and invalid email addresses
    - Verify validation messages appear correctly
    - Confirm successful subscription shows appropriate success message
    - Check that duplicate subscription attempts are handled properly
    - Verify the welcome email is received after new subscriptions

3. **Backend API Testing**:

    - Test each API endpoint with valid and invalid inputs
    - Verify rate limiting works correctly
    - Check error responses for proper formatting and helpful messages
    - Test CORS settings with different origins

4. **Database Verification**:

    - Verify new records are created correctly in the database
    - Check that relationships between tables work as expected
    - Verify that events are properly logged for key actions

5. **Email System Testing**:

    - Test welcome emails are properly formatted and received
    - Verify email tracking works correctly
    - Test email templates with various data inputs

6. **Performance Testing**:

    - Test page load times for all key pages
    - Verify that large operations don't block the main thread
    - Check memory usage during operation

7. **Security Testing**:
    - Verify that inputs are properly sanitized
    - Check that sensitive information is not exposed in logs or responses
    - Test rate limiting and bot detection features

## Common Pitfalls & Known Issues

1. **Environment Configuration**: Ensure all environment variables are properly set, especially for email services.

2. **Database Connection**: The database connection string must be properly formatted in the `PG_URI` environment variable.

3. **Email Testing**: When testing email functionality locally, use Ethereal for capturing emails instead of sending real emails.

4. **Type Generation**: After modifying database schema, remember to regenerate types:

    ```bash
    npx kanel
    ```

5. **GeoIP Database**:

    - If geolocation doesn't work, check if the GeoIP data files are present in `.cache/geoip-data/`
    - Remember to update these files periodically for accurate results
    - The build will fail if the GeoIP data files are missing

6. **Webpack Configuration**:

    - When adding new pages, they must be added to `.configs/.webpack/pages.config.mjs`
    - Adding new static assets may require updates to the webpack configuration

7. **Development vs Production**:

    - Some features behave differently between environments
    - Email sending uses different providers based on NODE_ENV
    - API endpoints may have different URLs based on environment variables

8. **npm Scripts**:
    - The project uses several npm scripts for different tasks
    - Use `npm run watch:local` during development
    - For deployment, use the build scripts followed by the appropriate start script
    - Remember to run `npx kanel` after database changes

## Code Style & Conventions

The project follows specific coding conventions:

1. **File Naming**:

    - Server-side files use snake_case (e.g., `error_handler.ts`)
    - Classes use Pascal_Case (e.g., `Subscribe_Contact_Controller`)
    - Interfaces and types use Pascal_Case
    - Constants are in SCREAMING_SNAKE_CASE (e.g., `HTTP_STATUS`, `CONTACT_RESPONSE_OUTCOME`)
    - Configuration files use kebab-case (e.g., `tsconfig.json`, `webpack.dev.mjs`)
    - Validation schemas use snake_case (e.g., `subscribe_contacts_request_schema`)
    - Utility functions use snake_case (e.g., `try_catch`, `create_error`)
    - Custom error classes use snake_case (e.g., `app_error`, `validation_error`)

2. **Code Formatting**: The project uses Prettier for code formatting with configuration in `.prettierrc`.

3. **TypeScript**: Strong typing is encouraged throughout the codebase.

4. **Database Schema**: Clear comments are required for all database columns.

5. **Function/Method Naming**:

    - Service methods use verb-noun format (e.g., `subscribe`, `find_by_email`)
    - Controller methods often use HTTP method names (e.g., `http`)
    - Utility functions use descriptive action names (e.g., `try_catch`, `create_error`)

6. **Component Structure**:

    - Each component has its own directory
    - Component styles are colocated with the component
    - Common components are reused across multiple pages

7. **Import Organization**:
    - Imports are grouped by source: external libraries first, then internal modules
    - Internal imports use path aliases (e.g., `@shared`, `@server`)

## Contacts & Ownership

This project is maintained by Daniele 'Diquadro' D'Ambrosio.

## Future Improvements

As noted in the TODO.md file, some planned improvements include:

1. **Configuration Management**: Implement configuration management with Zod
2. **Request Validation Middleware**: Create a reusable middleware for request validation
3. **Better Error Handling**: Improve error handling throughout the application
4. **Logging Services**: Implement better logging solutions
5. **Meta API Conversion**: Integration with Meta API
6. **Public Folder**: Reorganize static assets into a public folder
7. **Schema Validation**: Implement schema validation for database operations

Opportunità di miglioramento:

1. **Testing**: Manca un framework di test formale. L'implementazione di test unitari e di integrazione sarebbe una priorità.

2. **Gestione della configurazione**: Implementare la gestione centralizzata della configurazione con Zod come indicato nei TODO.

3. **Documentazione API**: Potrebbe beneficiare di documentazione API automatica con strumenti come Swagger/OpenAPI.

4. **Standardizzazione delle convenzioni di codice**: Sebbene ci siano convenzioni di nomenclatura, in alcuni casi non sono applicate in modo coerente. Un linter configurato potrebbe aiutare.

5. **Logging centralizzato**: Implementare un sistema di logging strutturato e centralizzato.

Nel complesso, il codice è ben organizzato e segue buone pratiche di sviluppo, fornendo una base solida per futuri miglioramenti e funzionalità aggiuntive.
