import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  frontendUrls: String(process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "change_me_to_a_long_random_secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "change_me_to_a_different_long_random_secret",
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES || "8h",
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES || "30d",
  persistenceEnabled: String(process.env.PERSISTENCE_ENABLED || "true").toLowerCase() === "true",
  databaseUrl: process.env.DATABASE_URL || "",
  dbHost: process.env.DB_HOST || "localhost",
  dbPort: Number(process.env.DB_PORT || 5432),
  dbName: process.env.DB_NAME || "hms_db",
  dbUser: process.env.DB_USER || "hms_user",
  dbPassword: process.env.DB_PASSWORD || "hms_password",
  dbSsl: String(process.env.DB_SSL || "false").toLowerCase() === "true"
};
