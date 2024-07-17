import { sequelize } from "../database/db.js";
import { DataTypes } from "sequelize";

export const suppliersModel = sequelize.define("supplier", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rif: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.BIGINT,
    defaultValue: 1,
  }
},
{
  timestamps: false,
});
