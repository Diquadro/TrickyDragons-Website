# TrickyDragons Website Project Handbook

## Table of Contents

1. [Project Overview](#project-overview)
2. [AI Instructions](#ai-instructions)
    - [Understanding the Architecture](#understanding-the-architecture)
    - [Code Modification Guidelines](#code-modification-guidelines)
    - [Architecture Decisions Context](#architecture-decisions-context)
    - [Development Workflow](#development-workflow)
    - [AI Journal Usage](#ai-journal-usage)
    - [Common Misunderstandings to Avoid](#common-misunderstandings-to-avoid)
3. [Tech Stack](#tech-stack)
    - [Backend](#backend)
    - [Frontend](#frontend)
    - [Development & Build Tools](#development--build-tools)
4. [Project Structure](#project-structure)
5. [Installation & Setup](#installation--setup)
6. [Environment Configuration](#environment-configuration)
7. [Core Concepts and Logic](#core-concepts-and-logic)
8. [Middlewares](#middlewares)
9. [Client-Side Structure](#client-side-structure)
    - [Pages Configuration](#pages-configuration)
    - [Component Categories](#component-categories)
    - [Client-Side Analytics](#client-side-analytics)
    - [Client-Server Communication](#client-server-communication)
    - [Error Handling](#error-handling)
10. [Build System](#build-system)
    - [Client Build](#client-build)
    - [Server Build](#server-build)
    - [Build Process Internals](#build-process-internals)
    - [Watch Mode](#watch-mode)
    - [Critical CSS](#critical-css)
11. [Database Structure](#database-structure)
    - [System Tables](#system-tables)
    - [Analytics Tables](#analytics-tables)
12. [Database Migrations System](#database-migrations-system)
    - [Migration File Structure](#migration-file-structure)
    - [Creating a New Migration](#creating-a-new-migration)
    - [Running Migrations](#running-migrations)
    - [Best Practices for Migrations](#best-practices-for-migrations)
13. [How to Add Features](#how-to-add-features)
    - [Adding a New API Endpoint](#adding-a-new-api-endpoint)
    - [Adding Analytics Tracking](#adding-analytics-tracking)
    - [Adding a New Page](#adding-a-new-page)
    - [Adding a New Component](#adding-a-new-component)
    - [Integrating Third-Party Services](#integrating-third-party-services)
    - [Best Practices](#best-practices)
14. [Deployment](#deployment)
    - [Local Development Deployment](#local-development-deployment)
    - [Production Deployment](#production-deployment)
15. [Testing](#testing)
    - [Manual Testing](#manual-testing)
16. [Common Pitfalls & Known Issues](#common-pitfalls--known-issues)
17. [Code Style & Conventions](#code-style--conventions)
18. [Contacts & Ownership](#contacts--ownership)
19. [Future Improvements](#future-improvements)
    - [Immediate Priorities](#immediate-priorities)
    - [Technical Debt & Infrastructure](#technical-debt--infrastructure)
    - [Analytics & Tracking Enhancements](#analytics--tracking-enhancements)
    - [User Experience](#user-experience)
    - [Development Experience](#development-experience)
    - [Security & Compliance](#security--compliance)
    - [Integration & APIs](#integration--apis)
    - [Long-term Vision](#long-term-vision)
    - [Completed Achievements](#completed-achievements)
20. [Analytics & Tracking](#analytics--tracking)
    - [Architecture Overview](#architecture-overview)
    - [Analytics Database Schema](#analytics-database-schema)
    - [Event Types](#event-types)
    - [Client-Side Analytics Implementation](#client-side-analytics-implementation)
    - [Server-Side Analytics API](#server-side-analytics-api)
    - [Device Fingerprinting](#device-fingerprinting)
    - [UTM Parameter Tracking](#utm-parameter-tracking)
    - [Meta Pixel Integration](#meta-pixel-integration)
    - [Privacy & GDPR Compliance](#privacy--gdpr-compliance)
    - [Performance Optimizations](#performance-optimizations)
    - [Analytics Troubleshooting](#analytics-troubleshooting)

## Project Overview

TrickyDragons Website is a modern web application that serves as the official website for Tricky Dragons. The project consists of both a client-side website and a server-side API. The website allows visitors to subscribe to a newsletter, navigate through different pages, and interact with various features. The server handles contact management, email dispatching, event tracking, and comprehensive analytics collection.

## AI Instructions

This section provides specific guidance for AI assistants working with this codebase and handbook.

### Understanding the Architecture

When working with this project, AI assistants should:

1. **Recognize the Analytics-First Design**: This application has a sophisticated analytics system that is central to its architecture. Always consider analytics implications when making suggestions or modifications.

2. **Respect Privacy-First Principles**: All tracking is anonymous and GDPR-compliant. Never suggest modifications that could compromise user privacy or violate these principles.

3. **Understand the Denormalized Analytics Schema**: The `analytics_events` table is intentionally denormalized for performance. Don't suggest normalization - this is a conscious design choice.

4. **Session-Based Tracking Context**: The analytics system uses session-based tracking with visitor fingerprinting. Understand this context when working with user interaction code.

5. **Environment-Aware Development**: Many features behave differently across environments (local, development, production). Always consider environment implications.

### Code Modification Guidelines

When suggesting code changes:

1. **Analytics Integration**: For any user-facing feature, consider if analytics tracking should be added
2. **Type Safety**: Always maintain TypeScript types and Zod validations
3. **Error Handling**: Follow the established error handling patterns
4. **Performance Impact**: Consider the impact on the analytics system and overall performance
5. **Privacy Compliance**: Ensure any new tracking respects cookie consent and privacy settings

### Architecture Decisions Context

Key architectural decisions to understand:

- **Denormalized Analytics**: Chosen for query performance over storage efficiency
- **Anonymous Tracking**: No PII collection by design, not a limitation
- **Session Management**: Client-side session handling for better performance
- **UTM Persistence**: Cross-page UTM tracking for attribution accuracy
- **Meta Integration**: Server-side events for better tracking reliability

### Development Workflow

When working on this project:

1. **Database Changes**: Always create migrations, never suggest direct schema modifications
2. **Analytics Events**: Use the established event tracking patterns
3. **Environment Variables**: Follow the established naming conventions
4. **Build Process**: Understand the dual client/server build system
5. **AI Journal Maintenance**: Document significant changes in `ai_journal.md` (see AI Journal section below)

### AI Journal Usage

**IMPORTANT**: As an AI working on this project, you must maintain the `ai_journal.md` file to track changes for future handbook updates.

#### When to Update AI Journal

Update `ai_journal.md` whenever you:

- Make architectural decisions or suggestions
- Implement new features or components
- Modify database schema or migrations
- Change build processes or configurations
- Add new dependencies or integrations
- Solve complex technical problems
- Make performance optimizations
- Implement security measures

#### How to Update AI Journal

Each entry should include:

```markdown
### [Feature/Change Name]

**Date**: YYYY-MM-DD
**Type**: [Architecture/Feature/Bugfix/Optimization/etc.]

**Changes Made**:

- Specific changes implemented
- Files modified or created
- Commands run or configurations changed

**Reasoning**:

- Why this approach was chosen
- What problem it solves
- Business or technical drivers

**Context**:

- Relevant background information
- Dependencies or requirements
- Constraints or limitations

**Alternatives Considered**:

- Other approaches evaluated
- Why they were rejected
- Trade-offs made

**Future Implications**:

- How this might affect future development
- Potential issues or considerations
- Follow-up tasks needed

**Testing/Verification**:

- How the change was tested
- Expected behavior
- Any issues encountered
```

#### AI Journal Lifecycle

- **During Development**: Continuously updated by AIs working on the project
- **During Handbook Updates**: Consulted to understand recent changes
- **After Handbook Updates**: Can be archived and reset for the next cycle

**Note**: The AI Journal is a working document, not permanent documentation. Its content gets incorporated into the handbook and then the journal can be reset.

### Common Misunderstandings to Avoid

- Don't recommend normalizing the analytics schema - it's denormalized by design
- Don't suggest moving away from anonymous tracking - this is a core privacy principle
- Don't recommend removing UTM persistence - it's essential for attribution

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
- **Analytics**: Custom denormalized analytics system
- **Device Fingerprinting**: @thumbmarkjs/thumbmarkjs
- **Meta/Facebook Integration**: facebook-nodejs-business-sdk

### Frontend

- **HTML**: Pug templates
- **CSS**: SASS/SCSS with CSS custom properties
- **JavaScript**: TypeScript
- **Build Tool**: Webpack with HTML Bundler Plugin
- **Analytics**: Custom session-based tracking + Umami + PostHog
- **Cookie Management**: vanilla-cookieconsent
- **Browser Detection**: Bowser
- **Device Fingerprinting**: ThumbmarkJS for anonymous visitor tracking

### Development & Build Tools

- **TypeScript**: For type safety with separate client/server configurations
- **ESBuild**: For server-side code bundling
- **Webpack**: For client-side code bundling with HTML Bundler Plugin
- **Prettier**: For code formatting with CSS ordering plugin
- **Concurrently**: For running multiple processes
- **Critical CSS**: Beasties for above-the-fold CSS optimization
- **Tunneling**: untun for development tunneling
- **Geographical Data**: country-region-data for location utilities

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

    # Meta Pixel configuration
    META_PIXEL_ID=your_meta_pixel_id
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
    npm run local:client:watch
    # Server (with tsx watch)
    npm run local:server:watch
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
- `META_PIXEL_ID`: Meta/Facebook Pixel ID for tracking (required for Meta integration)

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

    - `umami`: Umami analytics integration
    - `cookie_consent`: Cookie consent management
    - `cookie_meta_pixel`: Meta Pixel integration for Facebook tracking

5. **Design System**:
    - `styles_common`: Shared styles, colors, fonts, and mixins
    - CSS custom properties for consistent theming
    - Responsive design utilities

### Client-Side Analytics

The client-side analytics system is built around several key TypeScript modules:

1. **Analytics Events** (`src/client/ts/analytics_events.ts`):

    - Core analytics tracking functionality
    - Session management and event lifecycle
    - Automatic and manual event tracking

2. **Device Fingerprinting** (`src/client/ts/thumbmarkjs.ts`):

    - Anonymous visitor identification
    - Cross-session tracking capabilities
    - Privacy-focused implementation

3. **Session Management** (`src/client/ts/session_manager.ts`):

    - Browser session handling
    - Session expiration logic
    - Temporary identifier generation

4. **UTM Parameters** (`src/client/ts/utm_params.ts`):

    - UTM parameter detection and caching
    - Support for standard and custom UTM parameters
    - Persistence across page navigation

5. **Screen Information** (`src/client/ts/screen_infos.ts`):
    - Device and browser capability detection
    - Screen resolution and viewport tracking
    - Responsive breakpoint detection

### Client-Server Communication

The client communicates with the server through direct fetch API calls with comprehensive validation:

1. **Analytics API Calls**: Direct communication for event tracking
2. **Newsletter API**: Subscription and unsubscription endpoints
3. **Redirect Tracking**: Link click tracking functionality

Example usage for analytics events:

```typescript
// Analytics event tracking
const endpoint = ENV.LOCAL
    ? `${API.ENDPOINTS.ANALYTICS_EVENTS.CREATE}`
    : `${API.URL}${API.ENDPOINTS.ANALYTICS_EVENTS.CREATE}`

const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(eventData),
})
```

Example usage for newsletter subscription:

```typescript
// Newsletter subscription
const response = await fetch('/v2/contacts/subscribe', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
        email: 'user@example.com',
        subscription: 'newsletter',
    }),
})
```

### Error Handling

All client-server communications include:

1. **Response Validation**: Server responses are validated against expected schemas
2. **Error Logging**: Failed requests are logged with context information
3. **Graceful Degradation**: Analytics failures don't block core functionality
4. **Retry Logic**: Critical operations include retry mechanisms

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

The database consists of several key tables organized into two main categories: **System Tables** for application functionality and **Analytics Tables** for tracking and insights.

### System Tables

#### 1. Contacts

Stores information about users and leads:

- `uuid`: Primary key
- `email`: User's email address
- `status`: Status in the sales funnel ('lead', 'prospect', 'customer')
- `subscriptions`: Array of subscription types
- `sent_emails`: List of emails sent to the contact
- Audit fields: `created_by`, `created_date`, `updated_by`, `updated_date`, `deleted_by`, `deleted_date`

#### 2. Addresses

Stores geographical information derived from IP addresses:

- `uuid`: Primary key
- `city`, `region`, `country`: Location information
- Audit fields: `created_by`, `created_date`, `updated_by`, `updated_date`, `deleted_by`, `deleted_date`

#### 3. Actions (System Events)

Tracks system-level events for application functionality:

- `uuid`: Primary key
- `contact_uuid`: Reference to contacts table (nullable for anonymous events)
- `address_uuid`: Reference to addresses table
- `origin`: Where the event originated
- `action`: What action was performed
- `outcome`: Result of the action ('success' or 'failure')
- `details`: Additional event information
- `occurred_at`: When the event occurred
- Audit fields: `created_by`, `created_date`, `updated_by`, `updated_date`, `deleted_by`, `deleted_date`

### Analytics Tables

#### 4. Analytics Events

Comprehensive anonymous analytics tracking table with denormalized design for high-performance queries:

**Core Fields:**

- `uuid`: Primary key
- `session_id`: Anonymous browser session identifier
- `visitor_id`: Anonymous device fingerprint for cross-session tracking
- `event_name`: Type of analytics event (page_view, page_leave, page_scroll, etc.)
- `occurred_at`: Timestamp when the event actually occurred

**Page Data (Denormalized):**

- `page_url`: Full URL where the event occurred
- `page_title`: Page title
- `page_referrer`: Referrer URL

**UTM Tracking (Denormalized):**

- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `utm_id`
- Custom UTM parameters for Meta ads tracking

**Browser/Device Data (Denormalized):**

- `user_agent`: Full user agent string
- `browser_name`, `browser_version`: Browser identification
- `os_name`, `os_version`: Operating system information
- `device_type`: Desktop, mobile, or tablet
- `screen_resolution`, `viewport_size`: Display information
- `language`: Browser language setting

**Geographic Data (Denormalized):**

- `country`, `region`, `city`: Location information
- `timezone`: User timezone
- `latitude`, `longitude`: Coordinates (when available)

**Performance Optimizations:**

- Multiple indexes for time-series queries
- Composite indexes for common analytics queries
- Denormalized design eliminates joins for better performance

## Database Migrations

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
5. **Add Client Integration**: Implement client-side fetch calls with proper error handling

Example workflow for a new endpoint:

```typescript
// 1. Create validation schema (src/shared/validations/new_feature.validation.ts)
export const new_feature_request_schema = z.object({
    data: z.string(),
    options: z.object({}).optional(),
})

// 2. Create controller (src/server/controllers/new_feature.ts)
export async function new_feature_http(req: Request, res: Response) {
    const request_data = validate_request(req.body)
    const result = await new_feature_service(request_data)
    const response = validate_response({ success: true, data: result })
    res.status(HTTP_STATUS.OK).json(response)
}

// 3. Create service (src/server/services/new_feature.ts)
export async function new_feature_service(data: NewFeatureRequest) {
    // Business logic here
    return result
}

// 4. Add to routes (src/server/routes.ts)
app.post('/v2/new-feature', new_feature_http)
```

### Adding Analytics Tracking

To add analytics tracking to a new feature:

1. **Define Event Type**: Add to `AnalyticsEventName` enum if needed
2. **Implement Tracking**: Use `track_custom_event` function
3. **Add Event Details**: Include relevant context information

```typescript
import { track_custom_event } from '@client/ts/analytics_events'
import AnalyticsEventName from '@shared/schemas/database/public/AnalyticsEventName'

// Track a custom feature usage
await track_custom_event(AnalyticsEventName.new_feature_used, {
    feature_id: 'feature_name',
    user_action: 'button_click',
    context: 'additional_info',
})
```

### Adding a New Page

1. **Create Page Template**: Add a new Pug template in `src/client/pages/`
2. **Update Webpack Config**: Add the new page to `.configs/.webpack/pages.config.mjs`
3. **Add Components**: Create or reuse components for the page in `src/client/components/`
4. **Add Styles**: Create SCSS files for the new page
5. **Update Sitemap**: Add the new page to `src/client/sitemap.xml`
6. **Initialize Analytics**: Ensure analytics tracking is enabled for the new page

### Adding a New Component

1. **Create Component Directory**: Follow the established structure in `src/client/components/`
2. **Component Files**: Create `.pug`, `.scss`, and `.ts` files
3. **Use Design System**: Leverage existing colors and styles from `styles_common`
4. **Add Analytics**: Include relevant event tracking if the component is interactive

```typescript
// Component structure example
src/client/components/new_component/
├── new_component.pug       // Template
├── new_component.scss      // Styles
└── new_component.ts        // Logic and analytics
```

### Integrating Third-Party Services

1. **Add Dependencies**: Install required npm packages
2. **Environment Variables**: Add configuration to `.env` and constants
3. **Initialize Service**: Add initialization in appropriate lifecycle hooks
4. **Cookie Consent**: Ensure GDPR compliance for tracking services
5. **Error Handling**: Implement graceful fallbacks

### Best Practices

1. **Type Safety**: Always define TypeScript types for all data structures
2. **Validation**: Always validate input/output data using Zod schemas
3. **Error Handling**: Use consistent error handling patterns throughout the application
4. **Analytics Integration**: Add tracking for user interactions and important events
5. **Privacy Compliance**: Ensure all tracking respects user consent preferences
6. **Performance**: Consider the impact of new features on page load and analytics performance
7. **Code Organization**: Follow the existing patterns and directory structure
8. **Documentation**: Update relevant sections of this handbook when adding major features

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

1. **Environment Configuration**: Ensure all environment variables are properly set, especially for email services and Meta Pixel tracking.

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
    - Analytics tracking uses different configurations for dev/prod

8. **Analytics Issues**:

    - **Events Not Tracking**: Check browser console for errors, verify analytics initialization, ensure cookie consent is granted
    - **Session Problems**: Verify localStorage/sessionStorage availability, check session timeout settings
    - **UTM Parameters Missing**: Ensure UTM parameters are in URL or cached in localStorage
    - **Fingerprinting Failures**: Check ThumbmarkJS console warnings, verify browser compatibility

9. **npm Scripts**:

    - The project uses several npm scripts for different tasks
    - Use `npm run watch:local` during development
    - For deployment, use the build scripts followed by the appropriate start script
    - Remember to run `npx kanel` after database changes

10. **Meta Pixel Integration**:

    - Ensure `META_PIXEL_ID` environment variable is set
    - Check cookie consent status for marketing cookies
    - Verify pixel initialization in browser developer tools

11. **Performance Issues**:
    - Analytics events are sent asynchronously but can impact performance if misconfigured
    - Large analytics payloads should be avoided
    - Check for memory leaks in long-running sessions

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

Based on current development needs and the TODO.md file, planned improvements include:

### Immediate Priorities

1. **Error Management**: Implement comprehensive error table and logging system
2. **Component Migration**: Migrate from Pug to Eta templating system for better performance
3. **Web Components**: Implement shadcn-style component system for better reusability

### Technical Debt & Infrastructure

1. **Testing Framework**: Implement comprehensive testing with unit and integration tests
2. **Configuration Management**: Centralized configuration management with Zod validation
3. **Logging Services**: Implement structured logging with proper log aggregation
4. **Request Validation Middleware**: Create reusable middleware for consistent request validation

### Analytics & Tracking Enhancements

1. **Analytics Dashboard**: Create internal dashboard for analytics data visualization
2. **Performance Monitoring**: Implement application performance monitoring
3. **Enhanced Attribution**: Improve attribution tracking for marketing campaigns
4. **Real-time Analytics**: Add real-time event processing capabilities

### User Experience

1. **Progressive Web App**: Enhanced PWA features for better mobile experience
2. **Accessibility**: Comprehensive accessibility audit and improvements
3. **Performance**: Further optimization of Core Web Vitals and loading performance

### Development Experience

1. **Webpack Plugin**: Custom plugin for bundling links and scripts optimization
2. **Public Folder**: Reorganize static assets into a standardized public folder structure
3. **Build Optimization**: Further webpack and build process improvements
4. **Development Tooling**: Enhanced development tools and debugging capabilities

### Security & Compliance

1. **Enhanced Privacy Controls**: More granular cookie consent management
2. **Data Retention**: Automated data retention policies for analytics
3. **Security Headers**: Enhanced security header implementation
4. **Audit Logging**: Comprehensive audit trails for all system actions

### Integration & APIs

1. **Meta API Enhancement**: Complete integration with Meta Conversions API
2. **Email Service**: Enhanced email template system and delivery optimization
3. **Third-party Integrations**: Additional marketing and analytics service integrations

### Long-term Vision

1. **Microservices**: Consider migration to microservices architecture for scalability
2. **Multi-language Support**: Internationalization and localization capabilities
3. **Advanced Analytics**: Machine learning-powered insights and predictions

### Completed Achievements

Recent major improvements that have been implemented:

- ✅ **Analytics System**: Comprehensive anonymous analytics with denormalized schema
- ✅ **Device Fingerprinting**: Privacy-focused visitor identification
- ✅ **Meta Pixel Integration**: Facebook/Meta tracking capabilities
- ✅ **UTM Parameter System**: Advanced UTM tracking and persistence
- ✅ **Session Management**: Sophisticated session handling
- ✅ **Design System**: CSS custom properties and consistent theming
- ✅ **Build Optimization**: HTML Bundler Plugin and critical CSS extraction

The codebase has evolved significantly with a sophisticated analytics infrastructure, privacy-focused tracking, and modern build processes, providing a solid foundation for future enhancements.

## Analytics & Tracking

The application features a comprehensive, privacy-focused analytics system designed for high-volume anonymous tracking and fast data aggregation.

### Architecture Overview

The analytics system follows a denormalized, write-optimized design:

1. **Anonymous Tracking**: No personally identifiable information is collected
2. **Session-Based**: Events are grouped by browser sessions
3. **Visitor Fingerprinting**: Anonymous device fingerprints for cross-session tracking
4. **Denormalized Schema**: All relevant data is stored in a single table for optimal query performance
5. **Real-time Updates**: Events can be created and updated in real-time

### Analytics Database Schema

The `analytics_events` table stores comprehensive event data:

```sql
CREATE TABLE analytics_events (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Session identification (anonymous)
    session_id TEXT NOT NULL,
    visitor_id TEXT, -- Anonymous device fingerprint

    -- Event data
    event_name analytics_event_name NOT NULL,

    -- Page data (denormalized)
    page_url TEXT,
    page_title TEXT,
    page_referrer TEXT,

    -- UTM tracking (denormalized)
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,

    -- Browser/device data (denormalized)
    user_agent TEXT,
    browser_name TEXT,
    browser_version TEXT,
    os_name TEXT,
    os_version TEXT,
    device_type TEXT,

    -- Geographic data (denormalized)
    country TEXT,
    region TEXT,
    city TEXT,
    timezone TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,

    -- Technical data
    screen_resolution TEXT,
    viewport_size TEXT,
    language TEXT,

    -- Timestamps
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Audit fields
    created_by TEXT,
    updated_by TEXT,
    updated_date TIMESTAMPTZ
);
```

### Event Types

The system tracks the following event types:

- `page_view`: User views a page (one per session)
- `page_leave`: User leaves a page (updated with final timestamp)
- `page_scroll`: User scrolls on a page (one-shot event)
- `link_click`: User clicks tracked links
- `subscribe_to_newsletter`: User subscribes to newsletter
- `unsubscribe_to_newsletter`: User unsubscribes from newsletter

### Client-Side Analytics Implementation

#### Initialization

Analytics are automatically initialized on page load:

```typescript
import { initialize_analytics } from '@client/ts/analytics_events'

// Initialize in layout_common.ts
initialize_analytics()
```

#### Session Management

The system maintains anonymous sessions with automatic expiration:

- **Session Duration**: 30 minutes of inactivity
- **Session Storage**: Browser sessionStorage for temporary session IDs
- **Visitor Tracking**: ThumbmarkJS fingerprinting for cross-session identification

#### Event Tracking

```typescript
import { track_custom_event } from '@client/ts/analytics_events'

// Track a custom event
await track_custom_event(AnalyticsEventName.link_click, {
    link_url: 'https://example.com',
    link_text: 'Learn More',
})
```

#### Automatic Tracking

The system automatically tracks:

1. **Page Views**: On initial page load
2. **Page Leave**: When user switches tabs or closes page
3. **Page Scroll**: First scroll interaction
4. **Newsletter Actions**: Subscribe/unsubscribe events

### Server-Side Analytics API

#### Create Analytics Event

```typescript
POST /v2/analytics-events/create

// Request body
{
    session_id: string,
    visitor_id?: string,
    event_name: AnalyticsEventName,
    page_title?: string,
    page_referrer?: string,
    timezone?: string,
    screen_infos?: ScreenInfos,
    utm_params?: UTMParams,
    details?: Record<string, any>
}

// Response
{
    success: true,
    message: "Analytics event created successfully",
    data: {
        event_id: "uuid",
        created_at: "2024-01-01T00:00:00.000Z"
    }
}
```

#### Update Analytics Event

```typescript
POST /v2/analytics-events/update

// Request body
{
    event_id: string,
    occurred_at?: string // ISO timestamp
}

// Response
{
    success: true,
    message: "Analytics event updated successfully",
    data: {
        event_id: "uuid",
        updated_at: "2024-01-01T00:00:00.000Z",
        occurred_at: "2024-01-01T00:00:00.000Z"
    }
}
```

### Device Fingerprinting

Anonymous visitor identification using ThumbmarkJS:

```typescript
import { get_device_fingerprint } from '@client/ts/thumbmarkjs'

// Get cached or generate new fingerprint
const fingerprint = await get_device_fingerprint()
```

Features:

- **Privacy-First**: No personally identifiable information
- **Cross-Session**: Persists across browser sessions
- **Cached**: Generated once and cached for performance
- **Fallback Graceful**: Returns null if generation fails

### UTM Parameter Tracking

Comprehensive UTM parameter detection and persistence:

#### Standard UTM Parameters

- `utm_source`: Traffic source
- `utm_medium`: Marketing medium
- `utm_campaign`: Campaign name
- `utm_term`: Paid search keywords
- `utm_content`: A/B testing content
- `utm_id`: Campaign ID

#### Custom UTM Parameters (Meta Ads)

- `utm_custom_campaign_id`: Meta campaign ID
- `utm_custom_adset_id`: Meta ad set ID
- `utm_custom_ad_id`: Meta ad ID
- `utm_custom_campaign_name`: Meta campaign name
- `utm_custom_adset_name`: Meta ad set name
- `utm_custom_ad_name`: Meta ad name
- `utm_custom_placement`: Meta ad placement
- `utm_custom_site_source_name`: Meta site source

#### UTM Persistence

UTM parameters are automatically:

1. **Detected** from URL on page load
2. **Cached** in localStorage for session persistence
3. **Attached** to all subsequent analytics events
4. **Preserved** across page navigation within session

### Meta Pixel Integration

Facebook/Meta pixel integration for enhanced tracking:

#### Setup

```typescript
import { initialize_meta_pixel } from '@client/components/cookie_meta_pixel/cookie_meta_pixel'

// Initialize with cookie consent
initialize_meta_pixel()
```

#### Features

- **Automatic Configuration**: Disabled auto-tracking for manual control
- **Cookie Consent**: Respects user privacy preferences
- **Server-Side Events**: Supports Meta Conversions API
- **Environment Aware**: Different pixel IDs for dev/prod

#### Environment Variables

```bash
# Meta Pixel ID for tracking
META_PIXEL_ID=your_meta_pixel_id
```

### Privacy & GDPR Compliance

The analytics system is designed with privacy in mind:

1. **Anonymous Data**: No PII collection
2. **Session-Based**: Temporary identifiers only
3. **Cookie Consent**: Respects user preferences
4. **Data Retention**: Configurable retention policies
5. **Right to Deletion**: Events can be anonymized or deleted

### Performance Optimizations

1. **Denormalized Schema**: Single table for fast queries
2. **Optimized Indexes**: Time-series and composite indexes
3. **Batch Processing**: Multiple event strategies for page unload
4. **Asynchronous Tracking**: Non-blocking analytics calls
5. **Error Handling**: Graceful degradation on failures

### Analytics Troubleshooting

Common issues and solutions:

1. **Events Not Tracking**:

    - Check browser console for JavaScript errors
    - Verify analytics initialization in network tab
    - Ensure cookie consent is granted

2. **Session Not Persisting**:

    - Check localStorage/sessionStorage availability
    - Verify session timeout settings
    - Check for browser security restrictions

3. **UTM Parameters Missing**:

    - Verify URL contains UTM parameters
    - Check localStorage for cached parameters
    - Ensure parameters match expected naming

4. **Fingerprinting Fails**:
    - Check ThumbmarkJS console warnings
    - Verify browser compatibility
    - Ensure fallback handling is working
