/* eslint-disable no-console */
import { Sequelize } from "sequelize";
import env from "./env";

export const sequelize = new Sequelize({
  dialect: "postgres",
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  logging: env.NODE_ENV === "development" ? console.log : false,
  // Connection pool settings
  pool: {
    max: 5, // Maximum number of connections
    min: 0, // Minimum number of connections
    acquire: 30000, // Maximum time (ms) to get connection before throwing error
    idle: 1000, // Maximum time (ms) a connection can be idle before release.
  },

  // Model definition settings
  define: {
    // Use sanke_case for database columns
    underscored: true,
    // Automatically add createdAt and UpdatedAt timestamps
    timestamps: true,
    // Don't pluralize table names
    freezeTableName: true,
  },
});

export async function testConnection(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log("Database connection successful");
  }
  catch (err) {
    console.error("Error connecting to the database:", err);
  }
}

/**
 * Sync database models (development only!)
 * In production, use migrations instead
 */
export async function syncDatabase(): Promise<void> {
  if (env.NODE_ENV === "development") {
    try {
      await sequelize.sync({ alter: true });
      console.log("Database models synchronized");
    }
    catch (error) {
      console.error("Error synchronizing database: ", error);
    }
  }
}
