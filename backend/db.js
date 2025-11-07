import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL + "?sslmode=require";

const sql = postgres(connectionString, {
  ssl: "require",
});

export default sql;