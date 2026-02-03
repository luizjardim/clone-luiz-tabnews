import { config } from "dotenv";
const result = config({ path: ".env.development" });
if (result.error) {
  console.error("Error loading .env.development file:", result.error.message);
}
