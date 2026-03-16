import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "change_me_to_a_long_random_secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "change_me_to_a_different_long_random_secret",
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES || "8h",
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES || "30d"
};
