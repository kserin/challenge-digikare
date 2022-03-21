# challenge-digikare

## Build (with Docker)

### Requirements

- docker
- docker-compose

### Steps

```shell
# Build app image (will run lint, test and build)
docker-compose build

# Start
docker-compose up --detach --remove-orphans
```

## Build (without Docker)

### Requirements

- npm / node
- mongodb configured and started

### Steps

The [configuration file](src/application.properties) should be adapted to your mongodb database.

```shell
# Build app in dist folder
npm run build

# Lint
npm run lint

# Tests
npm run test

# Start
npm start
```

## Project structure

    .
    ├── dist                            # Compiled files after build (not commited)
    ├── src                             # Source files
    │   ├── dao                         # Data Access Object layer
    │   ├── domain                      # Domain objects
    │   ├── routers                     # Express routers API
    │   ├── services                    # Service layer
    │   ├── app.ts                      # Application entrypoint
    │   └── application.properties      # Application configuration file
    └── test                            # Unit test files
