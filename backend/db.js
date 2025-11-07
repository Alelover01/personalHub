import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

// 🔹 Forza SSL e IPv4 per Supabase
const sql = postgres(connectionString + "?sslmode=require", {
  ssl: "require",
  hostname: "db.juhfnvmfoiikdnoizors.supabase.co", // il tuo host supabase
  prepare: false,
  connection: {
    host: "db.juhfnvmfoiikdnoizors.supabase.co", // forza IPv4
    port: 5432,
  },
});

export default sql;