import { app } from "./src/app.js";
import { env } from "./src/config/env.js";
import { logger } from "./src/config/logger.js";
import { initDataPersistence } from "./src/data/persistence.js";

async function bootstrap() {
  try {
    if (env.persistenceEnabled) {
      await initDataPersistence();
      logger.info("PostgreSQL persistence is enabled.");
    } else {
      logger.info("PostgreSQL persistence is disabled; using in-memory data only.");
    }

    app.listen(env.port, () => {
      logger.info(`HMS API running on port ${env.port}`);
    });
  } catch (error) {
    logger.error(`Backend bootstrap failed: ${error.message}`);
    process.exit(1);
  }
}

bootstrap();
