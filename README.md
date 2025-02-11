# Next Tech Radar

An application used to generate interactive radars, inspired by [thoughtworks.com/radar](http://thoughtworks.com/radar).

## Demo

You can see the original BYOR in action at https://radar.thoughtworks.com. If you plug in [this data](https://docs.google.com/spreadsheets/d/1GBX3-jzlGkiKpYHF9RvVtu6GxSrco5OYTBv9YsOTXVg/edit#gid=0) you'll see [this visualization](https://radar.thoughtworks.com/?sheetId=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1GBX3-jzlGkiKpYHF9RvVtu6GxSrco5OYTBv9YsOTXVg%2Fedit%23gid%3D0).

## How To Use

The format of the JSON is an array of objects with the the fields: `name`, `ring`, `quadrant`, `status`, and `description`.

The `status` column accepts the following case-insensitive values :

- `New` - appearing on the radar for the first time
- `Moved In` - moving towards the center of the radar
- `Moved Out` - moving towards the edge of the radar
- `No Change` - no change in position

An example:

```json
[
  {
    "name": "Composer",
    "ring": "adopt",
    "quadrant": "tools",
    "status": "New",
    "description": "Although the idea of dependency management ..."
  },
  {
    "name": "Canary builds",
    "ring": "trial",
    "quadrant": "techniques",
    "status": "No Change",
    "description": "Many projects have external code dependencies ..."
  },
  {
    "name": "Apache Kylin",
    "ring": "assess",
    "quadrant": "platforms",
    "status": "New",
    "description": "Apache Kylin is an open source analytics solution ..."
  },
  {
    "name": "JSF",
    "ring": "hold",
    "quadrant": "languages & frameworks",
    "status": "No Change",
    "description": "We continue to see teams run into trouble using JSF ..."
  }
]
```

### More complex usage

The application uses [webpack](https://webpack.github.io/) to package dependencies and minify all .js and .scss files.

To specify custom ring and/or quadrant names, add the following environment variables with the desired values.

```
export RINGS='["Adopt", "Trial", "Assess", "Hold"]'
export QUADRANTS='["Techniques", "Platforms", "Tools", "Languages & Frameworks"]'
```

## Development notes

### Local Development Setup

Create a `.env` file based on the following content:

```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=****
CLERK_SECRET_KEY=****

# PostgreSQL
DATABASE_URL=postgresql://radar:password@localhost/radar

# NOTE: The following is used by the docker compose file for local development only
DB_NAME=radar
DB_USER=radar
DB_PASS=****
```

Run the additional services required in the development, including database, using the following command:

```bash
docker compose up
```

### Docker Container Test

The following can be used to build and test the container locally.

```bash
docker build -t ghcr.io/stever/next-tech-radar .
docker run -p 3000:3000 ghcr.io/stever/next-tech-radar
```

### Local Database Setup

When starting the database for the first time using the docker compose file in the root of the repository,
the following command can be used to create the database using migrations.

```bash
npx prisma migrate dev
```

### Local Database Changes

Change the database schema by modifying the `schema.prisma` file, then run the following command to generate a new migration.

```bash
npx prisma migrate dev --name <migration-name>
```

When the changes are deployed to production, the migrations will be automatically applied.

#### Manual Migration

The following will create a new migration file but not apply it - so it can be managed manually:

```bash
npx prisma migrate dev --create-only --name <migration-name>
```

Then apply with:

```bash
npx prisma migrate deploy
```

#### Migration Verification

```bash
npx prisma migrate status
```

```bash
npx prisma validate
```

```bash
npx prisma migrate dev --create-only --name check_schema_alignment
```

Inspect the new migration file. Ideally, it should not require any changes, and the migration can simply be deleted.

## Install React Components from shadcn

https://ui.shadcn.com/docs/installation/next

```bash
npx shadcn@latest add button
```
