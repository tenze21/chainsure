import { testConnection } from "@/config/database";
import env from "@/config/env";
import app from "./app";

async function startServer() {
  try {
    // test database connection
    testConnection();

    app.listen(env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Chainsure API\nEnvironment: ${env.NODE_ENV.padEnd(24)}\nPort: ${env.PORT.toString().padEnd(32)}\nURL: http://localhost:${env.PORT.toString().padEnd(18)}`);
    });
  }
  catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
}

startServer();
