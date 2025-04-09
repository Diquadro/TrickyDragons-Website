# 📌 Project Tricky Dragons - Web Server

This repository contains the code for **Tricky Dragons' web server**.

## 🛠️ Technologies Used

### 🚀 Deployment & Hosting

The application is hosted on **[Render](https://render.com/)**

### 💻 Codebase

The project follows a **feature-based architecture**, ensuring modularity and maintainability.

- **Website - www**
    - **Bundler**: Webpack.
    - **Routing**: Via configuration file.
    - **Preprocessors**
        - **HTML**: Pug – Enables templating for dynamic HTML generation.
        - **CSS**: SCSS – Provides enhanced styling capabilities with variables, nesting, and mixins.
        - **JavaScript**: TypeScript – Ensures type safety and better maintainability.
    - **Utilities**
        - **Analytics**: [Umami](https://umami.is/) – A privacy-focused, self-hosted analytics tool to track user behavior without compromising privacy.
        - **Cookie Banner**: [Orest Bida / CookieConsent](https://github.com/orestbida/cookieconsent) – Ensures GDPR compliance for cookies and user consent management.
- **Server - api**
    - **Engine**: Node.js
    - **Libraries**
        - **PostgreSQL client**: [postgres.js](https://github.com/porsager/postgres?tab=readme-ov-file#connection)
        - **DB Types**: [kanel](https://kristiandupont.github.io/kanel/)
        - **GEOIP**: [geoip-lite](https://github.com/geoip-lite/node-geoip)
        - **API VALIDATION**: [zod](https://zod.dev/)
    - **Structure**:
        - **Routes**: Defines API endpoints
        - **Controller**: Handles request and response
        - **Service**: Business logic
        - **Model**: Handles databese interactions
- **Database**
    - **Engine**: PostgreSQL
    - **Migrations**: [postgres-shift](https://github.com/porsager/postgres-shift)
- **Emails**
    - **Visual Email Builder**:
        - [Ecosend](https://ecosend.io/free-email-builder/)
        - [Sendune](https://designer.sendune.com/)

### 🎨 Design & Architecture

The application follows a structured design process, separating for clarity and maintainability.

- **Flow Diagram**: [Diagrams.net](https://app.diagrams.net/) – Used for designing **User Flow** and **Application Flow**
- **Schema Design**: [DBML](https://dbdiagram.io/) – Entity-Relationship Diagram (ERD) structured using DBML for better visualization and documentation.

### 📊 Telemetry

- **Telemetry**: 🔜 TODO (Potential integration with OpenTelemetry for monitoring and performance tracking).
