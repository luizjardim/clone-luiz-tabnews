import { config } from "dotenv";
const result = config({ path: ".env.development", quiet: true });
if (result.error) {
  console.error("Error loading .env.development file:", result.error.message);
}
