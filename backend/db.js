import postgres from "postgres";
import dotenv from "dotenv";
import dns from "dns/promises";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

const { address } = await dns.lookup("db.juhfnvmfoiikdnoizors.supabase.co", { family: 4 });

const sql = postgres({
  host: address,
  port: 5432,
  user: "postgres",
  password: "GubUW7Z03c9HWcf2",
  database: "postgres",
  ssl: "require",
});

export default sql;