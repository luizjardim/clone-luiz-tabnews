import database from "infra/database.js";
async function status(request, response) {
  const updatedAt = new Date().toISOString();
  try {
    const databaseName = process.env.POSTGRES_DB;
    const versionResult = await database.query("SHOW server_version;");
    const maxConnections = await database.query("SHOW max_connections;");
    const usedConnections = await database.query({
      text: "select count(*)::int from pg_stat_activity where datname= $1",
      values: [databaseName],
    });
    const dbNameResult = await database.query("SELECT current_database();");
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
  }
}
export default status;
