import Sequelize from "sequelize";

export const sequelize = new Sequelize(
  "teneria", // db name,
  "postgres", // username
  "admin", // password
  {
    host: "localhost",
    dialect: "postgres",
    logging: false,
  }
);
