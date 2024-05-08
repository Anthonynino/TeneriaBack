import { sequelize } from "../database/db.js";
import { DataTypes } from "sequelize";

export const categoryModel = sequelize.define("categories", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
