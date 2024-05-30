import { sequelize } from "../database/db.js";
import { DataTypes } from "sequelize";

export const categoryModel = sequelize.define("categories", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status:{
    type: DataTypes.BIGINT,
    defaultValue: 1,
  }
},
{
  timestamps: false,
});
