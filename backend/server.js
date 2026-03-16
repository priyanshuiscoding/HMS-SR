import { app } from "./src/app.js";
import { env } from "./src/config/env.js";
import { logger } from "./src/config/logger.js";

app.listen(env.port, () => {
  logger.info(`HMS API running on port ${env.port}`);
});
