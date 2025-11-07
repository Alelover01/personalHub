import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

// Forza IPv4 e SSL (necessario su Render + Supabase)
const sql = postgres(process.env.DATABASE_URL, {
  ssl: "require",
  hostname: process.env.DB_HOST || undefined,
  connection: {
    host: "supabase", // placeholder, sarà ignorato se la connessione è diretta
  },
  onnotice: () => {}, // ignora notifiche Postgres
});

export default sql;
