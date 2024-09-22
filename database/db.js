import Sequelize from "sequelize";

export const sequelize = new Sequelize(
  "teneria", // db name,
  "postgres", // username
  "leo2005", // password
  {
    host: "localhost",
    dialect: "postgres",
    logging: false,
  }
);
