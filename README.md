# Asset Manager Backend

Enterprise backend service for asset management, built on NestJS with Prisma ORM and PostgreSQL, integrated with Azure Key Vault, Azure Blob Storage, and Azure Communication Services.

## Table of Contents

- [Overview](#overview)
- [Core Architecture](#core-architecture)
- [Technical Achievements](#technical-achievements)
- [Deployment](#deployment)
- [Configuration](#configuration)
- [License](#license)

## Overview

This repository contains the backend service powering the Asset Manager platform. The service is designed for containerized deployment, cloud-native secret management, and resilient boot-time initialization in environments where configuration is sourced asynchronously from external secret stores.

## Core Architecture

### Application Stack

| Layer | Technology |
|---|---|
| Framework | NestJS (TypeScript) |
| ORM | Prisma |
| Database | PostgreSQL |
| Secret Management | Azure Key Vault (`@azure/keyvault-secrets`) |
| Object Storage | Azure Blob Storage |
| Email / Messaging | Azure Communication Services |
| Container Registry | Docker Hub |

### Container Image

The application image is published to Docker Hub under the following repository path:

```
mohamedlaajimi123/asset-manager-backend:latest
```

### Orchestration

Deployment is fully controlled through a local `docker-compose.yml` file. All services required to run the ecosystem — the backend API and the PostgreSQL instance — are defined declaratively and launched through a single command in detached mode.

```yaml
services:
  # 1. existing Postgres service
  postgres:
    image: postgres:15-alpine
    container_name: nest_postgres_db
    environment:
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypassword
      POSTGRES_DB: asset_management_db
    ports:
      - "5433:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  # 2. NestJS Application service
  api:
    image: mohamedlaajimi123/asset-manager-backend:latest
    container_name: nest_api_service
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - postgres
    restart: always

volumes:
  postgres_data:
```

## Technical Achievements

### Asynchronous Secret Loading

The application integrates `@azure/keyvault-secrets` to retrieve critical environment parameters directly from Azure Key Vault during application initialization. Secrets are fetched concurrently using `Promise.allSettled`, allowing the application to issue all secret retrieval requests in parallel rather than sequentially. Successfully resolved secrets are mapped directly onto the process environment variables consumed by the rest of the application, while individual retrieval failures are handled without halting the entire boot sequence.

Following the configuration layer refactoring, individual configuration factories — such as `JwtConfig` and `MailConfig` — and internal services now extract their required parameters directly from `process.env`, rather than through a centralized `ConfigService`. This satisfies strict separation of concerns: each factory and service is responsible only for reading the specific environment variables it depends on, with no shared configuration abstraction coupling unrelated parts of the application together.

This approach minimizes application startup latency, provides fault isolation (a failure to resolve any single secret does not necessarily block the resolution of the others), and keeps configuration consumption decoupled at the point of use.

### Defensively Patched JWT Strategy

An early implementation of the authentication layer produced a boot-up crash loop. The root cause was a race condition between synchronous initialization of the `passport-jwt` strategy and the asynchronous resolution of cloud-sourced configuration values, including the JWT signing secret.

The issue was resolved by refactoring `jwt.strategy.ts` to use a dynamic `secretOrKeyProvider` callback in place of a statically supplied secret. This defers the secret key lookup performed by `passport-jwt` until an actual HTTP request reaches the route guard, rather than requiring the secret to be available at module instantiation time. As a result:

- The application no longer depends on Azure Key Vault resolution completing before the NestJS module graph finishes bootstrapping.
- Authentication requests received prior to full configuration resolution are deferred and validated correctly once the secret becomes available, rather than causing an application-level failure.
- The crash loop caused by premature secret access has been eliminated.

### Extended Azure Services

- **Azure Blob Storage**: Used as the primary application storage layer for asset files and related binary content.
- **Azure Communication Services**: Used as the core email routing mechanism for transactional and system-level messaging.

## Deployment

Deployment of the entire ecosystem is reduced to a single command, executed from the directory containing `docker-compose.yml`:

```bash
docker compose up -d
```

This command performs the following:

1. Pulls the `mohamedlaajimi123/asset-manager-backend:latest` image from Docker Hub if not already present locally.
2. Provisions the `nest_postgres_db` container, exposing PostgreSQL on host port `5433`, and attaches its persistent `postgres_data` volume.
3. Starts the `nest_api_service` container, exposing the NestJS API on host port `3000`, loading runtime configuration from the local `.env` file via `env_file`.
4. Ensures the `api` service starts after `postgres` via `depends_on`, and applies `restart: always` to both services for resilience across host reboots or container failures.
5. Leaves the backend service to complete its own internal bootstrap sequence, including asynchronous secret loading from Azure Key Vault.

No additional manual steps are required to bring the stack online.

## Configuration

The `api` service loads its runtime configuration from a local `.env` file, referenced in `docker-compose.yml` via `env_file`. This file must be present alongside `docker-compose.yml` prior to running `docker compose up -d`, and is expected to define at minimum the following variables:

| Variable | Description |
|---|---|
| `AZURE_KEYVAULT_RESOURCEENDPOINT` | Resource endpoint URI of the Azure Key Vault instance |
| `AZURE_CLIENT_ID` | Azure AD application client ID |
| `AZURE_CLIENT_SECRET` | Azure AD application client secret |
| `AZURE_TENANT_ID` | Azure AD tenant ID |

`DATABASE_URL` is intentionally not part of the local `.env` file. It is now managed exclusively inside Azure Key Vault and resolved at application boot, removing the database connection string from local and containerized configuration surfaces entirely.

Secrets stored in Azure Key Vault are resolved asynchronously at application boot, as described in [Asynchronous Secret Loading](#asynchronous-secret-loading), and are mapped directly onto the process environment variables consumed by the relevant configuration factories and services. Any values also present in `.env` are made available to the container at startup; Key Vault resolution supplements these for all secrets that are not intended to live in local configuration.

The `postgres` service itself is configured directly through the `environment` block in `docker-compose.yml` (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`) and does not require a `.env` file.

### Expected Azure Key Vault Secret Keys

The secret-loading routine iterates over a fixed set of secret names when querying Azure Key Vault. The following keys are expected to exist in the vault, using the exact naming convention below:

| Key Vault Secret Name | Purpose |
|---|---|
| `DATABASE-URL` | PostgreSQL connection string used by Prisma |
| `JWT-SECRET` | Signing secret consumed by the JWT strategy via `secretOrKeyProvider` |
| `AZURE-STORAGE-CONNECTION-STRING` | Connection string for Azure Blob Storage |
| `AZURE-CONTAINER-NAME` | Target Blob Storage container name for application assets |
| `AZURE-EMAIL-CONNECTION-STRING` | Connection string for Azure Communication Services email routing |
| `EMAIL-FROM-ADDRESS` | Sender address used for outbound transactional email |

These names use hyphen-separated casing, consistent with standard Azure Key Vault secret naming constraints, and are mapped by the loader onto their corresponding underscore-cased `process.env` variables consumed throughout the application.

## License

```
MIT License

Copyright (c) 2026 Asset Manager Backend Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```