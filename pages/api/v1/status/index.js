import database from "infra/database.js";
async function status(request, response) {
  const updatedAt = new Date().toISOString();
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const databaseName = process.env.POSTGRES_DB;
    const versionResult = await dbClient.query("SHOW server_version;");
    const maxConnections = await dbClient.query("SHOW max_connections;");
    const usedConnections = await dbClient.query({
      text: "select count(*)::int from pg_stat_activity where datname= $1",
      values: [databaseName],
    });
    const dbNameResult = await dbClient.query("SELECT current_database();");
    response.status(200).json({
      updated_at: updatedAt,
      dependencies: {
        database: {
          status: "up",
          name: dbNameResult.rows[0].current_database,
          version: versionResult.rows[0].server_version,
          connections: {
            max: Number(maxConnections.rows[0].max_connections),
            used: usedConnections.rows[0].count,
          },
        },
      },
    });
  } catch (error) {
    response.status(200).json({
      updated_at: updatedAt,
      database: {
        status: "down",
      },
    });
  } finally {
    if (dbClient) {
      await dbClient.end();
    }
  }
}
export default status;
