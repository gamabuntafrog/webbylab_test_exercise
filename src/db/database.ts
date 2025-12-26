import { Sequelize, Options } from "sequelize";
import config from "@config";
import logger from "@utilities/logger";

const baseOptions: Options = {
  dialect: "sqlite",
  storage: config.DATABASE_PATH,
  logging: config.isDevelopment()
    ? (query) => logger.debug({ query }, "sequelize.query")
    : false,
};

async function connectDB(): Promise<Sequelize> {
  const sequelize = new Sequelize(baseOptions);

  try {
    await sequelize.authenticate();
    logger.info("SQLite connected successfully");

    return sequelize;
  } catch (error) {
    logger.error({ error }, "SQLite connection error");
    process.exit(1);
  }
}

// Connect to database and export the Sequelize instance
const sequelize = await connectDB();

export default sequelize;
