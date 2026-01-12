test("GET to apiv1/status should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);

  const responseBody = await response.json();
  const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
  expect(responseBody.updated_at).toEqual(parsedUpdatedAt);
  expect(responseBody.dependencies.database.status).toBeDefined();
  expect(responseBody.dependencies.database).toBeDefined();
  expect(responseBody.dependencies.database.connections).toBeDefined();
  expect(typeof responseBody.dependencies.database.connections.max).toBe(
    "number",
  );
  expect(typeof responseBody.dependencies.database.connections.used).toBe(
    "number",
  );
  expect(responseBody.dependencies.database.connections.max).toEqual(100);
  expect(responseBody.dependencies.database.connections.used).toEqual(1);
  expect(responseBody.dependencies.database.name).toBeDefined();
  expect(responseBody.dependencies.database.version).toBeDefined();
});
