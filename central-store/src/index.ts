import app from "./app";
import { config } from "./config/config";
import { Database } from "./config/database";
import dotenv from "dotenv"

dotenv.config()
const PORT = Number(config.port) || 3000;
async function startServer() {
  try {

    const db = Database.getInstance();
    await db.$connect();
    app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1); 
  }
}

startServer();
