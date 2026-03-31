import pkg from "node-pg-migrate";
const migrationRunner = pkg.default || pkg;
import { join } from "node:path";
import database from "infra/database";
export default async function migrations(request, response) {
  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(request.method)) {
    return response.status(405).json({
      error: `Method "${request.method}" not allowed`,
    });
  }

  let dbClient;
  let responseStatusCode = 500;
  let responseBody = { error: "Internal Server Error" };
  try {
    dbClient = await database.getNewClient();
    const defaultMigrationOptions = {
      dbClient: dbClient,
      dryRun: true,
      dir: join("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    };
    if (request.method === "GET") {
      const pendingMigrations = await migrationRunner(defaultMigrationOptions);
      responseStatusCode = 200;
      responseBody = pendingMigrations;
    }
    if (request.method === "POST") {
      const migrateMigrations = await migrationRunner({
        ...defaultMigrationOptions,
        dryRun: false,
      });

      if (migrateMigrations.length > 0) {
        responseStatusCode = 201;
        responseBody = migrateMigrations;
      } else {
        responseStatusCode = 200;
        responseBody = migrateMigrations;
      }
    }
  } catch (error) {
    console.error(error);
    responseBody = {
      error: error.message,
    };
  } finally {
    if (dbClient) {
      await dbClient.end();
    }
  }

  return response.status(responseStatusCode).json(responseBody);
}
