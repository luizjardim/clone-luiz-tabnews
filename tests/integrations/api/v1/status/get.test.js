import orquestrator from "tests/orquestrator.js";

beforeAll(async () => {
  await orquestrator.waitForAllServices();
});
describe("GET to api/v1/status", ()=> {
describe("Anonymous user",()=>{
test("Retrieving the current system status", async () => {
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
  expect(responseBody.dependencies.database.connections.used).toBeGreaterThan(0);
  expect(responseBody.dependencies.database.connections.used).toBeLessThanOrEqual(
    responseBody.dependencies.database.connections.max,
  );
  expect(responseBody.dependencies.database.name).toBeDefined();
  expect(responseBody.dependencies.database.version).toBeDefined();
});
})
})